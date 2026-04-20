CREATE TABLE `advisor_clients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`externalId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320),
	`phone` varchar(32),
	`birthDate` varchar(16),
	`registered` varchar(16),
	`status` enum('Ativado','Inativo') NOT NULL DEFAULT 'Ativado',
	`totalBRL` decimal(18,2) NOT NULL DEFAULT '0',
	`walletBRL` decimal(18,2) NOT NULL DEFAULT '0',
	`walletUSDT` decimal(18,8) NOT NULL DEFAULT '0',
	`walletBTC` decimal(18,8) NOT NULL DEFAULT '0',
	`walletETH` decimal(18,8) NOT NULL DEFAULT '0',
	`securityBRL` decimal(18,2) NOT NULL DEFAULT '0',
	`expertBRL` decimal(18,2) NOT NULL DEFAULT '0',
	`secBRL` decimal(18,2) NOT NULL DEFAULT '0',
	`expBRL` decimal(18,2) NOT NULL DEFAULT '0',
	`securityUSDT` decimal(18,8) NOT NULL DEFAULT '0',
	`expertUSDT` decimal(18,8) NOT NULL DEFAULT '0',
	`secUSDT` decimal(18,8) NOT NULL DEFAULT '0',
	`expUSDT` decimal(18,8) NOT NULL DEFAULT '0',
	`securityBTC` decimal(18,8) NOT NULL DEFAULT '0',
	`secBTC` decimal(18,8) NOT NULL DEFAULT '0',
	`securityETH` decimal(18,8) NOT NULL DEFAULT '0',
	`secETH` decimal(18,8) NOT NULL DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `advisor_clients_id` PRIMARY KEY(`id`),
	CONSTRAINT `advisor_clients_externalId_unique` UNIQUE(`externalId`)
);
--> statement-breakpoint
CREATE TABLE `client_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientExternalId` int NOT NULL,
	`type` enum('deposito','saque') NOT NULL,
	`amount` decimal(18,2) NOT NULL,
	`date` varchar(16) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `client_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `import_snapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`source` varchar(64) NOT NULL DEFAULT 'onil',
	`totalClients` int NOT NULL DEFAULT 0,
	`totalAUM` decimal(18,2) NOT NULL DEFAULT '0',
	`totalTransactions` int NOT NULL DEFAULT 0,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `import_snapshots_id` PRIMARY KEY(`id`)
);
