CREATE TABLE `admin_identity` (
	`key` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL
);

--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`concept` text NOT NULL,
	`format` text NOT NULL,
	`role` text NOT NULL,
	`stage_type` text NOT NULL,
	`stage_description` text NOT NULL,
	`scenography` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`cover_id` text,
	`version` integer DEFAULT 1 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);

--> statement-breakpoint
CREATE INDEX `idx_events_status_updated` ON `events` (`status`,`updated_at`);
--> statement-breakpoint
CREATE TABLE `media` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`storage_key` text NOT NULL,
	`mime` text NOT NULL,
	`size` integer NOT NULL,
	`category` text NOT NULL,
	`caption` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE no action
);

--> statement-breakpoint
CREATE INDEX `idx_media_event` ON `media` (`event_id`);