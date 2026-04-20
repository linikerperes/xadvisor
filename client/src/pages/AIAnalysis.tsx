/*
 * Design: "Black Vault" — Dark Luxury / Fintech Premium
 * Página de Análise com IA — Gemini API via Forge
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { clients, formatBRL, getTotalAUM, getActiveClients, getClientsWithBalance, getTopClients, getProductDistribution } from "@/lib/clientData";
import { loadDepositData, getClientCapitalAportado, getClientRendimento, type DepositRecord } from "@/hooks/useDepositData";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { useAIAnalysis } from "@/hooks/useAIAnalysis";
import { Brain, Loader2, Send, Sparkles, TrendingUp, Users, AlertTriangle, Target, BarChart3, AlertCircle } from "lucide-react";
import { Streamdown } from "streamdown";

const quickPrompts = [
  {
    icon: TrendingUp,
    label: "Análise de Rentabilidade",
    prompt: "Analise a rentabilidade da minha carteira de clientes. Compare o rendimento médio com o CDI (13.25% a.a.), identifique os clientes com melhor e pior performance, e sugira estratégias de otimização. Considere aspectos de neurociência financeira sobre vieses de ancoragem e aversão à perda.",
  },
  {
    icon: Users,
    label: "Perfil dos Clientes",
    prompt: "Faça uma análise do perfil dos meus clientes: distribuição por faixa de patrimônio, concentração de risco (clientes que representam mais de 5% do AUM), clientes inativos que podem ser reativados, e oportunidades de cross-selling de produtos.",
  },
  {
    icon: AlertTriangle,
    label: "Riscos e Alertas",
    prompt: "Identifique os principais riscos da minha carteira: concentração excessiva em poucos clientes, clientes sem diversificação adequada, exposição a criptoativos, e clientes que podem estar insatisfeitos (sem movimentação recente). Sugira ações preventivas.",
  },
  {
    icon: Target,
    label: "Estratégia de Crescimento",
    prompt: "Com base nos dados da carteira, sugira uma estratégia de crescimento para os próximos 6 meses. Considere: captação de novos clientes, aumento do ticket médio, diversificação de produtos, e retenção de clientes existentes. Use princípios de neurociência sobre tomada de decisão e gatilhos mentais.",
  },
  {
    icon: BarChart3,
    label: "Relatório Executivo",
    prompt: "Gere um relatório executivo completo da minha carteira de investidores. Inclua: resumo geral, KPIs principais, distribuição por produto, análise de risco, top 10 clientes, clientes que precisam de atenção, e recomendações estratégicas. Formate de forma profissional com tabelas markdown.",
  },
  {
    icon: Sparkles,
    label: "Visão Fora da Caixa",
    prompt: "Pense fora da caixa e me dê insights não-óbvios sobre minha carteira. Considere: padrões comportamentais dos clientes, oportunidades em criptoativos (como Michael Saylor faria), estratégias de elisão fiscal para os clientes com maior patrimônio, e como a neurociência pode me ajudar a ser um assessor mais eficaz. Seja criativo e provocativo.",
  },
];

export default function AIAnalysis() {
  const [customPrompt, setCustomPrompt] = useState("");
  const { response, loading, error, analyze } = useAIAnalysis();
  const prices = useCryptoPrices();
  const depositData = loadDepositData();

  const buildContext = () => {
    const totalAUM = getTotalAUM();
    const activeClients = getActiveClients();
    const withBalance = getClientsWithBalance();
    const top10 = getTopClients(10);
    const dist = getProductDistribution();

    const totalBTC = clients.reduce((s, c) => s + c.walletBTC + c.securityBTC + c.secBTC, 0);
    const totalETH = clients.reduce((s, c) => s + c.walletETH + c.securityETH + c.secETH, 0);
    const totalUSDT = clients.reduce((s, c) => s + c.walletUSDT + c.securityUSDT + c.expertUSDT + c.secUSDT + c.expUSDT, 0);

    const clientsWithDeposits = clients.filter(c => {
      const deps = depositData[c.id] || [];
      return deps.length > 0;
    });

    const totalDeposited = clients.reduce((s, c) => {
      const deps = depositData[c.id] || [];
      return s + deps.filter((d: DepositRecord) => d.type === "deposito").reduce((ss: number, d: DepositRecord) => ss + d.amount, 0);
    }, 0);

    const avgRendimento = clientsWithDeposits.length > 0
      ? clientsWithDeposits.reduce((s, c) => s + getClientRendimento(c.id, c.totalBRL).percentual, 0) / clientsWithDeposits.length
      : 0;

    return `
RESUMO DA CARTEIRA DO ASSESSOR LÍNIKER PERES:
- Total de clientes: ${clients.length}
- Clientes ativos: ${activeClients.length}
- Clientes com saldo: ${withBalance.length}
- Clientes sem saldo: ${clients.length - withBalance.length}
- Patrimônio total (AUM): ${formatBRL(totalAUM)}
- Ticket médio: ${formatBRL(withBalance.length > 0 ? totalAUM / withBalance.length : 0)}

DADOS DE DEPÓSITOS E RENDIMENTO:
- Clientes com dados de depósito: ${clientsWithDeposits.length}
- Total depositado: ${formatBRL(totalDeposited)}
- Rendimento médio: ${avgRendimento.toFixed(2)}%

DISTRIBUIÇÃO POR PRODUTO (BRL):
- Onil SEC BRL: ${formatBRL(dist.secBRL)}
- Onil EXP BRL: ${formatBRL(dist.expBRL)}
- Onil Expert BRL: ${formatBRL(dist.expertBRL)}
- Onil Security BRL: ${formatBRL(dist.securityBRL)}
- Security USDT: ${dist.securityUSDT.toFixed(2)} USDT
- Expert USDT: ${dist.expertUSDT.toFixed(2)} USDT

CRIPTOATIVOS:
- BTC total: ${totalBTC.toFixed(8)} BTC (${prices.loading ? "carregando..." : formatBRL(totalBTC * prices.BTC)})
- ETH total: ${totalETH.toFixed(8)} ETH (${prices.loading ? "carregando..." : formatBRL(totalETH * prices.ETH)})
- USDT total: ${totalUSDT.toFixed(2)} USDT (${prices.loading ? "carregando..." : formatBRL(totalUSDT * prices.USDT)})

TOP 10 CLIENTES POR PATRIMÔNIO:
${top10.map((c, i) => {
  const rend = getClientRendimento(c.id, c.totalBRL);
  const capital = getClientCapitalAportado(c.id);
  return `${i + 1}. ${c.name} — ${formatBRL(c.totalBRL)} (${(c.totalBRL / totalAUM * 100).toFixed(1)}% AUM)${capital > 0 ? ` | Capital: ${formatBRL(capital)} | Rend: ${rend.percentual.toFixed(1)}%` : ""}`;
}).join("\n")}

CLIENTES SEM SALDO (POTENCIAL REATIVAÇÃO):
${clients.filter(c => c.totalBRL === 0 && c.status === "Ativado").map(c => `- ${c.name} (${c.email})`).join("\n")}

LISTA COMPLETA DE CLIENTES COM SALDO:
${withBalance.map(c => `- ${c.name}: ${formatBRL(c.totalBRL)} | SEC: ${formatBRL(c.secBRL)} | EXP: ${formatBRL(c.expBRL)} | Expert: ${formatBRL(c.expertBRL)} | BTC: ${(c.walletBTC + c.securityBTC + c.secBTC).toFixed(8)} | ETH: ${(c.walletETH + c.securityETH + c.secETH).toFixed(8)}`).join("\n")}

CONTEXTO DO ASSESSOR:
- Certificações: ANCORD AI, CCA (Criptoativos)
- Empresa: Peres Advisor Investimentos Ltda
- Plataforma: Onil Group
- Interesses: Neurociência financeira, pensamento fora da caixa, elisão fiscal
`;
  };

  const handleQuickPrompt = (prompt: string) => {
    analyze(prompt, buildContext());
  };

  const handleCustomPrompt = () => {
    if (!customPrompt.trim()) return;
    analyze(customPrompt, buildContext());
    setCustomPrompt("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gold/15 flex items-center justify-center">
          <Brain className="w-5 h-5 text-gold" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
            Análise com IA
          </h1>
          <p className="text-sm text-muted-foreground">
            Use inteligência artificial para analisar sua carteira de investidores e obter insights acionáveis
          </p>
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {quickPrompts.map((qp, i) => (
          <button
            key={i}
            onClick={() => handleQuickPrompt(qp.prompt)}
            disabled={loading}
            className="text-left p-4 rounded-xl bg-card border border-border/50 hover:border-gold/30 hover:bg-muted/30 transition-all duration-300 group disabled:opacity-50"
          >
            <div className="flex items-center gap-2 mb-2">
              <qp.icon className="w-4 h-4 text-gold group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-foreground">{qp.label}</span>
            </div>
            <p className="text-[11px] text-muted-foreground line-clamp-2">{qp.prompt.slice(0, 100)}...</p>
          </button>
        ))}
      </div>

      {/* Custom Prompt */}
      <Card className="card-elevated gold-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-gold flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
            <Brain className="w-4 h-4" />
            Pergunta Personalizada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <textarea
              value={customPrompt}
              onChange={e => setCustomPrompt(e.target.value)}
              placeholder="Ex: Quais clientes têm maior potencial para aumentar o aporte? Como posso usar neurociência para melhorar minha abordagem de vendas?"
              className="flex-1 bg-card border border-border rounded-lg p-3 text-sm text-foreground placeholder:text-muted-foreground/50 resize-none h-20 focus:outline-none focus:ring-1 focus:ring-gold/50"
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleCustomPrompt();
                }
              }}
            />
            <Button
              onClick={handleCustomPrompt}
              disabled={loading || !customPrompt.trim()}
              className="bg-gold text-black hover:bg-gold-bright self-end"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Card className="card-elevated border-destructive/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Response */}
      {(loading || response) && (
        <Card className="card-elevated gold-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gold flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
              <Sparkles className="w-4 h-4" />
              Resultado da Análise
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center gap-3 py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gold" />
                <span className="text-muted-foreground text-sm">Analisando dados da carteira...</span>
                <span className="text-muted-foreground/50 text-xs">Isso pode levar alguns segundos</span>
              </div>
            ) : (
              <div className="prose prose-invert prose-sm max-w-none [&_h1]:text-gold [&_h2]:text-gold [&_h3]:text-gold [&_strong]:text-gold [&_a]:text-gold [&_li]:text-foreground [&_p]:text-foreground/90 [&_table]:border-border [&_th]:border-border [&_td]:border-border [&_th]:text-gold [&_code]:text-gold [&_code]:bg-muted/30">
                <Streamdown>{response}</Streamdown>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Context Info */}
      <div className="text-center">
        <p className="text-[10px] text-muted-foreground/50">
          Análise baseada em {clients.length} clientes | AUM: {formatBRL(getTotalAUM())} | Powered by Gemini AI
        </p>
      </div>
    </div>
  );
}
