import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import {
  Users, TrendingUp, Bell, Gift, ArrowRight,
  Calendar, DollarSign, BarChart2, Sparkles
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, getDaysUntil, getRiskLabel } from "@/lib/utils-advisor";
import { useAuth } from "@/_core/hooks/useAuth";

const RISK_COLORS: Record<string, { bar: string; badge: string }> = {
  conservador: { bar: "bg-emerald-500", badge: "text-emerald-400 bg-emerald-500/15 border border-emerald-500/25" },
  moderado:    { bar: "bg-sky-500",     badge: "text-sky-400 bg-sky-500/15 border border-sky-500/25" },
  arrojado:    { bar: "bg-amber-500",   badge: "text-amber-400 bg-amber-500/15 border border-amber-500/25" },
  agressivo:   { bar: "bg-rose-500",    badge: "text-rose-400 bg-rose-500/15 border border-rose-500/25" },
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

export default function CrmDashboard() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { data: stats } = trpc.crmDashboard.stats.useQuery();
  const { data: upcoming } = trpc.crmDashboard.upcoming.useQuery({ days: 30 });

  const riskData = stats?.riskDistribution;
  const totalWithRisk = riskData ? Object.values(riskData).reduce((a, b) => a + b, 0) : 0;

  const kpis = [
    {
      label: "Clientes CRM",
      value: stats?.totalClients ?? 0,
      icon: Users,
      accent: "text-sky-400",
      bg: "bg-sky-500/10",
      border: "border-sky-500/20",
      format: "number",
    },
    {
      label: "Capital Gerenciado",
      value: stats?.totalCapital ?? 0,
      icon: DollarSign,
      accent: "text-gold",
      bg: "bg-gold/10",
      border: "border-gold/20",
      format: "currency",
    },
    {
      label: "Ticket Médio",
      value: stats?.avgCapital ?? 0,
      icon: BarChart2,
      accent: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      format: "currency",
    },
    {
      label: "Alertas / 30 dias",
      value: upcoming?.length ?? 0,
      icon: Bell,
      accent: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      format: "number",
    },
  ];

  const firstName = user?.name?.split(" ")[0] ?? "Assessor";

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] text-gold uppercase tracking-widest font-semibold mb-1">CRM Advisor</p>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
            {getGreeting()}, {firstName}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <Button
          onClick={() => setLocation("/crm/clientes/novo")}
          className="bg-gold text-black hover:bg-gold-bright font-semibold hidden sm:flex"
        >
          <Users className="h-4 w-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className={`card-elevated relative overflow-hidden p-5 border ${kpi.border} rounded-xl`}>
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold/60 to-transparent rounded-t-xl" />
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-2">{kpi.label}</p>
                <p className="text-xl lg:text-2xl font-bold mono-nums truncate text-foreground">
                  {kpi.format === "currency"
                    ? formatCurrency(kpi.value as number)
                    : kpi.value}
                </p>
              </div>
              <div className={`h-10 w-10 rounded-xl ${kpi.bg} border ${kpi.border} flex items-center justify-center shrink-0`}>
                <kpi.icon className={`h-5 w-5 ${kpi.accent}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Risk Distribution */}
        <div className="card-elevated p-5 lg:col-span-2 rounded-xl border border-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] text-gold uppercase tracking-widest font-semibold mb-0.5">Perfil de Risco</p>
              <h3 className="font-semibold text-foreground text-sm">Distribuição da Carteira</h3>
            </div>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            {riskData && Object.entries(riskData).map(([profile, count]) => {
              if (count === 0) return null;
              const pct = totalWithRisk > 0 ? Math.round((count / totalWithRisk) * 100) : 0;
              const colors = RISK_COLORS[profile] ?? { bar: "bg-zinc-500", badge: "text-zinc-400" };
              return (
                <div key={profile}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors.badge}`}>{getRiskLabel(profile)}</span>
                    <span className="text-xs text-muted-foreground mono-nums">{count} · {pct}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full ${colors.bar} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {(!riskData || totalWithRisk === 0) && (
              <div className="text-center py-6">
                <BarChart2 className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Nenhum cliente com perfil de risco</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Dates */}
        <div className="card-elevated p-5 lg:col-span-3 rounded-xl border border-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] text-gold uppercase tracking-widest font-semibold mb-0.5">Agenda</p>
              <h3 className="font-semibold text-foreground text-sm">Próximas Datas Especiais</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-gold hover:text-gold text-xs h-7 px-2"
              onClick={() => setLocation("/crm/alertas")}
            >
              Ver todas <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
          <div className="space-y-1.5">
            {upcoming && upcoming.length > 0 ? (
              upcoming.slice(0, 6).map((item) => {
                const days = getDaysUntil(item.date.date);
                const isUrgent = days <= 3;
                const isSoon = days <= 7;
                return (
                  <div
                    key={item.date.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer group"
                    onClick={() => setLocation(`/crm/clientes/${item.clientId}`)}
                  >
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isUrgent ? "bg-rose-500/15" : isSoon ? "bg-amber-500/15" : "bg-sky-500/15"
                    }`}>
                      <Calendar className={`h-4 w-4 ${
                        isUrgent ? "text-rose-400" : isSoon ? "text-amber-400" : "text-sky-400"
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate group-hover:text-gold transition-colors">
                        {item.date.personName || item.clientName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {item.date.title} · {item.clientName}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs shrink-0 font-semibold ${
                        days === 0 ? "text-rose-400 border-rose-500/30 bg-rose-500/10" :
                        days <= 7 ? "text-amber-400 border-amber-500/30 bg-amber-500/10" :
                        "text-sky-400 border-sky-500/30 bg-sky-500/10"
                      }`}
                    >
                      {days === 0 ? "Hoje!" : days === 1 ? "Amanhã" : `${days}d`}
                    </Badge>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Bell className="h-10 w-10 text-muted-foreground/20 mb-3" />
                <p className="text-sm text-muted-foreground font-medium">Nenhuma data nos próximos 30 dias</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Cadastre clientes para ver os alertas aqui</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card-elevated p-5 rounded-xl border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 text-gold" />
          <h3 className="font-semibold text-foreground text-sm">Ações Rápidas</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Novo Cliente",  icon: Users,     path: "/crm/clientes/novo", accent: "text-sky-400",     bg: "bg-sky-500/10",     border: "border-sky-500/20" },
            { label: "Ver Alertas",   icon: Bell,      path: "/crm/alertas",       accent: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/20" },
            { label: "Relatórios",    icon: TrendingUp, path: "/crm/relatorios",   accent: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
            { label: "Presentes",     icon: Gift,      path: "/crm/presentes",     accent: "text-gold",        bg: "bg-gold/10",        border: "border-gold/20" },
          ].map((action) => (
            <button
              key={action.label}
              onClick={() => setLocation(action.path)}
              className={`flex flex-col items-center gap-2.5 p-4 rounded-xl ${action.bg} border ${action.border} hover:border-gold/40 transition-all group`}
            >
              <div className={`h-9 w-9 rounded-lg bg-background/50 border ${action.border} flex items-center justify-center`}>
                <action.icon className={`h-4.5 w-4.5 ${action.accent}`} />
              </div>
              <span className="text-xs font-semibold text-foreground group-hover:text-gold transition-colors">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
