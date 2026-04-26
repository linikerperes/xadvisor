import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  json,
} from "drizzle-orm/mysql-core";

// ─── Users (auth) ────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  // X-Advisor SaaS fields
  onilEmail: varchar("onilEmail", { length: 320 }),
  onilPasswordEnc: text("onilPasswordEnc"),      // AES-256 encrypted
  companyName: varchar("companyName", { length: 255 }),
  subscriptionStatus: mysqlEnum("subscriptionStatus", ["trial", "active", "expired", "canceled"]).default("trial"),
  trialEndsAt: timestamp("trialEndsAt"),
  // Stripe
  stripeCustomerId: varchar("stripeCustomerId", { length: 128 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 128 }),
  stripePriceId: varchar("stripePriceId", { length: 128 }),
  stripeCurrentPeriodEnd: timestamp("stripeCurrentPeriodEnd"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Advisor Clients (Onil + CRM) ───────────────────────────────────────────
// Mescla dados financeiros do portal Onil com dados de CRM/relacionamento
export const advisorClients = mysqlTable("advisor_clients", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"), // assessor owner (para multi-assessor futuro)
  externalId: int("externalId").notNull().unique(), // ID no portal Onil

  // === Dados pessoais (CRM) ===
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 32 }),
  cpf: varchar("cpf", { length: 20 }),
  birthDate: varchar("birthDate", { length: 16 }),
  gender: mysqlEnum("gender", ["masculino", "feminino", "outro"]),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  occupation: varchar("occupation", { length: 150 }),

  // === Dados do cônjuge ===
  spouseName: varchar("spouseName", { length: 255 }),
  spouseBirthDate: varchar("spouseBirthDate", { length: 10 }),
  weddingDate: varchar("weddingDate", { length: 10 }),

  // === Preferências pessoais ===
  hobbies: text("hobbies"),
  favoriteRestaurants: text("favoriteRestaurants"),
  travelPreferences: text("travelPreferences"),
  sportTeam: varchar("sportTeam", { length: 100 }),
  musicGenre: varchar("musicGenre", { length: 100 }),
  favoriteBooks: text("favoriteBooks"),
  notes: text("notes"),

  // === Foto de perfil ===
  photoUrl: text("photoUrl"),

  // === Status e registro ===
  status: mysqlEnum("status", ["Ativado", "Inativo"]).default("Ativado").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  registered: varchar("registered", { length: 16 }),
  clientSince: varchar("clientSince", { length: 10 }),

  // === Perfil de risco ===
  riskProfile: mysqlEnum("riskProfile", ["conservador", "moderado", "arrojado", "agressivo"]),
  riskScore: int("riskScore"),

  // === Saldos Onil - BRL ===
  totalBRL: decimal("totalBRL", { precision: 18, scale: 2 }).default("0").notNull(),
  walletBRL: decimal("walletBRL", { precision: 18, scale: 2 }).default("0").notNull(),
  // === Saldos Onil - USDT ===
  walletUSDT: decimal("walletUSDT", { precision: 18, scale: 8 }).default("0").notNull(),
  // === Saldos Onil - BTC ===
  walletBTC: decimal("walletBTC", { precision: 18, scale: 8 }).default("0").notNull(),
  // === Saldos Onil - ETH ===
  walletETH: decimal("walletETH", { precision: 18, scale: 8 }).default("0").notNull(),

  // === Produtos BRL ===
  securityBRL: decimal("securityBRL", { precision: 18, scale: 2 }).default("0").notNull(),
  expertBRL: decimal("expertBRL", { precision: 18, scale: 2 }).default("0").notNull(),
  secBRL: decimal("secBRL", { precision: 18, scale: 2 }).default("0").notNull(),
  expBRL: decimal("expBRL", { precision: 18, scale: 2 }).default("0").notNull(),
  // === Produtos USDT ===
  securityUSDT: decimal("securityUSDT", { precision: 18, scale: 8 }).default("0").notNull(),
  expertUSDT: decimal("expertUSDT", { precision: 18, scale: 8 }).default("0").notNull(),
  secUSDT: decimal("secUSDT", { precision: 18, scale: 8 }).default("0").notNull(),
  expUSDT: decimal("expUSDT", { precision: 18, scale: 8 }).default("0").notNull(),
  // === Produtos BTC ===
  securityBTC: decimal("securityBTC", { precision: 18, scale: 8 }).default("0").notNull(),
  secBTC: decimal("secBTC", { precision: 18, scale: 8 }).default("0").notNull(),
  // === Produtos ETH ===
  securityETH: decimal("securityETH", { precision: 18, scale: 8 }).default("0").notNull(),
  secETH: decimal("secETH", { precision: 18, scale: 8 }).default("0").notNull(),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AdvisorClient = typeof advisorClients.$inferSelect;
export type InsertAdvisorClient = typeof advisorClients.$inferInsert;

// ─── Family Members ───────────────────────────────────────────────────────────
export const familyMembers = mysqlTable("family_members", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(), // advisorClients.id
  name: varchar("name", { length: 255 }).notNull(),
  relationship: mysqlEnum("relationship", ["filho", "filha", "conjuge", "pai", "mae", "irmao", "irma", "outro"]).notNull(),
  birthDate: varchar("birthDate", { length: 10 }),
  interests: text("interests"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FamilyMember = typeof familyMembers.$inferSelect;
export type InsertFamilyMember = typeof familyMembers.$inferInsert;

// ─── Special Dates ────────────────────────────────────────────────────────────
export const specialDates = mysqlTable("special_dates", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  date: varchar("date", { length: 10 }).notNull(),
  type: mysqlEnum("type", ["aniversario_cliente", "aniversario_familiar", "casamento", "aniversario_empresa", "outro"]).notNull(),
  personName: varchar("personName", { length: 255 }),
  alertDaysBefore: int("alertDaysBefore").default(30),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SpecialDate = typeof specialDates.$inferSelect;
export type InsertSpecialDate = typeof specialDates.$inferInsert;

// ─── Portfolio (patrimônio expandido) ────────────────────────────────────────
export const portfolios = mysqlTable("portfolios", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull().unique(),
  totalCapital: decimal("totalCapital", { precision: 18, scale: 2 }).default("0"),
  // Setores (valores em R$)
  realEstate: decimal("realEstate", { precision: 18, scale: 2 }).default("0"),
  investments: decimal("investments", { precision: 18, scale: 2 }).default("0"),
  vehicles: decimal("vehicles", { precision: 18, scale: 2 }).default("0"),
  crypto: decimal("crypto", { precision: 18, scale: 2 }).default("0"),
  fixedIncome: decimal("fixedIncome", { precision: 18, scale: 2 }).default("0"),
  stocks: decimal("stocks", { precision: 18, scale: 2 }).default("0"),
  businessEquity: decimal("businessEquity", { precision: 18, scale: 2 }).default("0"),
  others: decimal("others", { precision: 18, scale: 2 }).default("0"),
  othersDescription: text("othersDescription"),
  // Onilx (corretora)
  onilxUsdt: decimal("onilxUsdt", { precision: 18, scale: 2 }).default("0"),
  onilxBtc: decimal("onilxBtc", { precision: 18, scale: 8 }).default("0"),
  onilxEth: decimal("onilxEth", { precision: 18, scale: 8 }).default("0"),
  onilxBrl: decimal("onilxBrl", { precision: 18, scale: 2 }).default("0"),
  // Consórcio e Seguros
  consortium: json("consortium"),
  insurance: json("insurance"),
  // Metadados
  lastUpdated: timestamp("lastUpdated").defaultNow(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Portfolio = typeof portfolios.$inferSelect;
export type InsertPortfolio = typeof portfolios.$inferInsert;

// ─── Neuroscience Questionnaire Answers ──────────────────────────────────────
export const neuroscienceAnswers = mysqlTable("neuroscience_answers", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull().unique(),
  answers: json("answers"),
  dominantProfile: mysqlEnum("dominantProfile", ["dominante", "influente", "estavel", "cauteloso"]),
  secondaryProfile: mysqlEnum("secondaryProfile", ["dominante", "influente", "estavel", "cauteloso"]),
  primaryMotivator: varchar("primaryMotivator", { length: 100 }),
  decisionStyle: mysqlEnum("decisionStyle", ["racional", "emocional", "intuitivo", "consultivo"]),
  communicationStyle: mysqlEnum("communicationStyle", ["direto", "detalhista", "relacional", "analitico"]),
  giftPreferences: json("giftPreferences"),
  experienceVsProduct: mysqlEnum("experienceVsProduct", ["experiencia", "produto", "ambos"]),
  luxuryLevel: mysqlEnum("luxuryLevel", ["simples", "moderado", "luxo", "ultra_luxo"]),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NeuroscienceAnswer = typeof neuroscienceAnswers.$inferSelect;
export type InsertNeuroscienceAnswer = typeof neuroscienceAnswers.$inferInsert;

// ─── Gift History ─────────────────────────────────────────────────────────────
export const giftHistory = mysqlTable("gift_history", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  giftName: varchar("giftName", { length: 255 }).notNull(),
  giftCategory: varchar("giftCategory", { length: 100 }),
  giftValue: decimal("giftValue", { precision: 10, scale: 2 }),
  occasion: varchar("occasion", { length: 255 }),
  giftDate: varchar("giftDate", { length: 10 }).notNull(),
  reaction: mysqlEnum("reaction", ["adorou", "gostou", "neutro", "nao_gostou"]),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GiftHistory = typeof giftHistory.$inferSelect;
export type InsertGiftHistory = typeof giftHistory.$inferInsert;

// ─── Interactions ─────────────────────────────────────────────────────────────
export const interactions = mysqlTable("interactions", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  type: mysqlEnum("type", ["reuniao", "ligacao", "email", "whatsapp", "evento", "presente", "outro"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  interactionDate: varchar("interactionDate", { length: 10 }).notNull(),
  outcome: text("outcome"),
  nextAction: text("nextAction"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Interaction = typeof interactions.$inferSelect;
export type InsertInteraction = typeof interactions.$inferInsert;

// ─── Link Shortcuts ─────────────────────────────────────────────────────────
export const linkShortcuts = mysqlTable("link_shortcuts", {
  id: int("id").autoincrement().primaryKey(),
  shortCode: varchar("shortCode", { length: 16 }).notNull().unique(),
  targetUrl: text("targetUrl").notNull(),
  clientId: int("clientId"),
  userId: int("userId"),
  clicks: int("clicks").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LinkShortcut = typeof linkShortcuts.$inferSelect;
export type InsertLinkShortcut = typeof linkShortcuts.$inferInsert;

// ─── Client Form Tokens ───────────────────────────────────────────────────────
export const clientFormTokens = mysqlTable("client_form_tokens", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  userId: int("userId").notNull(),
  token: varchar("token", { length: 64 }).notNull().unique(),
  status: mysqlEnum("status", ["pending", "completed", "expired"]).default("pending").notNull(),
  expiresAt: timestamp("expiresAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ClientFormToken = typeof clientFormTokens.$inferSelect;
export type InsertClientFormToken = typeof clientFormTokens.$inferInsert;

// ─── Notification Settings ───────────────────────────────────────────────────
export const notificationSettings = mysqlTable("notification_settings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  email: varchar("email", { length: 320 }).notNull(),
  enabled: boolean("enabled").default(true).notNull(),
  sendDays: json("sendDays").$type<number[]>(),
  sendHour: int("sendHour").default(8),
  daysAhead: int("daysAhead").default(7),
  lastSentAt: timestamp("lastSentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NotificationSetting = typeof notificationSettings.$inferSelect;
export type InsertNotificationSetting = typeof notificationSettings.$inferInsert;

// ─── Depósitos e Saques ──────────────────────────────────────────────────────
export const clientTransactions = mysqlTable("client_transactions", {
  id: int("id").autoincrement().primaryKey(),
  clientExternalId: int("clientExternalId").notNull(),
  type: mysqlEnum("type", ["deposito", "saque"]).notNull(),
  amount: decimal("amount", { precision: 18, scale: 2 }).notNull(),
  date: varchar("date", { length: 16 }).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ClientTransaction = typeof clientTransactions.$inferSelect;
export type InsertClientTransaction = typeof clientTransactions.$inferInsert;

// ─── Onil Contracts ──────────────────────────────────────────────────────────
export const onilContracts = mysqlTable("onil_contracts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),                                     // assessor owner
  onilContractId: int("onilContractId").notNull().unique(), // # do contrato no portal
  clientExternalId: int("clientExternalId").notNull(),      // ID do cliente no Onil
  clientName: varchar("clientName", { length: 255 }).notNull(),
  clientEmail: varchar("clientEmail", { length: 320 }),
  currency: varchar("currency", { length: 10 }).notNull(),  // BRL, USDT, BTC, ETH
  contractType: varchar("contractType", { length: 100 }).notNull(), // "Onil Perfil SEC"
  totalDays: int("totalDays").notNull(),
  daysElapsed: int("daysElapsed").notNull().default(0),
  value: decimal("value", { precision: 20, scale: 8 }).notNull(),
  startDate: varchar("startDate", { length: 20 }).notNull(),  // "13/04/2026"
  expiryDate: varchar("expiryDate", { length: 20 }),          // calculado
  daysRemaining: int("daysRemaining"),                        // calculado
  status: varchar("status", { length: 64 }).notNull().default("Em andamento"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OnilContract = typeof onilContracts.$inferSelect;
export type InsertOnilContract = typeof onilContracts.$inferInsert;

// ─── Import Snapshots ────────────────────────────────────────────────────────
export const importSnapshots = mysqlTable("import_snapshots", {
  id: int("id").autoincrement().primaryKey(),
  source: varchar("source", { length: 64 }).default("onil").notNull(),
  totalClients: int("totalClients").default(0).notNull(),
  totalAUM: decimal("totalAUM", { precision: 18, scale: 2 }).default("0").notNull(),
  totalTransactions: int("totalTransactions").default(0).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ImportSnapshot = typeof importSnapshots.$inferSelect;
export type InsertImportSnapshot = typeof importSnapshots.$inferInsert;
