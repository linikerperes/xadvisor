/*
 * Design: "Black Vault" — Dark Luxury / Fintech Premium
 * Dashboard principal com KPIs, gráficos de distribuição, preços em tempo real
 * Patrimônio inclui cripto convertido em BRL a preço de mercado
 * Inclui % de cada ativo em relação ao AUM total
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { clients, formatBRL, getTotalAUM, getActiveClients, getClientsWithBalance, getProductDistribution, getClientTotalBRL, getTotalAUMWithCrypto, getTopClientsWithCrypto } from "@/lib/clientData";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Users, Wallet, TrendingUp, Activity, Bitcoin, RefreshCw, ArrowUpRight, Coins, PieChart as PieChartIcon } from "lucide-react";
import { Link } from "wouter";

const HERO_BG = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663361146918/PHrHmmwEufaiBUex.png";

const GOLD = "#d4a017";
const CHART_COLORS = ["#d4a017", "#22c55e", "#a07d14", "#3b82f6", "#ef4444", "#8b5cf6", "#f59e0b", "#06b6d4"];

export default function Dashboard() {
  const prices = useCryptoPrices();
  const totalAUM = getTotalAUM();
  const activeClients = getActiveClients();
  const clientsWithBalance = getClientsWithBalance();
  const dist = getProductDistribution();

  // Totais de cripto na carteira
  const totalBTC = clients.reduce((s, c) => s + c.walletBTC + c.securityBTC + c.secBTC, 0);
  const totalETH = clients.reduce((s, c) => s + c.walletETH + c.securityETH + c.secETH, 0);
  const totalUSDT = clients.reduce((s, c) => s + c.walletUSDT + c.securityUSDT + c.expertUSDT + c.secUSDT + c.expUSDT, 0);

  const cryptoValueBRL = (totalBTC * prices.BTC) + (totalETH * prices.ETH) + (totalUSDT * prices.USDT);

  // Patrimônio total real = AUM Onil + cripto convertido
  const totalAUMReal = !prices.loading ? getTotalAUMWithCrypto(prices) : totalAUM;

  // Top clientes com valor cripto incluído
  const topClientsData = !prices.loading
    ? getTopClientsWithCrypto(8, prices).map(c => ({
        name: c.client.name.split(" ").slice(0, 2).join(" "),
        brlDireto: c.brlDireto,
        criptoBRL: c.totalCriptoBRL,
        total: c.patrimonioTotal,
      }))
    : clients
        .sort((a, b) => b.totalBRL - a.totalBRL)
        .slice(0, 8)
        .map(c => ({
          name: c.name.split(" ").slice(0, 2).join(" "),
          brlDireto: c.totalBRL,
          criptoBRL: 0,
          total: c.totalBRL,
        }));

  // BRL direto total (sem cripto)
  const totalBRLDireto = clients.reduce(
    (s, c) => s + c.walletBRL + c.securityBRL + c.expertBRL + c.secBRL + c.expBRL,
    0
  );

  // Wallet BRL total
  const totalWalletBRL = clients.reduce((s, c) => s + c.walletBRL, 0);

  // =====================================================
  // ALOCAÇÃO POR ATIVO — % de cada ativo em relação ao AUM
  // =====================================================
  const assetAllocation = [
    { name: "Onil SEC BRL", value: dist.secBRL, color: "#d4a017" },
    { name: "Onil EXP BRL", value: dist.expBRL, color: "#22c55e" },
    { name: "Onil Security BRL", value: dist.securityBRL, color: "#a07d14" },
    { name: "Onil Expert BRL", value: dist.expertBRL, color: "#3b82f6" },
    { name: "Carteira BRL", value: totalWalletBRL, color: "#8b5cf6" },
    { name: "Security USDT", value: dist.securityUSDT * prices.USDT, color: "#06b6d4" },
    { name: "Expert USDT", value: dist.expertUSDT * prices.USDT, color: "#f59e0b" },
    { name: "SEC USDT", value: dist.secUSDT * prices.USDT, color: "#ec4899" },
    { name: "EXP USDT", value: dist.expUSDT * prices.USDT, color: "#14b8a6" },
    { name: "Bitcoin (BTC)", value: (dist.securityBTC + dist.secBTC) * prices.BTC + clients.reduce((s, c) => s + c.walletBTC, 0) * prices.BTC, color: "#f97316" },
    { name: "Ethereum (ETH)", value: (dist.securityETH + dist.secETH) * prices.ETH + clients.reduce((s, c) => s + c.walletETH, 0) * prices.ETH, color: "#6366f1" },
  ].filter(a => a.value > 0);

  const totalAssetValue = assetAllocation.reduce((s, a) => s + a.value, 0);

  // Dados simplificados para o gráfico de pizza do produto
  const productData = [
    { name: "Onil SEC BRL", value: dist.secBRL },
    { name: "Onil EXP BRL", value: dist.expBRL },
    { name: "Onil Expert BRL", value: dist.expertBRL },
    { name: "Security USDT", value: dist.securityUSDT * prices.USDT },
    { name: "Expert USDT", value: (dist.expertUSDT + dist.expUSDT) * prices.USDT },
    { name: "Crypto (BTC+ETH)", value: (dist.securityBTC + dist.secBTC) * prices.BTC + (dist.securityETH + dist.secETH) * prices.ETH },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div
        className="relative rounded-xl overflow-hidden p-6 lg:p-8"
        style={{
          backgroundImage: `url(${HERO_BG})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10">
          <h1 className="text-2xl lg:text-3xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
            Painel de Gestão
          </h1>
          <p className="text-white/70 mt-1 text-sm">
            Visão consolidada da carteira de investidores — {new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* KPI Cards - Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-elevated gold-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Patrimônio Total (AUM)</p>
                <p className="text-xl lg:text-2xl font-bold text-gold mono-nums mt-1">{formatBRL(totalAUM)}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Conforme painel Onil</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-gold" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated gold-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Clientes Ativos</p>
                <p className="text-xl lg:text-2xl font-bold text-foreground mono-nums mt-1">{activeClients.length}</p>
                <p className="text-[10px] text-muted-foreground">{clientsWithBalance.length} com saldo</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-gold" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated gold-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Ticket Médio</p>
                <p className="text-xl lg:text-2xl font-bold text-foreground mono-nums mt-1">
                  {formatBRL(clientsWithBalance.length > 0 ? totalAUM / clientsWithBalance.length : 0)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-gold" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated gold-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Valor Cripto (BRL)</p>
                <p className="text-xl lg:text-2xl font-bold text-foreground mono-nums mt-1">
                  {prices.loading ? "..." : formatBRL(cryptoValueBRL)}
                </p>
                {!prices.loading && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {((cryptoValueBRL / totalAUM) * 100).toFixed(1)}% do AUM
                  </p>
                )}
              </div>
              <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                <Bitcoin className="w-5 h-5 text-gold" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KPI Cards - Row 2: BRL Direto vs Cripto */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="card-elevated">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Saldo em BRL (Direto)</p>
                <p className="text-lg font-bold text-foreground mono-nums mt-1">{formatBRL(totalBRLDireto)}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Contratos + carteira em reais
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Coins className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Patrimônio Real (BRL + Cripto)</p>
                <p className="text-lg font-bold text-gold mono-nums mt-1">
                  {prices.loading ? "..." : formatBRL(totalAUMReal)}
                </p>
                {!prices.loading && totalAUMReal > totalAUM && (
                  <p className="text-[10px] text-profit mt-0.5 flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" />
                    {formatBRL(totalAUMReal - totalAUM)} acima do AUM Onil
                  </p>
                )}
              </div>
              <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-gold" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Crypto Prices */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { name: "Bitcoin", symbol: "BTC", price: prices.BTC, total: totalBTC, icon: "₿" },
          { name: "Ethereum", symbol: "ETH", price: prices.ETH, total: totalETH, icon: "Ξ" },
          { name: "Tether", symbol: "USDT", price: prices.USDT, total: totalUSDT, icon: "$" },
        ].map(crypto => (
          <Card key={crypto.symbol} className="card-elevated">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gold mono-nums">{crypto.icon}</span>
                  <span className="text-sm font-medium">{crypto.name}</span>
                </div>
                {prices.loading ? (
                  <RefreshCw className="w-3 h-3 animate-spin text-muted-foreground" />
                ) : (
                  <Activity className="w-3 h-3 text-profit" />
                )}
              </div>
              <p className="text-lg font-bold mono-nums">
                {prices.loading ? "Carregando..." : formatBRL(crypto.price)}
              </p>
              <div className="flex justify-between mt-2 text-[11px] text-muted-foreground">
                <span>Total: {crypto.total.toFixed(crypto.symbol === "USDT" ? 2 : 8)} {crypto.symbol}</span>
                <span className="text-gold">{prices.loading ? "" : formatBRL(crypto.total * crypto.price)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ============================================= */}
      {/* ALOCAÇÃO POR ATIVO — % de cada ativo no AUM   */}
      {/* ============================================= */}
      {!prices.loading && assetAllocation.length > 0 && (
        <Card className="card-elevated gold-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gold flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
              <PieChartIcon className="w-4 h-4" />
              Alocação por Ativo — % do Patrimônio Total
            </CardTitle>
            <p className="text-[10px] text-muted-foreground mt-1">
              Distribuição percentual de cada ativo em relação ao patrimônio total de {formatBRL(totalAssetValue)}
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pie Chart */}
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={assetAllocation}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={95}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, value }) => {
                        const pct = ((value / totalAssetValue) * 100);
                        return pct >= 3 ? `${pct.toFixed(1)}%` : "";
                      }}
                      labelLine={false}
                    >
                      {assetAllocation.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: "8px", fontSize: "12px" }}
                      formatter={(value: number) => [
                        `${formatBRL(value)} (${((value / totalAssetValue) * 100).toFixed(2)}%)`,
                        "Valor"
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Asset List with % bars */}
              <div className="space-y-2.5">
                {assetAllocation
                  .sort((a, b) => b.value - a.value)
                  .map((asset) => {
                    const pct = (asset.value / totalAssetValue) * 100;
                    return (
                      <div key={asset.name} className="group">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: asset.color }} />
                            <span className="text-xs text-foreground font-medium">{asset.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground mono-nums">{formatBRL(asset.value)}</span>
                            <span className="text-xs font-bold text-gold mono-nums w-14 text-right">{pct.toFixed(1)}%</span>
                          </div>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-muted/30 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: asset.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Distribution */}
        <Card className="card-elevated">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gold" style={{ fontFamily: "var(--font-display)" }}>
              Distribuição por Produto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={productData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {productData.map((_, i) => (
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
            <div className="grid grid-cols-2 gap-2 mt-2">
              {productData.map((item, i) => (
                <div key={item.name} className="flex items-center gap-2 text-[11px]">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                  <span className="text-muted-foreground truncate">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Clients Bar Chart - com BRL + Cripto */}
        <Card className="card-elevated">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gold" style={{ fontFamily: "var(--font-display)" }}>
              Top 8 Clientes — Patrimônio Total (BRL + Cripto)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topClientsData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis type="number" tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} tick={{ fill: "#888", fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fill: "#ccc", fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: "8px", fontSize: "12px" }}
                    formatter={(value: number, name: string) => [
                      formatBRL(value),
                      name === "brlDireto" ? "BRL Direto" : name === "criptoBRL" ? "Cripto (BRL)" : "Total",
                    ]}
                  />
                  <Bar dataKey="brlDireto" stackId="a" fill={GOLD} radius={[0, 0, 0, 0]} name="BRL Direto" />
                  <Bar dataKey="criptoBRL" stackId="a" fill="#22c55e" radius={[0, 4, 4, 0]} name="Cripto (BRL)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-4 mt-2 justify-center">
              <div className="flex items-center gap-2 text-[11px]">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: GOLD }} />
                <span className="text-muted-foreground">BRL Direto</span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#22c55e" }} />
                <span className="text-muted-foreground">Cripto (convertido BRL)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Clients Table */}
      <Card className="card-elevated">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm text-gold" style={{ fontFamily: "var(--font-display)" }}>
            Clientes Recentes
          </CardTitle>
          <Link href="/clientes">
            <span className="text-xs text-gold hover:text-gold-bright transition-colors cursor-pointer">Ver todos →</span>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Nome</th>
                  <th className="text-left py-2 px-3 text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Registrado</th>
                  <th className="text-right py-2 px-3 text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Saldo BRL</th>
                  <th className="text-right py-2 px-3 text-[11px] text-muted-foreground uppercase tracking-wider font-medium hidden md:table-cell">Cripto (BRL)</th>
                  <th className="text-right py-2 px-3 text-[11px] text-muted-foreground uppercase tracking-wider font-medium hidden lg:table-cell">Total Real</th>
                  <th className="text-center py-2 px-3 text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {[...clients]
                  .sort((a, b) => {
                    const da = a.registered.split("/").reverse().join("");
                    const db = b.registered.split("/").reverse().join("");
                    return db.localeCompare(da);
                  })
                  .slice(0, 10)
                  .map(client => {
                    const cv = !prices.loading ? getClientTotalBRL(client, prices) : null;
                    return (
                      <tr key={client.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="py-2.5 px-3">
                          <Link href={`/cliente/${client.id}`}>
                            <span className="text-foreground hover:text-gold transition-colors cursor-pointer font-medium">
                              {client.name}
                            </span>
                          </Link>
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground mono-nums text-xs">{client.registered}</td>
                        <td className="py-2.5 px-3 text-right mono-nums font-medium">
                          {cv && cv.brlDireto > 0 ? (
                            <span className="text-gold">{formatBRL(cv.brlDireto)}</span>
                          ) : client.totalBRL > 0 ? (
                            <span className="text-gold">{formatBRL(client.totalBRL)}</span>
                          ) : (
                            <span className="text-muted-foreground">R$ 0,00</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right mono-nums font-medium hidden md:table-cell">
                          {cv && cv.totalCriptoBRL > 0 ? (
                            <span className="text-green-400">{formatBRL(cv.totalCriptoBRL)}</span>
                          ) : (
                            <span className="text-muted-foreground/30">—</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right mono-nums font-bold hidden lg:table-cell">
                          {cv && cv.patrimonioTotal > 0 ? (
                            <span className="text-gold">{formatBRL(cv.patrimonioTotal)}</span>
                          ) : (
                            <span className="text-muted-foreground/30">R$ 0,00</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            client.status === "Ativado"
                              ? "bg-profit/15 text-profit"
                              : "bg-destructive/15 text-destructive"
                          }`}>
                            {client.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center py-4">
        <p className="text-[10px] text-muted-foreground/50">
          LP Advisor Dashboard — Líniker Peres | Peres Advisor Investimentos Ltda | ANCORD AI | CCA
        </p>
        {prices.lastUpdate && (
          <p className="text-[10px] text-muted-foreground/30 mt-1">
            Preços atualizados em: {prices.lastUpdate.toLocaleTimeString("pt-BR")}
          </p>
        )}
      </div>
    </div>
  );
}
