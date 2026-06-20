PRAGMA foreign_keys=OFF;--> statement-breakpoint

-- Rename project_groups to subprojects
ALTER TABLE `project_groups` RENAME TO `subprojects`;--> statement-breakpoint

-- Recreate tasks without subject_id/task_type/category/deliverable_id/parent_document_id/sort_order,
-- adding project_id (NOT NULL), subproject_id (nullable), scope (NOT NULL)
CREATE TABLE `__new_tasks` (
  `id` text PRIMARY KEY NOT NULL,
  `project_id` text NOT NULL REFERENCES `projects`(`id`),
  `subproject_id` text REFERENCES `subprojects`(`id`),
  `staff_id` text REFERENCES `staff`(`id`),
  `title` text NOT NULL,
  `scope` text NOT NULL,
  `status` text NOT NULL,
  `priority` text NOT NULL,
  `due_date` text,
  `notes` text,
  `closed_at` text,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);--> statement-breakpoint
DROP TABLE `tasks`;--> statement-breakpoint
ALTER TABLE `__new_tasks` RENAME TO `tasks`;--> statement-breakpoint

-- Recreate deliverables without group_id/subject_id, adding subproject_id (nullable)
CREATE TABLE `__new_deliverables` (
  `id` text PRIMARY KEY NOT NULL,
  `project_id` text NOT NULL REFERENCES `projects`(`id`),
  `parent_deliverable_id` text,
  `subproject_id` text REFERENCES `subprojects`(`id`),
  `staff_id` text REFERENCES `staff`(`id`),
  `type` text NOT NULL,
  `title` text NOT NULL,
  `status` text NOT NULL,
  `due_date` text,
  `notes` text,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);--> statement-breakpoint
DROP TABLE `deliverables`;--> statement-breakpoint
ALTER TABLE `__new_deliverables` RENAME TO `deliverables`;--> statement-breakpoint

-- Drop subjects (no longer used)
DROP TABLE `subjects`;--> statement-breakpoint

PRAGMA foreign_keys=ON;
