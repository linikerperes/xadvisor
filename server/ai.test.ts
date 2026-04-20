import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock invokeLLM to avoid calling the real API in tests
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    id: "test-id",
    created: Date.now(),
    model: "gemini-2.5-flash",
    choices: [
      {
        index: 0,
        message: {
          role: "assistant",
          content: "## Análise da Carteira\n\nSua carteira está bem diversificada.",
        },
        finish_reason: "stop",
      },
    ],
    usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
  }),
}));

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("ai.analyze", () => {
  it("returns a response from the AI when given valid input", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.ai.analyze({
      prompt: "Analise a rentabilidade da carteira",
      context: "Total AUM: R$ 7.000.000,00\nClientes: 94",
    });

    expect(result).toHaveProperty("response");
    expect(typeof result.response).toBe("string");
    expect(result.response.length).toBeGreaterThan(0);
    expect(result.response).toContain("Análise da Carteira");
  });

  it("rejects empty prompt", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.ai.analyze({
        prompt: "",
        context: "Some context",
      })
    ).rejects.toThrow();
  });
});
