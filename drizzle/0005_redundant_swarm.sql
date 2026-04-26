CREATE TABLE `onil_contracts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`onilContractId` int NOT NULL,
	`clientExternalId` int NOT NULL,
	`clientName` varchar(255) NOT NULL,
	`clientEmail` varchar(320),
	`currency` varchar(10) NOT NULL,
	`contractType` varchar(100) NOT NULL,
	`totalDays` int NOT NULL,
	`daysElapsed` int NOT NULL DEFAULT 0,
	`value` decimal(20,8) NOT NULL,
	`startDate` varchar(20) NOT NULL,
	`expiryDate` varchar(20),
	`daysRemaining` int,
	`status` varchar(64) NOT NULL DEFAULT 'Em andamento',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `onil_contracts_id` PRIMARY KEY(`id`),
	CONSTRAINT `onil_contracts_onilContractId_unique` UNIQUE(`onilContractId`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `onilEmail` varchar(320);--> statement-breakpoint
ALTER TABLE `users` ADD `onilPasswordEnc` text;--> statement-breakpoint
ALTER TABLE `users` ADD `companyName` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionStatus` enum('trial','active','expired') DEFAULT 'trial';--> statement-breakpoint
ALTER TABLE `users` ADD `trialEndsAt` timestamp;