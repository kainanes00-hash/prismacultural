CREATE TABLE `ticket_lots` (
	`id` text PRIMARY KEY NOT NULL,
	`sector_id` text NOT NULL,
	`name` text NOT NULL,
	`capacity` integer NOT NULL,
	`price_cents` integer NOT NULL,
	`active` integer DEFAULT 0 NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`sector_id`) REFERENCES `ticket_sectors`(`id`) ON UPDATE no action ON DELETE no action
);

--> statement-breakpoint
CREATE INDEX `idx_ticket_lots_sector` ON `ticket_lots` (`sector_id`);
--> statement-breakpoint
CREATE TABLE `ticket_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`request_key` text NOT NULL,
	`lot_id` text NOT NULL,
	`name` text NOT NULL,
	`cpf` text NOT NULL,
	`birth_date` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`event_name` text NOT NULL,
	`sector_name` text NOT NULL,
	`lot_name` text NOT NULL,
	`price_cents` integer NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`lot_id`) REFERENCES `ticket_lots`(`id`) ON UPDATE no action ON DELETE no action
);

--> statement-breakpoint
CREATE UNIQUE INDEX `ticket_orders_request_key_unique` ON `ticket_orders` (`request_key`);
--> statement-breakpoint
CREATE INDEX `idx_ticket_orders_lot_status` ON `ticket_orders` (`lot_id`,`status`);
--> statement-breakpoint
CREATE INDEX `idx_ticket_orders_created` ON `ticket_orders` (`created_at`);
--> statement-breakpoint
CREATE TABLE `ticket_sectors` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`name` text NOT NULL,
	`capacity` integer NOT NULL,
	`active` integer DEFAULT 0 NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE no action
);

--> statement-breakpoint
CREATE INDEX `idx_ticket_sectors_event` ON `ticket_sectors` (`event_id`);