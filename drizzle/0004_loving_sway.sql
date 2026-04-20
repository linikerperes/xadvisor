CREATE TABLE `link_shortcuts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`shortCode` varchar(16) NOT NULL,
	`targetUrl` text NOT NULL,
	`clientId` int,
	`userId` int,
	`clicks` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `link_shortcuts_id` PRIMARY KEY(`id`),
	CONSTRAINT `link_shortcuts_shortCode_unique` UNIQUE(`shortCode`)
);
