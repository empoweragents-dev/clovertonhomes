import { db } from "../../config/database.js";
import {
    documentTemplates, templateSections, templateItems,
    DocumentTemplate, TemplateSection, TemplateItem,
} from "../../db/schema/index.js";
import { eq, and, asc, sql, inArray } from "drizzle-orm";
import { randomUUID } from "crypto";
import slugify from "slugify";
import { insertReturning, updateReturning } from "../../db/helpers.js";
import { toHtml } from "./markup.js";
import { renumber } from "./numbering.js";

/**
 * Master templates (§7). A tender copies one of these into its own tables at
 * creation; nothing here is ever read when rendering an existing document, which is
 * what lets staff edit a template without altering tenders already issued.
 */

export interface TemplateTree {
    template: DocumentTemplate;
    sections: (TemplateSection & { items: TemplateItem[] })[];
}

export const templateService = {
    async getAll(includeInactive = false): Promise<(DocumentTemplate & { sectionCount: number; itemCount: number })[]> {
        const templates = await db.select().from(documentTemplates).orderBy(asc(documentTemplates.name));
        const visible = includeInactive ? templates : templates.filter((t) => t.isActive);
        if (!visible.length) return [];

        const ids = visible.map((t) => t.id);
        const sections = await db.select({ id: templateSections.id, templateId: templateSections.templateId })
            .from(templateSections).where(inArray(templateSections.templateId, ids));
        const items = await db.select({ id: templateItems.id, templateId: templateItems.templateId })
            .from(templateItems).where(inArray(templateItems.templateId, ids));

        return visible.map((t) => ({
            ...t,
            sectionCount: sections.filter((s) => s.templateId === t.id).length,
            itemCount: items.filter((i) => i.templateId === t.id).length,
        }));
    },

    /** Full template with sections and their items, ordered ready for display. */
    async getTree(id: string): Promise<TemplateTree | undefined> {
        const [template] = await db.select().from(documentTemplates).where(eq(documentTemplates.id, id));
        if (!template) return undefined;

        const sections = await db.select().from(templateSections)
            .where(eq(templateSections.templateId, id))
            .orderBy(asc(templateSections.sortOrder));

        const items = await db.select().from(templateItems)
            .where(eq(templateItems.templateId, id))
            .orderBy(asc(templateItems.sortOrder));

        return {
            template,
            sections: sections.map((s) => ({ ...s, items: items.filter((i) => i.sectionId === s.id) })),
        };
    },

    async getBySlug(slug: string): Promise<DocumentTemplate | undefined> {
        const [row] = await db.select().from(documentTemplates).where(eq(documentTemplates.slug, slug));
        return row;
    },

    async getDefault(docType = "tender"): Promise<DocumentTemplate | undefined> {
        const rows = await db.select().from(documentTemplates)
            .where(and(eq(documentTemplates.docType, docType as any), eq(documentTemplates.isActive, true)));
        return rows.find((t) => t.isDefault) ?? rows[0];
    },

    async create(data: Partial<DocumentTemplate>, userId?: string): Promise<DocumentTemplate> {
        return insertReturning<DocumentTemplate>(documentTemplates, {
            docType: data.docType ?? "tender",
            name: data.name,
            slug: slugify(String(data.name ?? "template"), { lower: true, strict: true }),
            description: data.description,
            storeyType: data.storeyType,
            isDefault: data.isDefault ?? false,
            defaultValidityDays: data.defaultValidityDays,
            defaultGstMode: data.defaultGstMode,
            coverIntroMarkup: data.coverIntroMarkup,
            createdByUserId: userId,
        });
    },

    async update(id: string, data: Partial<DocumentTemplate>): Promise<DocumentTemplate | undefined> {
        const patch: Record<string, unknown> = { updatedAt: new Date() };
        for (const field of [
            "name", "description", "storeyType", "isDefault", "isActive",
            "defaultValidityDays", "defaultGstMode", "coverIntroMarkup", "notes",
        ] as const) {
            if (field in data) patch[field] = data[field];
        }
        if (data.name) patch.slug = slugify(String(data.name), { lower: true, strict: true });

        // Bumping the version records that the master changed. Existing documents keep
        // the version they copied, so this only affects tenders created from now on.
        patch.version = sql`${documentTemplates.version} + 1`;

        return updateReturning<DocumentTemplate>(documentTemplates, id, patch);
    },

    // ------------------------------------------------------------ sections & items

    async addSection(templateId: string, data: Partial<TemplateSection>): Promise<TemplateSection> {
        const existing = await db.select().from(templateSections).where(eq(templateSections.templateId, templateId));
        const section = await insertReturning<TemplateSection>(templateSections, {
            templateId,
            title: data.title ?? "New section",
            subtitle: data.subtitle,
            descriptionMarkup: data.descriptionMarkup,
            coverSummaryLabel: data.coverSummaryLabel,
            showOnCoverSummary: data.showOnCoverSummary ?? false,
            sortOrder: data.sortOrder ?? existing.length,
            sectionNumber: existing.length + 1,
        });
        await this.renumberTemplate(templateId);
        return section;
    },

    async addItem(templateId: string, sectionId: string, data: Partial<TemplateItem>): Promise<TemplateItem> {
        const siblings = await db.select().from(templateItems).where(eq(templateItems.sectionId, sectionId));
        const item = await insertReturning<TemplateItem>(templateItems, {
            templateId,
            sectionId,
            title: data.title ?? "New item",
            bodyMarkup: data.bodyMarkup ?? "",
            bodyHtml: toHtml(data.bodyMarkup ?? ""),
            statusCode: data.statusCode ?? "included",
            isClientVisible: data.isClientVisible ?? true,
            internalNote: data.internalNote,
            clientNote: data.clientNote,
            sortOrder: data.sortOrder ?? siblings.length,
        });
        await this.renumberTemplate(templateId);
        return item;
    },

    async updateItem(id: string, data: Partial<TemplateItem>): Promise<TemplateItem | undefined> {
        const patch: Record<string, unknown> = { updatedAt: new Date() };
        for (const field of [
            "title", "statusCode", "isClientVisible", "internalNote", "clientNote",
            "quantity", "unit", "allowanceCents", "priceCents", "sortOrder", "sectionId",
        ] as const) {
            if (field in data) patch[field] = data[field];
        }
        // HTML is always derived, never accepted from the client.
        if ("bodyMarkup" in data) {
            patch.bodyMarkup = data.bodyMarkup;
            patch.bodyHtml = toHtml(data.bodyMarkup);
        }
        return updateReturning<TemplateItem>(templateItems, id, patch);
    },

    async deleteItem(id: string): Promise<boolean> {
        const [item] = await db.select().from(templateItems).where(eq(templateItems.id, id));
        if (!item) return false;
        await db.delete(templateItems).where(eq(templateItems.id, id));
        await this.renumberTemplate(item.templateId);
        return true;
    },

    async deleteSection(id: string): Promise<boolean> {
        const [section] = await db.select().from(templateSections).where(eq(templateSections.id, id));
        if (!section) return false;
        // Items cascade via the FK.
        await db.delete(templateSections).where(eq(templateSections.id, id));
        await this.renumberTemplate(section.templateId);
        return true;
    },

    /**
     * Recomputes every clause number for a template.
     *
     * Writes each table in ONE `UPDATE ... CASE` statement, which InnoDB applies
     * atomically — so the most frequent structural operation needs no transaction
     * and can never leave numbering half-applied.
     */
    async renumberTemplate(templateId: string): Promise<void> {
        const sections = await db.select().from(templateSections).where(eq(templateSections.templateId, templateId));
        const items = await db.select().from(templateItems).where(eq(templateItems.templateId, templateId));
        if (!sections.length) return;

        const result = renumber(
            sections.map((s) => ({ id: s.id, sortOrder: s.sortOrder, sectionNumber: s.sectionNumber })),
            items.map((i) => ({
                id: i.id, sectionId: i.sectionId, parentItemId: i.parentItemId,
                sortOrder: i.sortOrder, isClientVisible: i.isClientVisible, clauseNumber: i.clauseNumber,
                displayClauseNumber: null,
            })),
        );

        if (result.changedSectionIds.length) {
            const ids = result.sections.map((s) => s.id);
            await db.update(templateSections)
                .set({
                    sectionNumber: sql.join([
                        sql`CASE`,
                        ...result.sections.map((s) => sql`WHEN ${templateSections.id} = ${s.id} THEN ${s.sectionNumber}`),
                        sql`END`,
                    ], sql` `),
                    sortOrder: sql.join([
                        sql`CASE`,
                        ...result.sections.map((s) => sql`WHEN ${templateSections.id} = ${s.id} THEN ${s.sortOrder}`),
                        sql`END`,
                    ], sql` `),
                })
                .where(inArray(templateSections.id, ids));
        }

        if (result.changedItemIds.length) {
            const ids = result.items.map((i) => i.id);
            await db.update(templateItems)
                .set({
                    clauseNumber: sql.join([
                        sql`CASE`,
                        ...result.items.map((i) => sql`WHEN ${templateItems.id} = ${i.id} THEN ${i.clauseNumber}`),
                        sql`END`,
                    ], sql` `),
                    sortOrder: sql.join([
                        sql`CASE`,
                        ...result.items.map((i) => sql`WHEN ${templateItems.id} = ${i.id} THEN ${i.sortOrder}`),
                        sql`END`,
                    ], sql` `),
                })
                .where(inArray(templateItems.id, ids));
        }
    },

    /** Duplicates a template with all-new ids so the copy shares no rows. */
    async duplicate(id: string, name: string, userId?: string): Promise<DocumentTemplate | undefined> {
        const tree = await this.getTree(id);
        if (!tree) return undefined;

        const template = await this.create({ ...tree.template, name, isDefault: false }, userId);

        for (const section of tree.sections) {
            const sectionId = randomUUID();
            await db.insert(templateSections).values({
                ...section, id: sectionId, templateId: template.id,
                items: undefined as never,
            } as never);

            if (section.items.length) {
                await db.insert(templateItems).values(section.items.map((item) => ({
                    ...item, id: randomUUID(), templateId: template.id, sectionId,
                })));
            }
        }
        return template;
    },
};
