PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`subproject_id` text NOT NULL,
	`staff_id` text,
	`title` text NOT NULL,
	`scope` text NOT NULL,
	`status` text NOT NULL,
	`priority` text NOT NULL,
	`due_date` text,
	`notes` text,
	`closed_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`subproject_id`) REFERENCES `subprojects`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`staff_id`) REFERENCES `staff`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_tasks`("id", "project_id", "subproject_id", "staff_id", "title", "scope", "status", "priority", "due_date", "notes", "closed_at", "created_at", "updated_at") SELECT "id", "project_id", "subproject_id", "staff_id", "title", "scope", "status", "priority", "due_date", "notes", "closed_at", "created_at", "updated_at" FROM `tasks`;--> statement-breakpoint
DROP TABLE `tasks`;--> statement-breakpoint
ALTER TABLE `__new_tasks` RENAME TO `tasks`;--> statement-breakpoint
PRAGMA foreign_keys=ON;