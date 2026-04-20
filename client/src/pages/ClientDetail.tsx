/*
 * Design: "Black Vault" — Dark Luxury / Fintech Premium
 * Detalhe do cliente com breakdown completo, depósitos, rendimento e análise IA
 * Mostra saldo BRL depositado vs valor cripto atual convertido
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { clients, formatBRL, formatCrypto, getClientSummary, getTotalAUM, getClientTotalBRL } from "@/lib/clientData";
import { getClientDeposits, getClientCapitalAportado, getClientTotalDepositos, getClientTotalSaques, getClientRendimento, type DepositRecord } from "@/hooks/useDepositData";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { useAIAnalysis } from "@/hooks/useAIAnalysis";
import { useParams } from "wouter";
import { Link } from "wouter";
import { ArrowLeft, Mail, Phone, Calendar, TrendingUp, TrendingDown, Wallet, Bitcoin, Brain, Loader2, DollarSign, Percent, BarChart3, ArrowUpCircle, ArrowDownCircle, Coins, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Streamdown } from "streamdown";

const CHART_COLORS = ["#d4a017", "#22c55e", "#a07d14", "#3b82f6", "#ef4444", "#8b5cf6", "#f59e0b", "#06b6d4"];

export default function ClientDetail() {
  const params = useParams<{ id: string }>();
  const client = clients.find(c => c.id === Number(params.id));
  const prices = useCryptoPrices();
  const { response: aiResponse, loading: aiLoading, analyze } = useAIAnalysis();

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-muted-foreground">Cliente não encontrado.</p>
        <Link href="/clientes">
          <span className="text-gold mt-2 text-sm cursor-pointer">← Voltar para clientes</span>
        </Link>
      </div>
    );
  }

  // Cálculos usando a função centralizada
  const cv = getClientTotalBRL(client, prices);
  const summary = getClientSummary(client);
  const aumPercent = getTotalAUM() > 0 ? (cv.patrimonioTotal / getTotalAUM()) * 100 : 0;

  // Deposit data
  const clientDeposits = getClientDeposits(client.id);
  const totalDeposited = getClientTotalDepositos(client.id);
  const totalWithdrawn = getClientTotalSaques(client.id);
  const capitalAportado = getClientCapitalAportado(client.id);
  const rendimento = getClientRendimento(client.id, client.totalBRL);
  const numDeposits = clientDeposits.filter(d => d.type === "deposito").length;
  const numWithdrawals = clientDeposits.filter(d => d.type === "saque").length;

  // Calcular tempo desde registro
  const regParts = client.registered ? client.registered.split("/") : [];
  const regDate = regParts.length === 3 ? new Date(parseInt(regParts[2]), parseInt(regParts[1]) - 1, parseInt(regParts[0])) : new Date();
  const now = new Date();
  const monthsActive = Math.max(1, Math.round((now.getTime() - regDate.getTime()) / (1000 * 60 * 60 * 24 * 30)));

  // Rendimento mensal estimado
  const rendMensal = monthsActive > 0 && capitalAportado > 0 ? rendimento.percentual / monthsActive : 0;

  const portfolioItems = [
    { name: "Onil SEC BRL", value: client.secBRL },
    { name: "Onil EXP BRL", value: client.expBRL },
    { name: "Onil Security BRL", value: client.securityBRL },
    { name: "Onil Expert BRL", value: client.expertBRL },
    { name: "Carteira BRL", value: client.walletBRL },
    { name: "BTC (em BRL)", value: cv.btcBRL },
    { name: "ETH (em BRL)", value: cv.ethBRL },
    { name: "USDT (em BRL)", value: cv.usdtBRL },
  ].filter(item => item.value > 0);

  const contracts = [
    { product: "Onil Security BRL", value: client.securityBRL, currency: "BRL" },
    { product: "Onil Expert BRL", value: client.expertBRL, currency: "BRL" },
    { product: "Onil SEC BRL", value: client.secBRL, currency: "BRL" },
    { product: "Onil EXP BRL", value: client.expBRL, currency: "BRL" },
    { product: "Onil Security USDT", value: client.securityUSDT, currency: "USDT" },
    { product: "Onil Expert USDT", value: client.expertUSDT, currency: "USDT" },
    { product: "Onil SEC USDT", value: client.secUSDT, currency: "USDT" },
    { product: "Onil EXP USDT", value: client.expUSDT, currency: "USDT" },
    { product: "Onil Security BTC", value: client.securityBTC, currency: "BTC" },
    { product: "Onil SEC BTC", value: client.secBTC, currency: "BTC" },
    { product: "Onil Security ETH", value: client.securityETH, currency: "ETH" },
    { product: "Onil SEC ETH", value: client.secETH, currency: "ETH" },
  ].filter(c => c.value > 0);

  const handleAIAnalysis = () => {
    const clientContext = `
CLIENTE ESPECÍFICO PARA ANÁLISE:
Nome: ${client.name}
ID: ${client.id}
Status: ${client.status}
Registrado em: ${client.registered} (${monthsActive} meses ativo)

PATRIMÔNIO DETALHADO:
- BRL Direto (contratos + carteira): ${formatBRL(cv.brlDireto)}
- BTC: ${cv.btcTotal.toFixed(8)} BTC = ${formatBRL(cv.btcBRL)} (preço: ${formatBRL(prices.BTC)})
- ETH: ${cv.ethTotal.toFixed(8)} ETH = ${formatBRL(cv.ethBRL)} (preço: ${formatBRL(prices.ETH)})
- USDT: ${cv.usdtTotal.toFixed(2)} USDT = ${formatBRL(cv.usdtBRL)} (preço: ${formatBRL(prices.USDT)})
- Total Cripto em BRL: ${formatBRL(cv.totalCriptoBRL)}
- PATRIMÔNIO TOTAL REAL: ${formatBRL(cv.patrimonioTotal)}
- Participação no AUM: ${aumPercent.toFixed(2)}%

DADOS DE DEPÓSITOS E RENDIMENTO:
- Capital aportado (depósitos - saques): ${formatBRL(capitalAportado)}
- Total depositado: ${formatBRL(totalDeposited)} (${numDeposits} depósitos)
- Total sacado: ${formatBRL(totalWithdrawn)} (${numWithdrawals} saques)
- Rendimento total: ${formatBRL(rendimento.valor)} (${rendimento.percentual.toFixed(2)}%)
- Rendimento mensal estimado: ${rendMensal.toFixed(2)}%

NOTA: O cliente aportou em BRL e converteu para cripto via OTC na plataforma. O valor em cripto representa o resultado da conversão.

PRODUTOS ATIVOS: ${summary.activeProducts.join(", ") || "Nenhum"}

CONTRATOS DETALHADOS:
${contracts.map(c => `- ${c.product}: ${c.currency === "BRL" ? formatBRL(c.value) : c.value.toFixed(c.currency === "USDT" ? 2 : 8) + " " + c.currency}`).join("\n")}
`;
    analyze(
      `Faça uma análise completa deste cliente. Avalie: 1) Perfil de risco baseado na alocação atual (BRL vs Cripto). 2) Diversificação da carteira. 3) Rendimento vs benchmark (CDI ~13.25% a.a.). 4) Análise da exposição a criptoativos - o cliente aportou em BRL e converteu para cripto, compare o valor atual com o que teria se mantivesse em BRL. 5) Sugestões de rebalanceamento. 6) Oportunidades de novos aportes. Use insights de neurociência financeira quando relevante.`,
      clientContext
    );
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link href="/clientes">
        <span className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Voltar para clientes
        </span>
      </Link>

      {/* Client Header */}
      <Card className="card-elevated gold-border">
        <CardContent className="p-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
                {client.name}
              </h1>
              <p className="text-xs text-muted-foreground mt-1">ID: {client.id} | Membro há {monthsActive} meses</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleAIAnalysis}
                disabled={aiLoading}
                variant="outline"
                className="border-gold/30 text-gold hover:bg-gold/10 text-xs"
              >
                {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Brain className="w-3.5 h-3.5 mr-1" />}
                Analisar com IA
              </Button>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                client.status === "Ativado" ? "bg-profit/15 text-profit" : "bg-destructive/15 text-destructive"
              }`}>
                {client.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gold shrink-0" />
              <span className="text-xs text-muted-foreground truncate">{client.email || "—"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gold shrink-0" />
              <span className="text-xs text-muted-foreground mono-nums">{client.phone || "—"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gold shrink-0" />
              <span className="text-xs text-muted-foreground">Registrado: {client.registered || "—"}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Row - Patrimônio */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="card-elevated gold-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-gold" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Patrimônio Total</span>
            </div>
            <p className="text-lg font-bold text-gold mono-nums">
              {prices.loading ? formatBRL(client.totalBRL) : formatBRL(cv.patrimonioTotal)}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{aumPercent.toFixed(1)}% do AUM</p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="w-4 h-4 text-green-400" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Saldo BRL Direto</span>
            </div>
            <p className="text-lg font-bold mono-nums">{formatBRL(cv.brlDireto)}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Contratos + carteira em reais</p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Bitcoin className="w-4 h-4 text-green-400" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Cripto em BRL</span>
            </div>
            <p className="text-lg font-bold mono-nums text-green-400">
              {prices.loading ? "..." : formatBRL(cv.totalCriptoBRL)}
            </p>
            {cv.totalCriptoBRL > 0 && !prices.loading && (
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {((cv.totalCriptoBRL / cv.patrimonioTotal) * 100).toFixed(1)}% do patrimônio
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-gold" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Capital Aportado</span>
            </div>
            <p className="text-lg font-bold mono-nums">
              {capitalAportado > 0 ? formatBRL(capitalAportado) : <span className="text-muted-foreground/50">—</span>}
            </p>
            {numDeposits > 0 && <p className="text-[10px] text-muted-foreground mt-0.5">{numDeposits} depósito(s)</p>}
          </CardContent>
        </Card>
      </div>

      {/* KPI Row 2 - Rendimento */}
      <div className="grid grid-cols-2 lg:grid-cols-2 gap-3">
        <Card className="card-elevated">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              {rendimento.valor >= 0 ? (
                <TrendingUp className="w-4 h-4 text-profit" />
              ) : (
                <TrendingDown className="w-4 h-4 text-destructive" />
              )}
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Rendimento Total</span>
            </div>
            {capitalAportado > 0 ? (
              <>
                <p className={`text-lg font-bold mono-nums ${rendimento.valor >= 0 ? "text-profit" : "text-destructive"}`}>
                  {rendimento.percentual >= 0 ? "+" : ""}{rendimento.percentual.toFixed(2)}%
                </p>
                <p className={`text-[10px] mt-0.5 ${rendimento.valor >= 0 ? "text-profit/70" : "text-destructive/70"}`}>
                  {formatBRL(rendimento.valor)}
                </p>
              </>
            ) : (
              <p className="text-lg font-bold mono-nums text-muted-foreground/50">—</p>
            )}
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Percent className="w-4 h-4 text-gold" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Rend. Mensal Est.</span>
            </div>
            {rendMensal !== 0 ? (
              <>
                <p className={`text-lg font-bold mono-nums ${rendMensal >= 0 ? "text-profit" : "text-destructive"}`}>
                  {rendMensal >= 0 ? "+" : ""}{rendMensal.toFixed(2)}%
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">em {monthsActive} meses</p>
              </>
            ) : (
              <p className="text-lg font-bold mono-nums text-muted-foreground/50">—</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Crypto Holdings - Detalhado com valor em BRL */}
      {(cv.btcTotal > 0 || cv.ethTotal > 0 || cv.usdtTotal > 0) && (
        <Card className="card-elevated gold-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gold flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
              <Bitcoin className="w-4 h-4" />
              Posições em Criptoativos — Valor Atual em BRL
            </CardTitle>
            <p className="text-[10px] text-muted-foreground mt-1">
              Cliente aportou em BRL e converteu via OTC. Valores abaixo refletem o preço de mercado atual.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {cv.btcTotal > 0 && (
                <div className="p-4 rounded-lg bg-muted/20 border border-gold/20">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-bold text-gold">₿</span>
                    <span className="text-sm font-medium">Bitcoin</span>
                  </div>
                  <p className="text-lg font-bold mono-nums">{formatCrypto(cv.btcTotal)}</p>
                  <div className="mt-2 pt-2 border-t border-border/30">
                    <p className="text-[10px] text-muted-foreground">Preço atual: {formatBRL(prices.BTC)}</p>
                    <p className="text-sm font-bold text-gold mono-nums mt-1">
                      {prices.loading ? "..." : formatBRL(cv.btcBRL)}
                    </p>
                  </div>
                </div>
              )}
              {cv.ethTotal > 0 && (
                <div className="p-4 rounded-lg bg-muted/20 border border-gold/20">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-bold text-gold">Ξ</span>
                    <span className="text-sm font-medium">Ethereum</span>
                  </div>
                  <p className="text-lg font-bold mono-nums">{formatCrypto(cv.ethTotal)}</p>
                  <div className="mt-2 pt-2 border-t border-border/30">
                    <p className="text-[10px] text-muted-foreground">Preço atual: {formatBRL(prices.ETH)}</p>
                    <p className="text-sm font-bold text-gold mono-nums mt-1">
                      {prices.loading ? "..." : formatBRL(cv.ethBRL)}
                    </p>
                  </div>
                </div>
              )}
              {cv.usdtTotal > 0 && (
                <div className="p-4 rounded-lg bg-muted/20 border border-gold/20">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-bold text-gold">$</span>
                    <span className="text-sm font-medium">Tether (USDT)</span>
                  </div>
                  <p className="text-lg font-bold mono-nums">{cv.usdtTotal.toFixed(2)}</p>
                  <div className="mt-2 pt-2 border-t border-border/30">
                    <p className="text-[10px] text-muted-foreground">Preço atual: {formatBRL(prices.USDT)}</p>
                    <p className="text-sm font-bold text-gold mono-nums mt-1">
                      {prices.loading ? "..." : formatBRL(cv.usdtBRL)}
                    </p>
                  </div>
                </div>
              )}
            </div>
            {/* Total cripto em BRL */}
            <div className="mt-4 p-3 rounded-lg bg-gold/5 border border-gold/20 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Total Cripto convertido em BRL:</span>
              <span className="text-lg font-bold text-gold mono-nums">
                {prices.loading ? "..." : formatBRL(cv.totalCriptoBRL)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deposits & Withdrawals Section */}
      {clientDeposits.length > 0 && (
        <Card className="card-elevated">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gold" style={{ fontFamily: "var(--font-display)" }}>
              Histórico de Depósitos e Saques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
                <div className="flex items-center gap-2 mb-1">
                  <ArrowUpCircle className="w-4 h-4 text-profit" />
                  <span className="text-[10px] text-muted-foreground uppercase">Total Depositado</span>
                </div>
                <p className="text-sm font-bold mono-nums text-profit">{formatBRL(totalDeposited)}</p>
                <p className="text-[9px] text-muted-foreground">{numDeposits} operação(ões)</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
                <div className="flex items-center gap-2 mb-1">
                  <ArrowDownCircle className="w-4 h-4 text-destructive" />
                  <span className="text-[10px] text-muted-foreground uppercase">Total Sacado</span>
                </div>
                <p className="text-sm font-bold mono-nums text-destructive">{formatBRL(totalWithdrawn)}</p>
                <p className="text-[9px] text-muted-foreground">{numWithdrawals} operação(ões)</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/20 border border-gold/20">
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 className="w-4 h-4 text-gold" />
                  <span className="text-[10px] text-muted-foreground uppercase">Capital Líquido</span>
                </div>
                <p className="text-sm font-bold mono-nums text-gold">{formatBRL(capitalAportado)}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              {clientDeposits.map((dep: DepositRecord, i: number) => (
                <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/10 border border-border/20">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                      dep.type === "deposito" ? "bg-profit/15 text-profit" : "bg-destructive/15 text-destructive"
                    }`}>
                      {dep.type === "deposito" ? "DEPÓSITO" : "SAQUE"}
                    </span>
                    <span className="text-xs text-muted-foreground mono-nums">{dep.date}</span>
                  </div>
                  <span className={`text-sm font-bold mono-nums ${dep.type === "deposito" ? "text-profit" : "text-destructive"}`}>
                    {dep.type === "deposito" ? "+" : "-"}{formatBRL(dep.amount)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No deposit data notice */}
      {clientDeposits.length === 0 && client.totalBRL > 0 && (
        <Card className="card-elevated border-dashed border-gold/20">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">
              Sem dados de depósitos registrados para este cliente. 
              <Link href="/importar">
                <span className="text-gold hover:text-gold-bright ml-1 cursor-pointer">Importar dados →</span>
              </Link>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Active Products Tags */}
      {summary.activeProducts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {summary.activeProducts.map(p => (
            <span key={p} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gold/10 text-gold border border-gold/20">
              {p}
            </span>
          ))}
        </div>
      )}

      {/* AI Analysis Result */}
      {(aiLoading || aiResponse) && (
        <Card className="card-elevated gold-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gold flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
              <Brain className="w-4 h-4" />
              Análise IA — {client.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {aiLoading ? (
              <div className="flex items-center gap-3 py-8 justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-gold" />
                <span className="text-muted-foreground text-sm">Analisando perfil do investidor...</span>
              </div>
            ) : (
              <div className="prose prose-invert prose-sm max-w-none [&_h1]:text-gold [&_h2]:text-gold [&_h3]:text-gold [&_strong]:text-gold [&_a]:text-gold [&_li]:text-foreground [&_p]:text-foreground/90">
                <Streamdown>{aiResponse}</Streamdown>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Pie Chart */}
        {portfolioItems.length > 0 && (
          <Card className="card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gold" style={{ fontFamily: "var(--font-display)" }}>
                Composição da Carteira (em BRL)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={portfolioItems} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                      {portfolioItems.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: "8px", fontSize: "12px" }}
                      formatter={(value: number) => formatBRL(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Asset allocation with % bars */}
              <div className="space-y-2 mt-3">
                {portfolioItems
                  .sort((a, b) => b.value - a.value)
                  .map((item, i) => {
                    const pct = cv.patrimonioTotal > 0 ? (item.value / cv.patrimonioTotal) * 100 : 0;
                    return (
                      <div key={item.name}>
                        <div className="flex items-center justify-between mb-0.5">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                            <span className="text-[11px] text-foreground">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground mono-nums">{formatBRL(item.value)}</span>
                            <span className="text-[11px] font-bold text-gold mono-nums w-12 text-right">{pct.toFixed(1)}%</span>
                          </div>
                        </div>
                        <div className="w-full h-1 rounded-full bg-muted/30 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contracts Table */}
        <Card className="card-elevated">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gold" style={{ fontFamily: "var(--font-display)" }}>
              Contratos Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {contracts.length > 0 ? (
              <div className="space-y-2">
                {contracts.map((c, i) => {
                  // Calcular valor em BRL para contratos cripto
                  let valorBRL = 0;
                  if (c.currency === "BTC") valorBRL = c.value * prices.BTC;
                  else if (c.currency === "ETH") valorBRL = c.value * prices.ETH;
                  else if (c.currency === "USDT") valorBRL = c.value * prices.USDT;

                  return (
                    <div key={i} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-muted/20 border border-border/30">
                      <div>
                        <p className="text-sm font-medium">{c.product}</p>
                        <p className="text-[10px] text-muted-foreground">{c.currency}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold mono-nums text-gold">
                          {c.currency === "BRL" ? formatBRL(c.value) :
                           c.currency === "USDT" ? `$ ${c.value.toLocaleString("en-US", { minimumFractionDigits: 2 })}` :
                           `${formatCrypto(c.value)} ${c.currency}`}
                        </p>
                        {c.currency !== "BRL" && valorBRL > 0 && !prices.loading && (
                          <p className="text-[10px] text-green-400 mono-nums">{formatBRL(valorBRL)}</p>
                        )}
                        <p className="text-[10px] text-muted-foreground mono-nums mt-0.5">
                          {cv.patrimonioTotal > 0
                            ? `${(((c.currency === "BRL" ? c.value : valorBRL) / cv.patrimonioTotal) * 100).toFixed(1)}% da carteira`
                            : ""}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Nenhum contrato ativo encontrado.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
