CREATE TABLE `site_maintenance` (
	`id` text PRIMARY KEY NOT NULL,
	`enabled` integer DEFAULT 0 NOT NULL,
	`message` text NOT NULL,
	`return_note` text DEFAULT '' NOT NULL,
	`version` integer DEFAULT 1 NOT NULL
);
