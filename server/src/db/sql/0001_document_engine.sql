CREATE TABLE `document_brand_settings` (
	`id` varchar(36) NOT NULL,
	`legal_name` varchar(200),
	`trading_name` varchar(200),
	`abn` varchar(20),
	`acn` varchar(20),
	`builder_licence` varchar(50),
	`address_line1` varchar(200),
	`address_line2` varchar(200),
	`suburb` varchar(100),
	`state` varchar(10),
	`postcode` varchar(10),
	`po_box` varchar(60),
	`phone` varchar(40),
	`email` varchar(255),
	`website` varchar(200),
	`logo_storage_key` varchar(500),
	`logo_light_storage_key` varchar(500),
	`primary_color` varchar(9) DEFAULT '#234252',
	`secondary_color` varchar(9) DEFAULT '#43413d',
	`accent_color` varchar(9) DEFAULT '#222222',
	`footer_text` varchar(500),
	`watermark_enabled` boolean NOT NULL DEFAULT false,
	`watermark_text` varchar(60),
	`owner_initial_label` varchar(60) DEFAULT 'Owner''s Initial',
	`builder_initial_label` varchar(60) DEFAULT 'Builder''s Initial',
	`default_validity_days` int NOT NULL DEFAULT 30,
	`gst_rate_bp` int NOT NULL DEFAULT 1000,
	`default_gst_mode` enum('inclusive','exclusive') NOT NULL DEFAULT 'inclusive',
	`updated_by_user_id` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `document_brand_settings_id` PRIMARY KEY(`id`)
);

CREATE TABLE `document_number_sequences` (
	`id` varchar(36) NOT NULL,
	`doc_type` enum('tender','contract') NOT NULL,
	`year` int NOT NULL,
	`prefix` varchar(10) NOT NULL,
	`last_number` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `document_number_sequences_id` PRIMARY KEY(`id`),
	CONSTRAINT `document_number_sequences_type_year_uq` UNIQUE(`doc_type`,`year`)
);

CREATE TABLE `document_statuses` (
	`id` varchar(36) NOT NULL,
	`code` varchar(40) NOT NULL,
	`label` varchar(60) NOT NULL,
	`short_label` varchar(16) NOT NULL,
	`pdf_treatment` enum('included','excluded','partial','neutral','money') NOT NULL DEFAULT 'neutral',
	`description` varchar(255),
	`is_system` boolean NOT NULL DEFAULT false,
	`is_active` boolean NOT NULL DEFAULT true,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `document_statuses_id` PRIMARY KEY(`id`),
	CONSTRAINT `document_statuses_code_unique` UNIQUE(`code`)
);

CREATE TABLE `clause_library` (
	`id` varchar(36) NOT NULL,
	`code` varchar(40) NOT NULL,
	`name` varchar(200) NOT NULL,
	`category` varchar(80),
	`tags` json,
	`current_version_id` varchar(36),
	`doc_types` json,
	`is_default_enabled` boolean NOT NULL DEFAULT false,
	`is_required` boolean NOT NULL DEFAULT false,
	`sort_order` int NOT NULL DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_by_user_id` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `clause_library_id` PRIMARY KEY(`id`),
	CONSTRAINT `clause_library_code_unique` UNIQUE(`code`)
);

CREATE TABLE `clause_library_versions` (
	`id` varchar(36) NOT NULL,
	`clause_id` varchar(36) NOT NULL,
	`version_number` int NOT NULL,
	`body_markup` text NOT NULL,
	`body_html` text NOT NULL,
	`change_note` varchar(255),
	`effective_date` date,
	`created_by_user_id` varchar(255),
	`created_by_email` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `clause_library_versions_id` PRIMARY KEY(`id`),
	CONSTRAINT `clause_library_versions_clause_version_uq` UNIQUE(`clause_id`,`version_number`)
);

CREATE TABLE `document_templates` (
	`id` varchar(36) NOT NULL,
	`doc_type` enum('tender','contract') NOT NULL DEFAULT 'tender',
	`name` varchar(150) NOT NULL,
	`slug` varchar(150) NOT NULL,
	`description` text,
	`storey_type` varchar(60),
	`is_default` boolean NOT NULL DEFAULT false,
	`version` int NOT NULL DEFAULT 1,
	`default_validity_days` int,
	`default_gst_mode` enum('inclusive','exclusive'),
	`cover_intro_markup` text,
	`pdf_config` json,
	`notes` text,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_by_user_id` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `document_templates_id` PRIMARY KEY(`id`),
	CONSTRAINT `document_templates_slug_unique` UNIQUE(`slug`)
);

CREATE TABLE `template_items` (
	`id` varchar(36) NOT NULL,
	`template_id` varchar(36) NOT NULL,
	`section_id` varchar(36) NOT NULL,
	`parent_item_id` varchar(36),
	`clause_number` varchar(24),
	`title` varchar(255) NOT NULL,
	`body_markup` text,
	`body_html` text,
	`status_code` varchar(40) NOT NULL DEFAULT 'included',
	`quantity` decimal(12,3),
	`unit` varchar(20),
	`allowance_cents` int,
	`price_cents` int,
	`is_client_visible` boolean NOT NULL DEFAULT true,
	`internal_note` text,
	`client_note` text,
	`sort_order` int NOT NULL DEFAULT 0,
	`meta` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `template_items_id` PRIMARY KEY(`id`)
);

CREATE TABLE `template_sections` (
	`id` varchar(36) NOT NULL,
	`template_id` varchar(36) NOT NULL,
	`section_number` int NOT NULL DEFAULT 1,
	`title` varchar(200) NOT NULL,
	`subtitle` varchar(255),
	`description_markup` text,
	`numbering_style` varchar(20) NOT NULL DEFAULT 'decimal',
	`cover_summary_label` varchar(150),
	`show_on_cover_summary` boolean NOT NULL DEFAULT false,
	`page_break_before` boolean NOT NULL DEFAULT false,
	`sort_order` int NOT NULL DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `template_sections_id` PRIMARY KEY(`id`)
);

CREATE TABLE `template_terms` (
	`id` varchar(36) NOT NULL,
	`template_id` varchar(36) NOT NULL,
	`clause_id` varchar(36),
	`is_required` boolean NOT NULL DEFAULT false,
	`is_default_enabled` boolean NOT NULL DEFAULT true,
	`override_title` varchar(200),
	`override_body_markup` text,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `template_terms_id` PRIMARY KEY(`id`)
);

CREATE TABLE `client_contacts` (
	`id` varchar(36) NOT NULL,
	`client_id` varchar(36) NOT NULL,
	`name` varchar(200) NOT NULL,
	`relationship` varchar(60),
	`email` varchar(255),
	`phone` varchar(40),
	`notes` text,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `client_contacts_id` PRIMARY KEY(`id`)
);

CREATE TABLE `clients` (
	`id` varchar(36) NOT NULL,
	`client_type` enum('individual','couple','company') NOT NULL DEFAULT 'individual',
	`primary_name` varchar(200) NOT NULL,
	`secondary_name` varchar(200),
	`company_name` varchar(200),
	`abn` varchar(20),
	`email` varchar(255),
	`phone` varchar(40),
	`current_address` text,
	`postal_address` text,
	`notes` text,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_by_user_id` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `clients_id` PRIMARY KEY(`id`)
);

CREATE TABLE `document_files` (
	`id` varchar(36) NOT NULL,
	`document_id` varchar(36) NOT NULL,
	`revision_id` varchar(36),
	`kind` enum('final_pdf','preview_pdf','attachment','logo') NOT NULL DEFAULT 'attachment',
	`label` varchar(200),
	`category` varchar(60),
	`filename` varchar(255) NOT NULL,
	`storage_backend` varchar(20) NOT NULL DEFAULT 'local',
	`storage_key` varchar(500) NOT NULL,
	`mime_type` varchar(100),
	`byte_size` int,
	`sha256` varchar(64),
	`page_count` int,
	`include_in_pack` boolean NOT NULL DEFAULT false,
	`is_current` boolean NOT NULL DEFAULT true,
	`generated_by_user_id` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `document_files_id` PRIMARY KEY(`id`)
);

CREATE TABLE `document_items` (
	`id` varchar(36) NOT NULL,
	`document_id` varchar(36) NOT NULL,
	`section_id` varchar(36) NOT NULL,
	`parent_item_id` varchar(36),
	`template_item_id` varchar(36),
	`clause_number` varchar(24),
	`display_clause_number` varchar(24),
	`title` varchar(255) NOT NULL,
	`body_markup` text,
	`body_html` text,
	`status_code` varchar(40) NOT NULL DEFAULT 'included',
	`status_label` varchar(60),
	`status_treatment` varchar(20),
	`quantity` decimal(12,3),
	`unit` varchar(20),
	`allowance_cents` int,
	`price_cents` int,
	`is_client_visible` boolean NOT NULL DEFAULT true,
	`internal_note` text,
	`client_note` text,
	`is_custom` boolean NOT NULL DEFAULT false,
	`sort_order` int NOT NULL DEFAULT 0,
	`meta` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `document_items_id` PRIMARY KEY(`id`)
);

CREATE TABLE `document_parties` (
	`id` varchar(36) NOT NULL,
	`document_id` varchar(36) NOT NULL,
	`client_id` varchar(36),
	`role` enum('primary','secondary','company','contact') NOT NULL DEFAULT 'primary',
	`full_name` varchar(200),
	`company_name` varchar(200),
	`abn` varchar(20),
	`email` varchar(255),
	`phone` varchar(40),
	`current_address` text,
	`postal_address` text,
	`notes` text,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `document_parties_id` PRIMARY KEY(`id`)
);

CREATE TABLE `document_pricing_lines` (
	`id` varchar(36) NOT NULL,
	`document_id` varchar(36) NOT NULL,
	`category` enum('base_house','site_costs','council_statutory','basix','upgrade','additional_works','discount','promotion','other') NOT NULL DEFAULT 'other',
	`label` varchar(200) NOT NULL,
	`description_markup` text,
	`quantity` decimal(12,3),
	`unit_amount_cents` int,
	`amount_cents` int NOT NULL DEFAULT 0,
	`treatment` enum('include_in_total','display_and_include','display_separately','optional','excluded','allowance','provisional_sum','client_supplied','owner_responsibility') NOT NULL DEFAULT 'include_in_total',
	`is_gst_inclusive` boolean,
	`show_in_summary` boolean NOT NULL DEFAULT true,
	`is_client_visible` boolean NOT NULL DEFAULT true,
	`internal_note` text,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `document_pricing_lines_id` PRIMARY KEY(`id`)
);

CREATE TABLE `document_revisions` (
	`id` varchar(36) NOT NULL,
	`document_id` varchar(36) NOT NULL,
	`revision_number` int NOT NULL DEFAULT 0,
	`revision_label` varchar(40),
	`status` enum('draft','issued','superseded') NOT NULL DEFAULT 'draft',
	`issued_at` timestamp,
	`issued_by_user_id` varchar(255),
	`snapshot_json` json,
	`snapshot_hash` varchar(64),
	`total_cents` int,
	`change_summary` text,
	`created_by_user_id` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `document_revisions_id` PRIMARY KEY(`id`),
	CONSTRAINT `document_revisions_document_revision_uq` UNIQUE(`document_id`,`revision_number`)
);

CREATE TABLE `document_sections` (
	`id` varchar(36) NOT NULL,
	`document_id` varchar(36) NOT NULL,
	`template_section_id` varchar(36),
	`section_number` int NOT NULL DEFAULT 1,
	`title` varchar(200) NOT NULL,
	`subtitle` varchar(255),
	`description_markup` text,
	`description_html` text,
	`numbering_style` varchar(20) NOT NULL DEFAULT 'decimal',
	`cover_summary_label` varchar(150),
	`show_on_cover_summary` boolean NOT NULL DEFAULT false,
	`page_break_before` boolean NOT NULL DEFAULT false,
	`is_client_visible` boolean NOT NULL DEFAULT true,
	`sort_order` int NOT NULL DEFAULT 0,
	`meta` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `document_sections_id` PRIMARY KEY(`id`)
);

CREATE TABLE `document_terms` (
	`id` varchar(36) NOT NULL,
	`document_id` varchar(36) NOT NULL,
	`clause_id` varchar(36),
	`clause_version_id` varchar(36),
	`clause_version_number` int,
	`code` varchar(40),
	`title` varchar(200) NOT NULL,
	`body_markup` text,
	`body_html` text NOT NULL,
	`is_enabled` boolean NOT NULL DEFAULT true,
	`is_required` boolean NOT NULL DEFAULT false,
	`is_custom` boolean NOT NULL DEFAULT false,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `document_terms_id` PRIMARY KEY(`id`)
);

CREATE TABLE `documents` (
	`id` varchar(36) NOT NULL,
	`doc_type` enum('tender','contract') NOT NULL DEFAULT 'tender',
	`document_number` varchar(30) NOT NULL,
	`year` int NOT NULL,
	`sequence` int NOT NULL,
	`current_revision_number` int NOT NULL DEFAULT 0,
	`status` enum('draft','internal_review','ready_to_send','sent','accepted','declined','expired','superseded','converted','archived') NOT NULL DEFAULT 'draft',
	`template_id` varchar(36),
	`template_version_at_create` int,
	`source_document_id` varchar(36),
	`supersedes_document_id` varchar(36),
	`client_id` varchar(36),
	`client_display_name` varchar(255),
	`client_type` enum('individual','couple','company') NOT NULL DEFAULT 'individual',
	`project_address` text,
	`lot_number` varchar(30),
	`dp_number` varchar(30),
	`suburb` varchar(100),
	`state` varchar(10),
	`postcode` varchar(10),
	`council` varchar(120),
	`development_ref` varchar(80),
	`construction_type` varchar(60),
	`property_type` varchar(60),
	`property_id` varchar(36),
	`design_id` varchar(36),
	`design_name_snapshot` varchar(200),
	`facade_id` varchar(36),
	`facade_snapshot` varchar(120),
	`square_metres` int,
	`squares` decimal(6,1),
	`bedrooms` int,
	`bathrooms` int,
	`garages` int,
	`project_notes` text,
	`document_date` date,
	`expiry_date` date,
	`validity_days` int,
	`prepared_by_user_id` varchar(255),
	`prepared_by_name` varchar(150),
	`sales_consultant_id` varchar(36),
	`sales_consultant_name` varchar(150),
	`estimator_name` varchar(150),
	`intro_markup` text,
	`description_markup` text,
	`internal_notes` text,
	`client_notes` text,
	`gst_mode` enum('inclusive','exclusive') NOT NULL DEFAULT 'inclusive',
	`gst_rate_bp` int NOT NULL DEFAULT 1000,
	`subtotal_cents` int NOT NULL DEFAULT 0,
	`gst_cents` int NOT NULL DEFAULT 0,
	`total_cents` int NOT NULL DEFAULT 0,
	`optional_total_cents` int NOT NULL DEFAULT 0,
	`display_separately_total_cents` int NOT NULL DEFAULT 0,
	`total_override_cents` int,
	`total_override_reason` varchar(255),
	`custom_fields` json,
	`pdf_config` json,
	`meta` json,
	`locked_at` timestamp,
	`is_archived` boolean NOT NULL DEFAULT false,
	`created_by_user_id` varchar(255),
	`updated_by_user_id` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `documents_id` PRIMARY KEY(`id`),
	CONSTRAINT `documents_document_number_unique` UNIQUE(`document_number`)
);

CREATE TABLE `audit_logs` (
	`id` varchar(36) NOT NULL,
	`entity_type` varchar(40) NOT NULL,
	`entity_id` varchar(36),
	`document_id` varchar(36),
	`revision_number` int,
	`action` varchar(60) NOT NULL,
	`field` varchar(80),
	`previous_value` text,
	`new_value` text,
	`summary` varchar(255),
	`user_id` varchar(255),
	`user_email` varchar(255),
	`ip_address` varchar(45),
	`metadata` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);

ALTER TABLE `clause_library_versions` ADD CONSTRAINT `clause_library_versions_clause_id_clause_library_id_fk` FOREIGN KEY (`clause_id`) REFERENCES `clause_library`(`id`) ON DELETE cascade ON UPDATE no action;

ALTER TABLE `template_items` ADD CONSTRAINT `template_items_template_id_document_templates_id_fk` FOREIGN KEY (`template_id`) REFERENCES `document_templates`(`id`) ON DELETE cascade ON UPDATE no action;

ALTER TABLE `template_items` ADD CONSTRAINT `template_items_section_id_template_sections_id_fk` FOREIGN KEY (`section_id`) REFERENCES `template_sections`(`id`) ON DELETE cascade ON UPDATE no action;

ALTER TABLE `template_sections` ADD CONSTRAINT `template_sections_template_id_document_templates_id_fk` FOREIGN KEY (`template_id`) REFERENCES `document_templates`(`id`) ON DELETE cascade ON UPDATE no action;

ALTER TABLE `template_terms` ADD CONSTRAINT `template_terms_template_id_document_templates_id_fk` FOREIGN KEY (`template_id`) REFERENCES `document_templates`(`id`) ON DELETE cascade ON UPDATE no action;

ALTER TABLE `client_contacts` ADD CONSTRAINT `client_contacts_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE cascade ON UPDATE no action;

ALTER TABLE `document_files` ADD CONSTRAINT `document_files_document_id_documents_id_fk` FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON DELETE cascade ON UPDATE no action;

ALTER TABLE `document_items` ADD CONSTRAINT `document_items_document_id_documents_id_fk` FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON DELETE cascade ON UPDATE no action;

ALTER TABLE `document_items` ADD CONSTRAINT `document_items_section_id_document_sections_id_fk` FOREIGN KEY (`section_id`) REFERENCES `document_sections`(`id`) ON DELETE cascade ON UPDATE no action;

ALTER TABLE `document_parties` ADD CONSTRAINT `document_parties_document_id_documents_id_fk` FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON DELETE cascade ON UPDATE no action;

ALTER TABLE `document_pricing_lines` ADD CONSTRAINT `document_pricing_lines_document_id_documents_id_fk` FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON DELETE cascade ON UPDATE no action;

ALTER TABLE `document_revisions` ADD CONSTRAINT `document_revisions_document_id_documents_id_fk` FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON DELETE cascade ON UPDATE no action;

ALTER TABLE `document_sections` ADD CONSTRAINT `document_sections_document_id_documents_id_fk` FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON DELETE cascade ON UPDATE no action;

ALTER TABLE `document_terms` ADD CONSTRAINT `document_terms_document_id_documents_id_fk` FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON DELETE cascade ON UPDATE no action;

CREATE INDEX `clause_library_category_idx` ON `clause_library` (`category`);

CREATE INDEX `template_items_section_sort_idx` ON `template_items` (`template_id`,`section_id`,`sort_order`);

CREATE INDEX `template_sections_template_sort_idx` ON `template_sections` (`template_id`,`sort_order`);

CREATE INDEX `template_terms_template_sort_idx` ON `template_terms` (`template_id`,`sort_order`);

CREATE INDEX `clients_email_idx` ON `clients` (`email`);

CREATE INDEX `clients_phone_idx` ON `clients` (`phone`);

CREATE INDEX `clients_primary_name_idx` ON `clients` (`primary_name`);

CREATE INDEX `document_files_document_kind_idx` ON `document_files` (`document_id`,`kind`);

CREATE INDEX `document_files_revision_idx` ON `document_files` (`revision_id`);

CREATE INDEX `document_items_doc_section_sort_idx` ON `document_items` (`document_id`,`section_id`,`sort_order`);

CREATE INDEX `document_parties_document_idx` ON `document_parties` (`document_id`,`sort_order`);

CREATE INDEX `document_pricing_lines_document_sort_idx` ON `document_pricing_lines` (`document_id`,`sort_order`);

CREATE INDEX `document_sections_document_sort_idx` ON `document_sections` (`document_id`,`sort_order`);

CREATE INDEX `document_terms_document_sort_idx` ON `document_terms` (`document_id`,`sort_order`);

CREATE INDEX `documents_status_idx` ON `documents` (`doc_type`,`status`);

CREATE INDEX `documents_client_idx` ON `documents` (`client_id`);

CREATE INDEX `documents_created_idx` ON `documents` (`created_at`);

CREATE INDEX `documents_year_sequence_idx` ON `documents` (`doc_type`,`year`,`sequence`);

CREATE INDEX `audit_logs_document_created_idx` ON `audit_logs` (`document_id`,`created_at`);

CREATE INDEX `audit_logs_entity_idx` ON `audit_logs` (`entity_type`,`entity_id`);
