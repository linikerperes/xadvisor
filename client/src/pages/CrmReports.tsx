import { trpc } from "@/lib/trpc";
import { BarChart2, PieChart as PieChartIcon, Loader2, Users, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { formatCurrency, getRiskLabel } from "@/lib/utils-advisor";

const RISK_COLORS: Record<string, string> = {
  conservador: "#22c55e",
  moderado: "#3b82f6",
  arrojado: "#f59e0b",
  agressivo: "#ef4444",
};

const CHART_COLORS = ["#d4a017", "#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"];

export default function CrmReports() {
  const { data: stats, isLoading: statsLoading } = trpc.crmDashboard.stats.useQuery();
  const { data: portfolioDist, isLoading: portLoading } = trpc.reports.portfolioDistribution.useQuery();
  const { data: riskDist, isLoading: riskLoading } = trpc.reports.riskDistribution.useQuery();

  const isLoading = statsLoading || portLoading || riskLoading;

  // Risk distribution chart data
  const riskChartData = riskDist
    ? Object.entries(riskDist as Record<string, number>)
        .filter(([, count]) => count > 0)
        .map(([profile, count]) => ({
          name: getRiskLabel(profile),
          value: count,
          color: RISK_COLORS[profile] ?? "#888",
        }))
    : [];

  // Portfolio distribution chart data
  const portfolioChartData = portfolioDist?.sectors
    ? portfolioDist.sectors
        .filter((s: { name: string; value: number }) => s.value > 0)
        .map((s: { name: string; value: number }, i: number) => ({
          name: s.name,
          value: s.value,
          color: CHART_COLORS[i % CHART_COLORS.length],
        }))
    : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <p className="text-[10px] text-gold uppercase tracking-widest font-semibold mb-1">CRM</p>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
          <BarChart2 className="h-7 w-7 text-gold" />
          Relatórios
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Visão analítica da carteira de clientes CRM
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="card-elevated border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Clientes</p>
                <p className="text-2xl font-bold mono-nums mt-1">{stats?.totalClients ?? 0}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-sky-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-sky-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-elevated border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Capital Total</p>
                <p className="text-xl font-bold mono-nums mt-1 text-gold">{formatCurrency(stats?.totalCapital ?? 0)}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-gold/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-gold" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-elevated border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Ticket Médio</p>
                <p className="text-xl font-bold mono-nums mt-1">{formatCurrency(stats?.avgCapital ?? 0)}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <BarChart2 className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Risk Distribution */}
        <Card className="card-elevated border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gold flex items-center gap-2">
              <PieChartIcon className="h-4 w-4" /> Distribuição por Perfil de Risco
            </CardTitle>
          </CardHeader>
          <CardContent>
            {riskChartData.length > 0 ? (
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={riskChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {riskChartData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "oklch(0.14 0.005 260)", border: "1px solid oklch(0.25 0.005 260)", borderRadius: "8px" }}
                      labelStyle={{ color: "oklch(0.90 0.005 260)" }}
                      itemStyle={{ color: "oklch(0.80 0.005 260)" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-3 mt-2 justify-center">
                  {riskChartData.map((d) => (
                    <div key={d.name} className="flex items-center gap-1.5 text-xs">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-muted-foreground">{d.name}: {d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
                Sem dados de perfil de risco
              </div>
            )}
          </CardContent>
        </Card>

        {/* Portfolio Distribution */}
        <Card className="card-elevated border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gold flex items-center gap-2">
              <BarChart2 className="h-4 w-4" /> Distribuição de Portfólio
            </CardTitle>
          </CardHeader>
          <CardContent>
            {portfolioChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={portfolioChartData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.005 260)" />
                  <XAxis type="number" tick={{ fill: "oklch(0.60 0.01 260)", fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "oklch(0.60 0.01 260)", fontSize: 11 }} width={100} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "oklch(0.14 0.005 260)", border: "1px solid oklch(0.25 0.005 260)", borderRadius: "8px" }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {portfolioChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
                Sem dados de portfólio
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
