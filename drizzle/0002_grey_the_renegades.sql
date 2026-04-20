CREATE TABLE `client_form_tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`userId` int NOT NULL,
	`token` varchar(64) NOT NULL,
	`status` enum('pending','completed','expired') NOT NULL DEFAULT 'pending',
	`expiresAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `client_form_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `client_form_tokens_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `family_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`relationship` enum('filho','filha','conjuge','pai','mae','irmao','irma','outro') NOT NULL,
	`birthDate` varchar(10),
	`interests` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gift_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`giftName` varchar(255) NOT NULL,
	`giftCategory` varchar(100),
	`giftValue` decimal(10,2),
	`occasion` varchar(255),
	`giftDate` varchar(10) NOT NULL,
	`reaction` enum('adorou','gostou','neutro','nao_gostou'),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gift_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `interactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`type` enum('reuniao','ligacao','email','whatsapp','evento','presente','outro') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`interactionDate` varchar(10) NOT NULL,
	`outcome` text,
	`nextAction` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `interactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `neuroscience_answers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`answers` json,
	`dominantProfile` enum('dominante','influente','estavel','cauteloso'),
	`secondaryProfile` enum('dominante','influente','estavel','cauteloso'),
	`primaryMotivator` varchar(100),
	`decisionStyle` enum('racional','emocional','intuitivo','consultivo'),
	`communicationStyle` enum('direto','detalhista','relacional','analitico'),
	`giftPreferences` json,
	`experienceVsProduct` enum('experiencia','produto','ambos'),
	`luxuryLevel` enum('simples','moderado','luxo','ultra_luxo'),
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `neuroscience_answers_id` PRIMARY KEY(`id`),
	CONSTRAINT `neuroscience_answers_clientId_unique` UNIQUE(`clientId`)
);
--> statement-breakpoint
CREATE TABLE `notification_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`email` varchar(320) NOT NULL,
	`enabled` boolean NOT NULL DEFAULT true,
	`sendDays` json DEFAULT ('[1]'),
	`sendHour` int DEFAULT 8,
	`daysAhead` int DEFAULT 7,
	`lastSentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notification_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `notification_settings_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `portfolios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`totalCapital` decimal(18,2) DEFAULT '0',
	`realEstate` decimal(18,2) DEFAULT '0',
	`investments` decimal(18,2) DEFAULT '0',
	`vehicles` decimal(18,2) DEFAULT '0',
	`crypto` decimal(18,2) DEFAULT '0',
	`fixedIncome` decimal(18,2) DEFAULT '0',
	`stocks` decimal(18,2) DEFAULT '0',
	`businessEquity` decimal(18,2) DEFAULT '0',
	`others` decimal(18,2) DEFAULT '0',
	`othersDescription` text,
	`onilxUsdt` decimal(18,2) DEFAULT '0',
	`onilxBtc` decimal(18,8) DEFAULT '0',
	`onilxEth` decimal(18,8) DEFAULT '0',
	`onilxBrl` decimal(18,2) DEFAULT '0',
	`consortium` json,
	`insurance` json,
	`lastUpdated` timestamp DEFAULT (now()),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `portfolios_id` PRIMARY KEY(`id`),
	CONSTRAINT `portfolios_clientId_unique` UNIQUE(`clientId`)
);
--> statement-breakpoint
CREATE TABLE `special_dates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`date` varchar(10) NOT NULL,
	`type` enum('aniversario_cliente','aniversario_familiar','casamento','aniversario_empresa','outro') NOT NULL,
	`personName` varchar(255),
	`alertDaysBefore` int DEFAULT 30,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `special_dates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `advisor_clients` ADD `userId` int;--> statement-breakpoint
ALTER TABLE `advisor_clients` ADD `cpf` varchar(20);--> statement-breakpoint
ALTER TABLE `advisor_clients` ADD `gender` enum('masculino','feminino','outro');--> statement-breakpoint
ALTER TABLE `advisor_clients` ADD `city` varchar(100);--> statement-breakpoint
ALTER TABLE `advisor_clients` ADD `state` varchar(50);--> statement-breakpoint
ALTER TABLE `advisor_clients` ADD `occupation` varchar(150);--> statement-breakpoint
ALTER TABLE `advisor_clients` ADD `spouseName` varchar(255);--> statement-breakpoint
ALTER TABLE `advisor_clients` ADD `spouseBirthDate` varchar(10);--> statement-breakpoint
ALTER TABLE `advisor_clients` ADD `weddingDate` varchar(10);--> statement-breakpoint
ALTER TABLE `advisor_clients` ADD `hobbies` text;--> statement-breakpoint
ALTER TABLE `advisor_clients` ADD `favoriteRestaurants` text;--> statement-breakpoint
ALTER TABLE `advisor_clients` ADD `travelPreferences` text;--> statement-breakpoint
ALTER TABLE `advisor_clients` ADD `sportTeam` varchar(100);--> statement-breakpoint
ALTER TABLE `advisor_clients` ADD `musicGenre` varchar(100);--> statement-breakpoint
ALTER TABLE `advisor_clients` ADD `favoriteBooks` text;--> statement-breakpoint
ALTER TABLE `advisor_clients` ADD `notes` text;--> statement-breakpoint
ALTER TABLE `advisor_clients` ADD `photoUrl` text;--> statement-breakpoint
ALTER TABLE `advisor_clients` ADD `isActive` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `advisor_clients` ADD `clientSince` varchar(10);--> statement-breakpoint
ALTER TABLE `advisor_clients` ADD `riskProfile` enum('conservador','moderado','arrojado','agressivo');--> statement-breakpoint
ALTER TABLE `advisor_clients` ADD `riskScore` int;