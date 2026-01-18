CREATE TABLE `bookings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`decision_tree_id` int NOT NULL,
	`user_id` int,
	`selected_services` text NOT NULL,
	`total_price` int NOT NULL,
	`total_duration` int NOT NULL,
	`applied_rules` text,
	`client_name` varchar(255),
	`client_email` varchar(320),
	`client_phone` varchar(50),
	`preferred_datetime` timestamp,
	`status` enum('pending','confirmed','completed','cancelled') NOT NULL DEFAULT 'pending',
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bookings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `decision_trees` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`dsl_content` text NOT NULL,
	`is_published` int NOT NULL DEFAULT 0,
	`is_preset` int NOT NULL DEFAULT 0,
	`version` int NOT NULL DEFAULT 1,
	`created_by` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `decision_trees_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_decision_tree_id_decision_trees_id_fk` FOREIGN KEY (`decision_tree_id`) REFERENCES `decision_trees`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `decision_trees` ADD CONSTRAINT `decision_trees_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;