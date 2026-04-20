import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { nanoid } from "nanoid";
import axios from "axios";
import { execFile } from "child_process";
import path from "path";
import {
  // Onil / LP Advisor
  getAllClients, getClientByExternalId, bulkUpsertClients,
  getClientTransactions, getAllTransactions, addTransaction, bulkAddTransactions, deleteTransaction,
  createSnapshot, getSnapshots, getClientStats,
  getAdvisorClientById, updateAdvisorClient, searchAdvisorClients, getAllGiftHistory,
  bulkUpsertContracts, getAllContracts, getExpiringContracts, getContractStats,
  // CRM
  getFamilyMembers, upsertFamilyMember, deleteFamilyMember,
  getSpecialDates, getUpcomingDates, upsertSpecialDate, deleteSpecialDate,
  getPortfolio, upsertPortfolio, getPortfolioDistribution,
  getNeuroscienceAnswers, upsertNeuroscienceAnswers,
  getGiftHistory, addGift, deleteGift,
  getInteractions, addInteraction, deleteInteraction,
  getCrmDashboardStats,
  // Form tokens
  createFormToken, getFormTokenByToken, getFormTokensByClient,
  markFormTokenCompleted, deleteFormToken,
  // DB access
  getDb,
} from "./db";

// ─── Onil client schema ──────────────────────────────────────────────────────
const clientSchema = z.object({
  externalId: z.number(),
  name: z.string(),
  email: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  birthDate: z.string().optional().nullable(),
  registered: z.string().optional().nullable(),
  status: z.enum(["Ativado", "Inativo"]).default("Ativado"),
  totalBRL: z.string().default("0"),
  walletBRL: z.string().default("0"),
  walletUSDT: z.string().default("0"),
  walletBTC: z.string().default("0"),
  walletETH: z.string().default("0"),
  securityBRL: z.string().default("0"),
  expertBRL: z.string().default("0"),
  secBRL: z.string().default("0"),
  expBRL: z.string().default("0"),
  securityUSDT: z.string().default("0"),
  expertUSDT: z.string().default("0"),
  secUSDT: z.string().default("0"),
  expUSDT: z.string().default("0"),
  securityBTC: z.string().default("0"),
  secBTC: z.string().default("0"),
  securityETH: z.string().default("0"),
  secETH: z.string().default("0"),
});

const transactionSchema = z.object({
  clientExternalId: z.number(),
  type: z.enum(["deposito", "saque"]),
  amount: z.string(),
  date: z.string(),
  description: z.string().optional().nullable(),
});

// ─── CRM: Family Router ─────────────────────────────────────────────────────
const familyRouter = router({
  list: publicProcedure
    .input(z.object({ clientId: z.number() }))
    .query(async ({ input }) => getFamilyMembers(input.clientId)),

  upsert: publicProcedure
    .input(z.object({
      id: z.number().optional(),
      clientId: z.number(),
      name: z.string().min(1),
      relationship: z.enum(["filho", "filha", "conjuge", "pai", "mae", "irmao", "irma", "outro"]),
      birthDate: z.string().optional(),
      interests: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      await upsertFamilyMember(input);
      return { success: true };
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteFamilyMember(input.id);
      return { success: true };
    }),
});

// ─── CRM: Special Dates Router ──────────────────────────────────────────────
const datesRouter = router({
  list: publicProcedure
    .input(z.object({ clientId: z.number() }))
    .query(async ({ input }) => getSpecialDates(input.clientId)),

  upcoming: publicProcedure
    .input(z.object({ days: z.number().default(30) }))
    .query(async ({ input }) => getUpcomingDates(input.days)),

  upsert: publicProcedure
    .input(z.object({
      id: z.number().optional(),
      clientId: z.number(),
      title: z.string().min(1),
      date: z.string(),
      type: z.enum(["aniversario_cliente", "aniversario_familiar", "casamento", "aniversario_empresa", "outro"]),
      personName: z.string().optional(),
      alertDaysBefore: z.number().default(30),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      await upsertSpecialDate(input);
      return { success: true };
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteSpecialDate(input.id);
      return { success: true };
    }),
});

// ─── CRM: Portfolio Router ──────────────────────────────────────────────────
const portfolioRouter = router({
  get: publicProcedure
    .input(z.object({ clientId: z.number() }))
    .query(async ({ input }) => getPortfolio(input.clientId)),

  upsert: publicProcedure
    .input(z.object({
      clientId: z.number(),
      totalCapital: z.string().optional(),
      realEstate: z.string().optional(),
      investments: z.string().optional(),
      vehicles: z.string().optional(),
      crypto: z.string().optional(),
      fixedIncome: z.string().optional(),
      stocks: z.string().optional(),
      businessEquity: z.string().optional(),
      others: z.string().optional(),
      othersDescription: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      await upsertPortfolio(input);
      return { success: true };
    }),
});

// ─── CRM: Neuroscience Router ───────────────────────────────────────────────
const neuroscienceRouter = router({
  get: publicProcedure
    .input(z.object({ clientId: z.number() }))
    .query(async ({ input }) => getNeuroscienceAnswers(input.clientId)),

  save: publicProcedure
    .input(z.object({
      clientId: z.number(),
      answers: z.record(z.string(), z.any()),
      dominantProfile: z.enum(["dominante", "influente", "estavel", "cauteloso"]).optional(),
      secondaryProfile: z.enum(["dominante", "influente", "estavel", "cauteloso"]).optional(),
      primaryMotivator: z.string().optional(),
      decisionStyle: z.enum(["racional", "emocional", "intuitivo", "consultivo"]).optional(),
      communicationStyle: z.enum(["direto", "detalhista", "relacional", "analitico"]).optional(),
      giftPreferences: z.array(z.string()).optional(),
      experienceVsProduct: z.enum(["experiencia", "produto", "ambos"]).optional(),
      luxuryLevel: z.enum(["simples", "moderado", "luxo", "ultra_luxo"]).optional(),
      riskScore: z.number().optional(),
      riskProfile: z.enum(["conservador", "moderado", "arrojado", "agressivo"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const { riskScore, riskProfile, ...neuroData } = input;
      await upsertNeuroscienceAnswers({
        ...neuroData,
        completedAt: new Date(),
      });
      if (riskProfile || riskScore !== undefined) {
        await updateAdvisorClient(input.clientId, {
          ...(riskProfile ? { riskProfile } : {}),
          ...(riskScore !== undefined ? { riskScore } : {}),
        });
      }
      return { success: true };
    }),
});

// ─── CRM: Gifts Router ─────────────────────────────────────────────────────
const giftsRouter = router({
  list: publicProcedure
    .input(z.object({ clientId: z.number() }))
    .query(async ({ input }) => getGiftHistory(input.clientId)),

  listAll: publicProcedure
    .query(async () => getAllGiftHistory()),

  add: publicProcedure
    .input(z.object({
      clientId: z.number(),
      giftName: z.string().min(1),
      giftCategory: z.string().optional(),
      giftValue: z.string().optional(),
      occasion: z.string().optional(),
      giftDate: z.string(),
      reaction: z.enum(["adorou", "gostou", "neutro", "nao_gostou"]).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      await addGift(input);
      return { success: true };
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteGift(input.id);
      return { success: true };
    }),

  suggest: publicProcedure
    .input(z.object({ clientId: z.number(), occasion: z.string().optional() }))
    .mutation(async ({ input }) => {
      const clientData = await getAdvisorClientById(input.clientId);
      if (!clientData) throw new TRPCError({ code: "NOT_FOUND" });

      const [neuro, portfolio, pastGifts] = await Promise.all([
        getNeuroscienceAnswers(input.clientId),
        getPortfolio(input.clientId),
        getGiftHistory(input.clientId),
      ]);

      const capitalTotal = parseFloat(portfolio?.totalCapital ?? clientData.totalBRL as string ?? "0");
      const pastGiftNames = pastGifts.map((g) => g.giftName).join(", ");

      const prompt = `Você é um especialista em presentes personalizados para clientes de alto patrimônio.

Cliente: ${clientData.name}
Capital total: R$ ${capitalTotal.toLocaleString("pt-BR")}
Hobbies: ${clientData.hobbies ?? "não informado"}
Preferências de viagem: ${clientData.travelPreferences ?? "não informado"}
Time favorito: ${clientData.sportTeam ?? "não informado"}
Gênero musical: ${clientData.musicGenre ?? "não informado"}
Perfil psicológico dominante: ${neuro?.dominantProfile ?? "não avaliado"}
Estilo de decisão: ${neuro?.decisionStyle ?? "não avaliado"}
Preferência experiência vs produto: ${neuro?.experienceVsProduct ?? "não avaliado"}
Nível de luxo preferido: ${neuro?.luxuryLevel ?? "não avaliado"}
Motivador principal: ${neuro?.primaryMotivator ?? "não avaliado"}
Ocasião: ${input.occasion ?? "presente geral"}
Presentes já dados (evitar repetir): ${pastGiftNames || "nenhum ainda"}

Sugira 5 presentes personalizados e criativos para este cliente. Para cada presente inclua:
1. Nome do presente
2. Categoria (experiência, produto, gastronomia, etc.)
3. Faixa de valor estimado em R$
4. Justificativa baseada no perfil do cliente
5. Onde encontrar/como providenciar

Responda em JSON com o formato:
{
  "suggestions": [
    {
      "name": "nome do presente",
      "category": "categoria",
      "priceRange": "R$ X.XXX - R$ X.XXX",
      "justification": "justificativa",
      "howToGet": "como providenciar"
    }
  ]
}`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "Você é um especialista em presentes personalizados para clientes de alto patrimônio. Responda sempre em JSON válido." },
          { role: "user", content: prompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "gift_suggestions",
            strict: true,
            schema: {
              type: "object",
              properties: {
                suggestions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      category: { type: "string" },
                      priceRange: { type: "string" },
                      justification: { type: "string" },
                      howToGet: { type: "string" },
                    },
                    required: ["name", "category", "priceRange", "justification", "howToGet"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["suggestions"],
              additionalProperties: false,
            },
          },
        },
      });

      const rawContent = response.choices[0]?.message?.content;
      const content = typeof rawContent === "string" ? rawContent : null;
      if (!content) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Falha ao gerar sugestões" });

      try {
        return JSON.parse(content);
      } catch {
        return { suggestions: [] };
      }
    }),
});

// ─── CRM: Interactions Router ───────────────────────────────────────────────
const interactionsRouter = router({
  list: publicProcedure
    .input(z.object({ clientId: z.number() }))
    .query(async ({ input }) => getInteractions(input.clientId)),

  add: publicProcedure
    .input(z.object({
      clientId: z.number(),
      type: z.enum(["reuniao", "ligacao", "email", "whatsapp", "evento", "presente", "outro"]),
      title: z.string().min(1),
      description: z.string().optional(),
      interactionDate: z.string(),
      outcome: z.string().optional(),
      nextAction: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      await addInteraction(input);
      return { success: true };
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteInteraction(input.id);
      return { success: true };
    }),
});

// ─── CRM: Dashboard Router ─────────────────────────────────────────────────
const crmDashboardRouter = router({
  stats: publicProcedure.query(async () => getCrmDashboardStats()),
  upcoming: publicProcedure
    .input(z.object({ days: z.number().default(30) }))
    .query(async ({ input }) => getUpcomingDates(input.days)),
});

// ─── CRM: Reports Router ───────────────────────────────────────────────────
const reportsRouter = router({
  portfolioDistribution: publicProcedure.query(async () => getPortfolioDistribution()),
  riskDistribution: publicProcedure.query(async () => {
    const stats = await getCrmDashboardStats();
    return stats?.riskDistribution ?? {};
  }),
});

// ─── CRM: Client Form Router (public) ──────────────────────────────────────
const clientFormRouter = router({
  generate: publicProcedure
    .input(z.object({ clientId: z.number(), expiresInDays: z.number().default(30) }))
    .mutation(async ({ input }) => {
      const client = await getAdvisorClientById(input.clientId);
      if (!client) throw new TRPCError({ code: "NOT_FOUND" });
      const token = nanoid(32);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + input.expiresInDays);
      await createFormToken({ clientId: input.clientId, userId: 1, token, expiresAt });
      return { token };
    }),

  listTokens: publicProcedure
    .input(z.object({ clientId: z.number() }))
    .query(async ({ input }) => getFormTokensByClient(input.clientId)),

  revokeToken: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteFormToken(input.id);
      return { success: true };
    }),

  getByToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const tokenRecord = await getFormTokenByToken(input.token);
      if (!tokenRecord) throw new TRPCError({ code: "NOT_FOUND", message: "Link inválido ou expirado" });
      if (tokenRecord.status === "expired") throw new TRPCError({ code: "FORBIDDEN", message: "Este link expirou" });
      if (tokenRecord.status === "completed") return { status: "completed" as const, clientName: null };
      if (tokenRecord.expiresAt && new Date() > tokenRecord.expiresAt) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Este link expirou" });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const { advisorClients } = await import("../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const clientRows = await db.select({ name: advisorClients.name, email: advisorClients.email })
        .from(advisorClients).where(eq(advisorClients.id, tokenRecord.clientId)).limit(1);
      const clientInfo = clientRows[0] ?? null;
      return { status: "pending" as const, clientName: clientInfo?.name ?? null, clientEmail: clientInfo?.email ?? null };
    }),

  submit: publicProcedure
    .input(z.object({
      token: z.string(),
      hobbies: z.string().optional(),
      travelPreferences: z.string().optional(),
      sportTeam: z.string().optional(),
      musicGenre: z.string().optional(),
      favoriteRestaurants: z.string().optional(),
      favoriteBooks: z.string().optional(),
      notes: z.string().optional(),
      birthDate: z.string().optional(),
      phone: z.string().optional(),
      occupation: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      spouseName: z.string().optional(),
      spouseBirthDate: z.string().optional(),
      weddingDate: z.string().optional(),
      children: z.array(z.object({ name: z.string(), birthDate: z.string() })).optional(),
      answers: z.record(z.string(), z.string()).optional(),
      dominantProfile: z.enum(["dominante", "influente", "estavel", "cauteloso"]).optional(),
      secondaryProfile: z.enum(["dominante", "influente", "estavel", "cauteloso"]).optional(),
      primaryMotivator: z.string().optional(),
      decisionStyle: z.enum(["racional", "emocional", "intuitivo", "consultivo"]).optional(),
      communicationStyle: z.enum(["direto", "detalhista", "relacional", "analitico"]).optional(),
      experienceVsProduct: z.enum(["experiencia", "produto", "ambos"]).optional(),
      luxuryLevel: z.enum(["simples", "moderado", "luxo", "ultra_luxo"]).optional(),
      riskProfile: z.enum(["conservador", "moderado", "arrojado", "agressivo"]).optional(),
      riskScore: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const { token, answers, riskProfile, riskScore, children, ...rest } = input;
      const tokenRecord = await getFormTokenByToken(token);
      if (!tokenRecord) throw new TRPCError({ code: "NOT_FOUND" });
      if (tokenRecord.status !== "pending") throw new TRPCError({ code: "FORBIDDEN", message: "Formulário já preenchido" });
      if (tokenRecord.expiresAt && new Date() > tokenRecord.expiresAt) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Link expirado" });
      }

      // Update client personal data
      const allClientFields = [
        "hobbies", "travelPreferences", "sportTeam", "musicGenre", "favoriteRestaurants", "favoriteBooks",
        "notes", "birthDate", "phone", "occupation", "city", "state",
        "spouseName", "spouseBirthDate", "weddingDate",
      ] as const;
      const updateData: Record<string, string> = {};
      for (const field of allClientFields) {
        if (rest[field as keyof typeof rest]) updateData[field] = rest[field as keyof typeof rest] as string;
      }
      if (riskProfile) updateData.riskProfile = riskProfile;
      if (riskScore !== undefined) updateData.riskScore = String(riskScore);
      if (Object.keys(updateData).length > 0) {
        await updateAdvisorClient(tokenRecord.clientId, updateData);
      }

      // Save children as family members
      if (children && children.length > 0) {
        const db = await getDb();
        if (db) {
          const { familyMembers } = await import("../drizzle/schema");
          for (const child of children) {
            if (!child.name) continue;
            await db.insert(familyMembers).values({
              clientId: tokenRecord.clientId,
              name: child.name,
              relationship: "filho",
              birthDate: child.birthDate || undefined,
            });
          }
        }
      }

      // Save neuroscience answers
      const neuroFields = ["dominantProfile", "secondaryProfile", "primaryMotivator", "decisionStyle", "communicationStyle", "experienceVsProduct", "luxuryLevel"] as const;
      const hasNeuro = neuroFields.some((f) => (rest as any)[f]);
      if (hasNeuro || answers) {
        await upsertNeuroscienceAnswers({
          clientId: tokenRecord.clientId,
          ...(answers ? { answers } : {}),
          ...Object.fromEntries(neuroFields.filter(f => (rest as any)[f]).map(f => [f, (rest as any)[f]])),
          completedAt: new Date(),
        });
      }

      await markFormTokenCompleted(token);
      return { success: true };
    }),
});

// ─── Utils Router (CNPJ, CEP, encurtador) ──────────────────────────────────
const utilsRouter = router({
  lookupCnpj: publicProcedure
    .input(z.object({ cnpj: z.string() }))
    .query(async ({ input }) => {
      const clean = input.cnpj.replace(/\D/g, "");
      if (clean.length !== 14) throw new TRPCError({ code: "BAD_REQUEST", message: "CNPJ inválido" });
      try {
        const res = await axios.get(`https://brasilapi.com.br/api/cnpj/v1/${clean}`, { timeout: 8000 });
        const d = res.data;
        return {
          razaoSocial: d.razao_social ?? "", nomeFantasia: d.nome_fantasia ?? "",
          situacao: d.descricao_situacao_cadastral ?? "",
          cep: d.cep ?? "", logradouro: d.logradouro ?? "", numero: d.numero ?? "",
          complemento: d.complemento ?? "", bairro: d.bairro ?? "",
          municipio: d.municipio ?? "", uf: d.uf ?? "",
          telefone: d.ddd_telefone_1 ?? "", email: d.email ?? "",
          atividadePrincipal: d.cnae_fiscal_descricao ?? "",
          capitalSocial: d.capital_social ?? 0, dataAbertura: d.data_inicio_atividade ?? "",
          socios: (d.qsa ?? []).map((s: Record<string, string>) => s.nome_socio ?? ""),
        };
      } catch {
        throw new TRPCError({ code: "NOT_FOUND", message: "CNPJ não encontrado ou serviço indisponível" });
      }
    }),

  lookupCep: publicProcedure
    .input(z.object({ cep: z.string() }))
    .query(async ({ input }) => {
      const clean = input.cep.replace(/\D/g, "");
      if (clean.length !== 8) throw new TRPCError({ code: "BAD_REQUEST", message: "CEP inválido" });
      try {
        const res = await axios.get(`https://brasilapi.com.br/api/cep/v2/${clean}`, { timeout: 8000 });
        const d = res.data;
        return { cep: d.cep ?? "", logradouro: d.street ?? "", bairro: d.neighborhood ?? "", cidade: d.city ?? "", estado: d.state ?? "" };
      } catch {
        throw new TRPCError({ code: "NOT_FOUND", message: "CEP não encontrado" });
      }
    }),

  shortenLink: publicProcedure
    .input(z.object({ url: z.string().url(), clientId: z.number().optional() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const { linkShortcuts } = await import("../drizzle/schema");
      const shortCode = nanoid(8);
      await db.insert(linkShortcuts).values({
        shortCode,
        targetUrl: input.url,
        clientId: input.clientId ?? null,
        userId: 1,
      });
      return { shortCode, shortUrl: `/s/${shortCode}` };
    }),

  resolveShortLink: publicProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const { linkShortcuts } = await import("../drizzle/schema");
      const { eq, sql } = await import("drizzle-orm");
      const rows = await db.select().from(linkShortcuts).where(eq(linkShortcuts.shortCode, input.code)).limit(1);
      if (!rows[0]) throw new TRPCError({ code: "NOT_FOUND" });
      await db.update(linkShortcuts).set({ clicks: sql`${linkShortcuts.clicks} + 1` }).where(eq(linkShortcuts.shortCode, input.code));
      return { targetUrl: rows[0].targetUrl };
    }),
});

// ─── Notifications Router ───────────────────────────────────────────────────
const notificationsRouter = router({
  getSettings: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return null;
    const { notificationSettings } = await import("../drizzle/schema");
    const rows = await db.select().from(notificationSettings).limit(1);
    return rows[0] ?? null;
  }),

  saveSettings: publicProcedure
    .input(z.object({
      email: z.string().email(),
      enabled: z.boolean(),
      sendDays: z.array(z.number().min(0).max(6)),
      sendHour: z.number().min(0).max(23),
      daysAhead: z.number().min(1).max(90),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const { notificationSettings } = await import("../drizzle/schema");
      const existing = await db.select({ id: notificationSettings.id }).from(notificationSettings).limit(1);
      const updatePayload = {
        email: input.email,
        enabled: input.enabled,
        sendDays: JSON.stringify(input.sendDays) as unknown as number[],
        sendHour: input.sendHour,
        daysAhead: input.daysAhead,
      };
      if (existing[0]) {
        const { eq } = await import("drizzle-orm");
        await db.update(notificationSettings).set(updatePayload).where(eq(notificationSettings.id, existing[0].id));
      } else {
        await db.insert(notificationSettings).values([{ userId: 1, ...updatePayload }]);
      }
      return { success: true };
    }),
});

// ─── CRM: Advisor Client Update ────────────────────────────────────────────
const advisorClientCrmRouter = router({
  search: publicProcedure
    .input(z.object({
      query: z.string().optional(),
      riskProfile: z.string().optional(),
      isActive: z.boolean().optional(),
    }).optional())
    .query(async ({ input }) => searchAdvisorClients(input ?? {})),

  get: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const client = await getAdvisorClientById(input.id);
      if (!client) throw new TRPCError({ code: "NOT_FOUND" });
      const [family, dates, portfolio, neuro, gifts, ints] = await Promise.all([
        getFamilyMembers(input.id),
        getSpecialDates(input.id),
        getPortfolio(input.id),
        getNeuroscienceAnswers(input.id),
        getGiftHistory(input.id),
        getInteractions(input.id),
      ]);
      return { client, family, dates, portfolio, neuro, gifts, interactions: ints };
    }),

  update: publicProcedure
    .input(z.object({
      id: z.number(),
      hobbies: z.string().optional(),
      favoriteRestaurants: z.string().optional(),
      travelPreferences: z.string().optional(),
      sportTeam: z.string().optional(),
      musicGenre: z.string().optional(),
      favoriteBooks: z.string().optional(),
      notes: z.string().optional(),
      spouseName: z.string().optional(),
      spouseBirthDate: z.string().optional(),
      weddingDate: z.string().optional(),
      occupation: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      cpf: z.string().optional(),
      riskProfile: z.enum(["conservador", "moderado", "arrojado", "agressivo"]).optional(),
      riskScore: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateAdvisorClient(id, data);
      return { success: true };
    }),

  uploadPhoto: publicProcedure
    .input(z.object({
      clientId: z.number(),
      base64: z.string(),
      mimeType: z.string().default("image/jpeg"),
    }))
    .mutation(async ({ input }) => {
      const client = await getAdvisorClientById(input.clientId);
      if (!client) throw new TRPCError({ code: "NOT_FOUND" });
      const { storagePut } = await import("./storage");
      const base64Data = input.base64.replace(/^data:[^;]+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      const ext = input.mimeType === "image/png" ? "png" : "jpg";
      const key = `client-photos/${input.clientId}-${Date.now()}.${ext}`;
      const { url } = await storagePut(key, buffer, input.mimeType);
      await updateAdvisorClient(input.clientId, { photoUrl: url });
      return { success: true, url };
    }),
});

// ─── App Router ─────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,

  // ============ SYNC ONIL ============
  sync: router({
    onil: publicProcedure.mutation(async () => {
      const login = process.env.ONIL_LOGIN;
      const senha = process.env.ONIL_SENHA;
      if (!login || !senha) throw new TRPCError({ code: "BAD_REQUEST", message: "ONIL_LOGIN e ONIL_SENHA não configurados no .env" });

      const scriptPath = path.resolve(process.cwd(), "scripts/sync-onil.mjs");

      const result = await new Promise<{ clients: any[] }>((resolve, reject) => {
        execFile("node", [scriptPath], {
          env: { ...process.env, ONIL_LOGIN: login, ONIL_SENHA: senha },
          maxBuffer: 20 * 1024 * 1024,
          timeout: 5 * 60 * 1000,
        }, (err, stdout, stderr) => {
          if (stderr) console.log("[onil-scraper]", stderr);
          if (err) return reject(new Error(err.message));
          try {
            const data = JSON.parse(stdout);
            if (data.error) return reject(new Error(data.error));
            resolve(data);
          } catch (e) {
            reject(new Error("Falha ao parsear saída do scraper"));
          }
        });
      });

      const count = await bulkUpsertClients(result.clients);
      const contractCount = result.contracts?.length
        ? await bulkUpsertContracts(result.contracts)
        : 0;
      const totalAUM = result.clients.reduce((s: number, c: any) => s + parseFloat(c.totalBRL || "0"), 0);
      await createSnapshot({
        source: "onil",
        totalClients: count,
        totalAUM: totalAUM.toFixed(2),
        totalTransactions: 0,
        notes: `Sync automático Onil — ${count} clientes, ${contractCount} contratos`,
      });
      return { imported: count, contracts: contractCount, totalAUM: totalAUM.toFixed(2) };
    }),
  }),

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),

    loginWithOnil: publicProcedure
      .input(z.object({ email: z.string().email(), password: z.string().min(1) }))
      .mutation(async ({ input, ctx }) => {
        const scriptPath = path.resolve(process.cwd(), "scripts/onil-auth.mjs");

        // Valida credenciais no portal Onil
        const result = await new Promise<any>((resolve, reject) => {
          execFile("node", [scriptPath, input.email, input.password], {
            timeout: 40000,
            maxBuffer: 1024 * 1024,
          }, (err, stdout) => {
            if (err) return reject(new Error("Erro ao validar credenciais"));
            try { resolve(JSON.parse(stdout)); }
            catch { reject(new Error("Resposta inválida do validador")); }
          });
        });

        if (!result.valid) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: result.error || "Credenciais da Onil inválidas" });
        }

        // Criptografa a senha para armazenar
        const { createCipheriv, createDecipheriv, randomBytes, scryptSync } = await import("crypto");
        const secret = (process.env.JWT_SECRET || "x-advisor-secret").padEnd(32, "0").slice(0, 32);
        const iv = randomBytes(16);
        const cipher = createCipheriv("aes-256-cbc", Buffer.from(secret), iv);
        const encrypted = Buffer.concat([cipher.update(input.password, "utf8"), cipher.final()]);
        const onilPasswordEnc = iv.toString("hex") + ":" + encrypted.toString("hex");

        // Cria ou atualiza user no banco
        const db = await getDb();
        const openId = `onil:${input.email}`;
        let user = null;
        if (db) {
          const existing = await db.select().from(
            (await import("../drizzle/schema")).users
          ).where((await import("drizzle-orm")).eq(
            (await import("../drizzle/schema")).users.openId, openId
          )).limit(1);

          if (existing.length > 0) {
            await db.update((await import("../drizzle/schema")).users)
              .set({ onilPasswordEnc, lastSignedIn: new Date(), companyName: result.company || existing[0].companyName })
              .where((await import("drizzle-orm")).eq((await import("../drizzle/schema")).users.id, existing[0].id));
            user = { ...existing[0], name: result.name || existing[0].name };
          } else {
            const trialEnds = new Date();
            trialEnds.setDate(trialEnds.getDate() + 14); // 14 dias de trial
            const inserted = await db.insert((await import("../drizzle/schema")).users).values({
              openId,
              name: result.name || input.email.split("@")[0],
              email: input.email,
              onilEmail: input.email,
              onilPasswordEnc,
              companyName: result.company || "Assessor",
              loginMethod: "onil",
              subscriptionStatus: "trial",
              trialEndsAt: trialEnds,
              role: "user",
            });
            user = { id: Number(inserted[0].insertId), openId, name: result.name, email: input.email };
          }
        }

        // Assina o JWT de sessão compatível com o sistema existente
        const { sdk } = await import("./_core/sdk");
        const token = await sdk.signSession({
          openId,
          appId: "x-advisor",
          name: result.name || input.email,
        });

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, {
          ...cookieOptions,
          maxAge: 365 * 24 * 60 * 60 * 1000,
        });

        return { success: true, name: result.name, company: result.company };
      }),

    // Retorna notícias macro + cripto
    news: publicProcedure.query(async () => {
      try {
        const [cryptoRes, macroRes] = await Promise.allSettled([
          axios.get("https://cryptopanic.com/api/v1/posts/?auth_token=free&public=true&kind=news&currencies=BTC,ETH,BRL", { timeout: 5000 }),
          axios.get("https://newsapi.org/v2/top-headlines?category=business&country=br&pageSize=10&apiKey=demo", { timeout: 5000 }),
        ]);

        const cryptoNews = cryptoRes.status === "fulfilled"
          ? (cryptoRes.value.data?.results || []).slice(0, 10).map((n: any) => ({
              title: n.title,
              url: n.url,
              source: n.source?.title || "CryptoPanic",
              publishedAt: n.published_at,
              type: "crypto",
            }))
          : [];

        // Fallback: busca RSS de notícias financeiras
        const macroNews: any[] = [];

        return { crypto: cryptoNews, macro: macroNews };
      } catch {
        return { crypto: [], macro: [] };
      }
    }),
  }),

  // ============ AI ANALYSIS ============
  ai: router({
    analyze: publicProcedure
      .input(z.object({
        prompt: z.string().min(1).max(2000),
        context: z.string().max(50000),
      }))
      .mutation(async ({ input }) => {
        const systemPrompt = `Você é um assistente de análise financeira de elite para o assessor Líniker Peres (ANCORD AI, CCA - Criptoativos). 
Analise os dados da carteira de investidores e forneça insights acionáveis.
Use linguagem profissional mas acessível. Formate com markdown.
Considere aspectos de neurociência financeira quando relevante (vieses cognitivos, tomada de decisão).
Sempre responda em português brasileiro.`;

        const userMessage = `CONTEXTO DOS DADOS DA CARTEIRA:\n${input.context}\n\nPERGUNTA/SOLICITAÇÃO DO ASSESSOR:\n${input.prompt}`;

        const result = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
        });

        const text = result.choices?.[0]?.message?.content;
        const responseText = typeof text === "string" ? text : "Sem resposta da IA.";
        return { response: responseText };
      }),
  }),

  // ============ ONIL CLIENTS ============
  clients: router({
    list: publicProcedure.query(async () => getAllClients()),
    getByExternalId: publicProcedure
      .input(z.object({ externalId: z.number() }))
      .query(async ({ input }) => getClientByExternalId(input.externalId)),
    bulkImport: publicProcedure
      .input(z.object({ clients: z.array(clientSchema), notes: z.string().optional() }))
      .mutation(async ({ input }) => {
        const count = await bulkUpsertClients(input.clients);
        const totalAUM = input.clients.reduce((s, c) => s + parseFloat(c.totalBRL || "0"), 0);
        await createSnapshot({
          source: "onil", totalClients: count,
          totalAUM: totalAUM.toFixed(2), totalTransactions: 0,
          notes: input.notes || `Importação de ${count} clientes`,
        });
        return { imported: count };
      }),
    stats: publicProcedure.query(async () => getClientStats()),
  }),

  // ============ TRANSACTIONS ============
  transactions: router({
    listByClient: publicProcedure
      .input(z.object({ clientExternalId: z.number() }))
      .query(async ({ input }) => getClientTransactions(input.clientExternalId)),
    listAll: publicProcedure.query(async () => getAllTransactions()),
    add: publicProcedure.input(transactionSchema).mutation(async ({ input }) => {
      await addTransaction(input);
      return { success: true };
    }),
    bulkImport: publicProcedure
      .input(z.object({ transactions: z.array(transactionSchema) }))
      .mutation(async ({ input }) => {
        const count = await bulkAddTransactions(input.transactions);
        return { imported: count };
      }),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteTransaction(input.id);
        return { success: true };
      }),
  }),

  // ============ ONIL CONTRACTS ============
  contracts: router({
    list: publicProcedure.query(async () => getAllContracts()),
    expiring: publicProcedure
      .input(z.object({ days: z.number().default(30) }))
      .query(async ({ input }) => getExpiringContracts(input.days)),
    stats: publicProcedure.query(async () => getContractStats()),
  }),

  // ============ IMPORT SNAPSHOTS ============
  snapshots: router({
    list: publicProcedure.query(async () => getSnapshots()),
  }),

  // ============ CRM ROUTERS ============
  advisorCrm: advisorClientCrmRouter,
  family: familyRouter,
  dates: datesRouter,
  portfolio: portfolioRouter,
  neuroscience: neuroscienceRouter,
  gifts: giftsRouter,
  interactions: interactionsRouter,
  crmDashboard: crmDashboardRouter,
  reports: reportsRouter,
  clientForm: clientFormRouter,
  utils: utilsRouter,
  notifications: notificationsRouter,
});

export type AppRouter = typeof appRouter;
