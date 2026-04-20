import { and, asc, desc, eq, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  advisorClients, InsertAdvisorClient, AdvisorClient,
  clientTransactions, InsertClientTransaction, ClientTransaction,
  importSnapshots, InsertImportSnapshot, ImportSnapshot,
  familyMembers, InsertFamilyMember, FamilyMember,
  specialDates, InsertSpecialDate, SpecialDate,
  portfolios, InsertPortfolio, Portfolio,
  neuroscienceAnswers, InsertNeuroscienceAnswer, NeuroscienceAnswer,
  giftHistory, InsertGiftHistory, GiftHistory,
  interactions, InsertInteraction, Interaction,
  clientFormTokens, InsertClientFormToken, ClientFormToken,
  notificationSettings, InsertNotificationSetting, NotificationSetting,
  linkShortcuts, InsertLinkShortcut,
  onilContracts, InsertOnilContract, OnilContract,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USER QUERIES ============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  textFields.forEach((field) => {
    const value = user[field];
    if (value === undefined) return;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  });
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = 'admin';
    updateSet.role = 'admin';
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ ADVISOR CLIENT QUERIES (Onil) ============

export async function getAllClients(): Promise<AdvisorClient[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(advisorClients).orderBy(desc(advisorClients.updatedAt));
}

export async function getClientByExternalId(externalId: number): Promise<AdvisorClient | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(advisorClients).where(eq(advisorClients.externalId, externalId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAdvisorClientById(id: number): Promise<AdvisorClient | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(advisorClients).where(eq(advisorClients.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertClient(client: InsertAdvisorClient): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getClientByExternalId(client.externalId);
  if (existing) {
    await db.update(advisorClients)
      .set({
        name: client.name, email: client.email, phone: client.phone,
        birthDate: client.birthDate, registered: client.registered, status: client.status,
        totalBRL: client.totalBRL, walletBRL: client.walletBRL,
        walletUSDT: client.walletUSDT, walletBTC: client.walletBTC, walletETH: client.walletETH,
        securityBRL: client.securityBRL, expertBRL: client.expertBRL,
        secBRL: client.secBRL, expBRL: client.expBRL,
        securityUSDT: client.securityUSDT, expertUSDT: client.expertUSDT,
        secUSDT: client.secUSDT, expUSDT: client.expUSDT,
        securityBTC: client.securityBTC, secBTC: client.secBTC,
        securityETH: client.securityETH, secETH: client.secETH,
      })
      .where(eq(advisorClients.externalId, client.externalId));
  } else {
    await db.insert(advisorClients).values(client);
  }
}

export async function bulkUpsertClients(clientsList: InsertAdvisorClient[]): Promise<number> {
  let count = 0;
  for (const client of clientsList) {
    await upsertClient(client);
    count++;
  }
  return count;
}

export async function updateAdvisorClient(id: number, data: Partial<InsertAdvisorClient>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(advisorClients).set(data).where(eq(advisorClients.id, id));
}

export async function searchAdvisorClients(filters?: {
  search?: string;
  riskProfile?: string;
  status?: string;
}): Promise<AdvisorClient[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(advisorClients).where(
    and(
      filters?.search
        ? or(
            like(advisorClients.name, `%${filters.search}%`),
            like(advisorClients.email, `%${filters.search}%`)
          )
        : undefined,
      filters?.riskProfile ? eq(advisorClients.riskProfile, filters.riskProfile as any) : undefined,
      filters?.status ? eq(advisorClients.status, filters.status as any) : undefined,
    )
  ).orderBy(asc(advisorClients.name));
}

// ============ TRANSACTION QUERIES ============

export async function getClientTransactions(clientExternalId: number): Promise<ClientTransaction[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(clientTransactions)
    .where(eq(clientTransactions.clientExternalId, clientExternalId))
    .orderBy(desc(clientTransactions.createdAt));
}

export async function getAllTransactions(): Promise<ClientTransaction[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(clientTransactions).orderBy(desc(clientTransactions.createdAt));
}

export async function addTransaction(tx: InsertClientTransaction): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(clientTransactions).values(tx);
}

export async function bulkAddTransactions(txs: InsertClientTransaction[]): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (txs.length === 0) return 0;
  await db.insert(clientTransactions).values(txs);
  return txs.length;
}

export async function deleteTransaction(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(clientTransactions).where(eq(clientTransactions.id, id));
}

// ============ IMPORT SNAPSHOT QUERIES ============

export async function createSnapshot(snap: InsertImportSnapshot): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(importSnapshots).values(snap);
}

export async function getSnapshots(): Promise<ImportSnapshot[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(importSnapshots).orderBy(desc(importSnapshots.createdAt)).limit(20);
}

// ============ STATS ============

export async function getClientStats() {
  const db = await getDb();
  if (!db) return { totalClients: 0, activeClients: 0, totalAUM: "0" };
  const allClients = await db.select().from(advisorClients);
  const active = allClients.filter(c => c.status === "Ativado");
  const totalAUM = allClients.reduce((sum, c) => sum + parseFloat(c.totalBRL as string), 0);
  return {
    totalClients: allClients.length,
    activeClients: active.length,
    totalAUM: totalAUM.toFixed(2),
  };
}

// ============ FAMILY MEMBERS (CRM) ============

export async function getFamilyMembers(clientId: number): Promise<FamilyMember[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(familyMembers).where(eq(familyMembers.clientId, clientId)).orderBy(asc(familyMembers.name));
}

export async function upsertFamilyMember(data: InsertFamilyMember & { id?: number }) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  if (data.id) {
    await db.update(familyMembers).set(data).where(eq(familyMembers.id, data.id));
    return data.id;
  }
  const result = await db.insert(familyMembers).values(data);
  return (result[0] as any).insertId;
}

export async function deleteFamilyMember(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(familyMembers).where(eq(familyMembers.id, id));
}

// ============ SPECIAL DATES (CRM) ============

export async function getSpecialDates(clientId: number): Promise<SpecialDate[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(specialDates).where(eq(specialDates.clientId, clientId)).orderBy(asc(specialDates.date));
}

export async function getUpcomingDates(days: number = 30) {
  const db = await getDb();
  if (!db) return [];

  const today = new Date();
  const results: Array<{ date: SpecialDate; clientName: string; clientId: number }> = [];

  const allClients = await db.select({ id: advisorClients.id, name: advisorClients.name })
    .from(advisorClients).where(eq(advisorClients.isActive, true));

  for (const client of allClients) {
    const dates = await db.select().from(specialDates).where(eq(specialDates.clientId, client.id));
    for (const d of dates) {
      const [year, month, day2] = d.date.split("-").map(Number);
      const thisYear = new Date(today.getFullYear(), (month ?? 1) - 1, day2 ?? 1);
      const nextYear = new Date(today.getFullYear() + 1, (month ?? 1) - 1, day2 ?? 1);
      const target = thisYear >= today ? thisYear : nextYear;
      const diffDays = Math.floor((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays <= days) {
        results.push({ date: d, clientName: client.name, clientId: client.id });
      }
    }
  }

  return results.sort((a, b) => {
    const [, am, ad] = a.date.date.split("-").map(Number);
    const [, bm, bd] = b.date.date.split("-").map(Number);
    const today2 = new Date();
    const aDate = new Date(today2.getFullYear(), (am ?? 1) - 1, ad ?? 1);
    const bDate = new Date(today2.getFullYear(), (bm ?? 1) - 1, bd ?? 1);
    if (aDate < today2) aDate.setFullYear(today2.getFullYear() + 1);
    if (bDate < today2) bDate.setFullYear(today2.getFullYear() + 1);
    return aDate.getTime() - bDate.getTime();
  });
}

export async function upsertSpecialDate(data: InsertSpecialDate & { id?: number }) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  if (data.id) {
    await db.update(specialDates).set(data).where(eq(specialDates.id, data.id));
    return data.id;
  }
  const result = await db.insert(specialDates).values(data);
  return (result[0] as any).insertId;
}

export async function deleteSpecialDate(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(specialDates).where(eq(specialDates.id, id));
}

// ============ PORTFOLIO (CRM) ============

export async function getPortfolio(clientId: number): Promise<Portfolio | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(portfolios).where(eq(portfolios.clientId, clientId)).limit(1);
  return result[0] ?? null;
}

export async function upsertPortfolio(data: InsertPortfolio) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const existing = await getPortfolio(data.clientId);
  if (existing) {
    await db.update(portfolios).set({ ...data, lastUpdated: new Date() }).where(eq(portfolios.clientId, data.clientId));
  } else {
    await db.insert(portfolios).values(data);
  }
}

export async function getPortfolioDistribution() {
  const db = await getDb();
  if (!db) return { sectors: [], ranges: { ate1m: 0, de1ma5m: 0, de5ma20m: 0, acima20m: 0 } };

  const allPortfolios = await db
    .select({ portfolio: portfolios, client: advisorClients })
    .from(portfolios)
    .innerJoin(advisorClients, eq(portfolios.clientId, advisorClients.id))
    .where(eq(advisorClients.isActive, true));

  const sectorTotals: Record<string, number> = {
    "Imóveis": 0, "Investimentos": 0, "Veículos": 0, "Cripto": 0,
    "Renda Fixa": 0, "Ações": 0, "Participações": 0, "Outros": 0,
  };
  const ranges = { ate1m: 0, de1ma5m: 0, de5ma20m: 0, acima20m: 0 };

  for (const r of allPortfolios) {
    const p = r.portfolio;
    sectorTotals["Imóveis"] += parseFloat(p.realEstate ?? "0");
    sectorTotals["Investimentos"] += parseFloat(p.investments ?? "0");
    sectorTotals["Veículos"] += parseFloat(p.vehicles ?? "0");
    sectorTotals["Cripto"] += parseFloat(p.crypto ?? "0");
    sectorTotals["Renda Fixa"] += parseFloat(p.fixedIncome ?? "0");
    sectorTotals["Ações"] += parseFloat(p.stocks ?? "0");
    sectorTotals["Participações"] += parseFloat(p.businessEquity ?? "0");
    sectorTotals["Outros"] += parseFloat(p.others ?? "0");

    const cap = parseFloat(p.totalCapital ?? "0");
    if (cap <= 1_000_000) ranges.ate1m++;
    else if (cap <= 5_000_000) ranges.de1ma5m++;
    else if (cap <= 20_000_000) ranges.de5ma20m++;
    else ranges.acima20m++;
  }

  const sectors = Object.entries(sectorTotals)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  return { sectors, ranges };
}

// ============ NEUROSCIENCE (CRM) ============

export async function getNeuroscienceAnswers(clientId: number): Promise<NeuroscienceAnswer | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(neuroscienceAnswers).where(eq(neuroscienceAnswers.clientId, clientId)).limit(1);
  return result[0] ?? null;
}

export async function upsertNeuroscienceAnswers(data: InsertNeuroscienceAnswer) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const existing = await getNeuroscienceAnswers(data.clientId);
  if (existing) {
    await db.update(neuroscienceAnswers).set(data).where(eq(neuroscienceAnswers.clientId, data.clientId));
  } else {
    await db.insert(neuroscienceAnswers).values(data);
  }
}

// ============ GIFT HISTORY (CRM) ============

export async function getGiftHistory(clientId: number): Promise<GiftHistory[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(giftHistory).where(eq(giftHistory.clientId, clientId)).orderBy(desc(giftHistory.giftDate));
}

export async function getAllGiftHistory() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(giftHistory).orderBy(desc(giftHistory.giftDate));
}

export async function addGift(data: InsertGiftHistory) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(giftHistory).values(data);
}

export async function deleteGift(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(giftHistory).where(eq(giftHistory.id, id));
}

// ============ INTERACTIONS (CRM) ============

export async function getInteractions(clientId: number): Promise<Interaction[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(interactions).where(eq(interactions.clientId, clientId)).orderBy(desc(interactions.interactionDate));
}

export async function addInteraction(data: InsertInteraction) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(interactions).values(data);
}

export async function deleteInteraction(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(interactions).where(eq(interactions.id, id));
}

// ============ CLIENT FORM TOKENS ============

export async function createFormToken(data: InsertClientFormToken): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(clientFormTokens).values(data);
}

export async function getFormTokenByToken(token: string): Promise<ClientFormToken | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(clientFormTokens).where(eq(clientFormTokens.token, token)).limit(1);
  return result[0] ?? null;
}

export async function getFormTokensByClient(clientId: number): Promise<ClientFormToken[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(clientFormTokens)
    .where(eq(clientFormTokens.clientId, clientId))
    .orderBy(desc(clientFormTokens.createdAt));
}

export async function markFormTokenCompleted(token: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(clientFormTokens)
    .set({ status: "completed", completedAt: new Date() })
    .where(eq(clientFormTokens.token, token));
}

export async function deleteFormToken(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(clientFormTokens).where(eq(clientFormTokens.id, id));
}

// ============ DASHBOARD STATS (CRM) ============

export async function getCrmDashboardStats() {
  const db = await getDb();
  if (!db) return null;

  const allClients = await db.select().from(advisorClients).where(eq(advisorClients.isActive, true));
  const totalClients = allClients.length;
  const totalAUM = allClients.reduce((sum, c) => sum + parseFloat(c.totalBRL as string), 0);
  const avgCapital = totalClients > 0 ? totalAUM / totalClients : 0;

  const riskDistribution = {
    conservador: 0, moderado: 0, arrojado: 0, agressivo: 0, indefinido: 0,
  };
  for (const c of allClients) {
    const profile = c.riskProfile ?? "indefinido";
    if (profile in riskDistribution) {
      (riskDistribution as any)[profile]++;
    } else {
      riskDistribution.indefinido++;
    }
  }

  return { totalClients, totalCapital: totalAUM, avgCapital, riskDistribution };
}

// ============ ONIL CONTRACTS ============

function parseDate(dateStr: string): Date | null {
  // "13/04/2026" → Date
  const m = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (!m) return null;
  return new Date(parseInt(m[3]), parseInt(m[2]) - 1, parseInt(m[1]));
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export async function bulkUpsertContracts(contracts: InsertOnilContract[]): Promise<number> {
  const db = await getDb();
  if (!db || contracts.length === 0) return 0;

  for (const c of contracts) {
    const start = parseDate(c.startDate);
    if (start) {
      const expiry = addDays(start, c.totalDays);
      c.expiryDate = formatDate(expiry);
      const today = new Date();
      const diff = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      c.daysRemaining = Math.max(0, diff);
    }
    await db.insert(onilContracts).values(c).onDuplicateKeyUpdate({
      set: {
        daysElapsed: c.daysElapsed,
        daysRemaining: c.daysRemaining ?? 0,
        expiryDate: c.expiryDate,
        status: c.status,
        value: c.value,
        updatedAt: new Date(),
      },
    });
  }
  return contracts.length;
}

export async function getAllContracts(): Promise<OnilContract[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(onilContracts).orderBy(asc(onilContracts.daysRemaining));
}

export async function getExpiringContracts(days = 30): Promise<OnilContract[]> {
  const db = await getDb();
  if (!db) return [];
  const all = await db.select().from(onilContracts)
    .where(eq(onilContracts.status, "Em andamento"))
    .orderBy(asc(onilContracts.daysRemaining));
  return all.filter(c => (c.daysRemaining ?? 999) <= days);
}

export async function getContractStats() {
  const db = await getDb();
  if (!db) return { total: 0, active: 0, expiringSoon: 0, expiredThisMonth: 0 };
  const all = await db.select().from(onilContracts);
  const active = all.filter(c => c.status === "Em andamento").length;
  const expiringSoon = all.filter(c => c.status === "Em andamento" && (c.daysRemaining ?? 999) <= 30).length;
  const expiredThisMonth = all.filter(c => {
    if (!c.expiryDate) return false;
    const d = parseDate(c.expiryDate);
    if (!d) return false;
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  return { total: all.length, active, expiringSoon, expiredThisMonth };
}
