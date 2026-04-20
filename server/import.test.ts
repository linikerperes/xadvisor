import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createMockContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as unknown as TrpcContext["res"],
  };
}

describe("clients.bulkImport", () => {
  it("accepts valid client data and returns imported count", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const input = {
      clients: [
        {
          externalId: 99999,
          name: "Test Client",
          email: "test@test.com",
          status: "Ativado" as const,
          totalBRL: "10000.50",
          walletBRL: "5000.00",
          walletUSDT: "0",
          walletBTC: "0.001",
          walletETH: "0",
          securityBRL: "0",
          expertBRL: "0",
          secBRL: "5000.50",
          expBRL: "0",
          securityUSDT: "0",
          expertUSDT: "0",
          secUSDT: "0",
          expUSDT: "0",
          securityBTC: "0",
          secBTC: "0",
          securityETH: "0",
          secETH: "0",
        },
      ],
      notes: "Test import",
    };

    const result = await caller.clients.bulkImport(input);
    expect(result).toHaveProperty("imported");
    expect(result.imported).toBe(1);
  });

  it("handles empty client array", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.clients.bulkImport({ clients: [] });
    expect(result.imported).toBe(0);
  });
});

describe("transactions.bulkImport", () => {
  it("accepts valid transaction data", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const input = {
      transactions: [
        {
          clientExternalId: 99999,
          type: "deposito" as const,
          amount: "10000.00",
          date: "15/01/2025",
          description: "Aporte inicial",
        },
        {
          clientExternalId: 99999,
          type: "saque" as const,
          amount: "2000.00",
          date: "20/01/2025",
          description: "Resgate parcial",
        },
      ],
    };

    const result = await caller.transactions.bulkImport(input);
    expect(result).toHaveProperty("imported");
    expect(result.imported).toBe(2);
  });
});

// AI test moved to ai.test.ts with proper timeout

describe("clients.stats", () => {
  it("returns stats object with expected fields", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.clients.stats();
    expect(result).toHaveProperty("totalClients");
    expect(result).toHaveProperty("activeClients");
    expect(result).toHaveProperty("totalAUM");
    expect(typeof result.totalClients).toBe("number");
  });
});

describe("snapshots.list", () => {
  it("returns an array of snapshots", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.snapshots.list();
    expect(Array.isArray(result)).toBe(true);
  });
});
