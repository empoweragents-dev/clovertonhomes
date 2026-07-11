import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import { query } from "@/lib/db";
import { sendEnquiryNotification } from "@/lib/email";

const enquirySchema = z.object({
    type: z.enum(["general", "property", "design", "custom_build"]).optional(),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().optional(),
    email: z.string().email("A valid email is required"),
    phone: z.string().optional(),
    interestType: z.string().optional(),
    homeType: z.string().optional(),
    designPreference: z.string().optional(),
    message: z.string().optional(),
    source: z.string().optional(),
    // Honeypot — bots fill hidden fields; humans leave it empty.
    company: z.string().optional(),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const parsed = enquirySchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { success: false, message: "Validation error", errors: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const data = parsed.data;

        // Honeypot: silently accept but drop spam
        if (data.company && data.company.trim() !== "") {
            return NextResponse.json({ success: true, message: "Enquiry submitted successfully" });
        }

        const id = randomUUID();
        await query(
            `INSERT INTO enquiries
                (id, type, first_name, last_name, email, phone, interest_type, home_type,
                 design_preference, message, source, status, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', NOW(), NOW())`,
            [
                id,
                data.type || "general",
                data.firstName,
                data.lastName || null,
                data.email,
                data.phone || null,
                data.interestType || null,
                data.homeType || null,
                data.designPreference || null,
                data.message || null,
                data.source || "website",
            ]
        );

        // Best-effort email; never block the submission on it.
        const fullName = [data.firstName, data.lastName].filter(Boolean).join(" ");
        sendEnquiryNotification({
            name: fullName,
            email: data.email,
            phone: data.phone,
            message: data.message,
            interestType: data.interestType,
            homeType: data.homeType,
            source: data.source,
        }).catch((e) => console.error("Email send error:", e));

        return NextResponse.json({ success: true, message: "Enquiry submitted successfully" }, { status: 201 });
    } catch (error: any) {
        console.error("Error creating enquiry:", error);
        return NextResponse.json(
            { success: false, message: error?.message || "Failed to submit enquiry" },
            { status: 500 }
        );
    }
}
