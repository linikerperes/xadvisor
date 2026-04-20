import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useLocation } from "wouter";
import { Bell, Calendar, ChevronRight, Gift, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getDaysUntil, formatDate, getDateTypeLabel } from "@/lib/utils-advisor";

export default function CrmAlerts() {
  const [, setLocation] = useLocation();
  const [days, setDays] = useState(30);
  const { data: upcoming, isLoading } = trpc.crmDashboard.upcoming.useQuery({ days });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <p className="text-[10px] text-gold uppercase tracking-widest font-semibold mb-1">CRM</p>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
            <Bell className="h-7 w-7 text-gold" />
            Alertas de Datas
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Datas especiais dos seus clientes nos próximos {days} dias
          </p>
        </div>
        <Select value={String(days)} onValueChange={v => setDays(Number(v))}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Próximos 7 dias</SelectItem>
            <SelectItem value="15">Próximos 15 dias</SelectItem>
            <SelectItem value="30">Próximos 30 dias</SelectItem>
            <SelectItem value="60">Próximos 60 dias</SelectItem>
            <SelectItem value="90">Próximos 90 dias</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Alerts List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
        </div>
      ) : upcoming && upcoming.length > 0 ? (
        <div className="space-y-2">
          {upcoming.map((item) => {
            const d = getDaysUntil(item.date.date);
            const isToday = d === 0;
            const isUrgent = d <= 3;
            const isSoon = d <= 7;
            return (
              <div
                key={item.date.id}
                className={`card-elevated p-4 rounded-xl border transition-all cursor-pointer group ${
                  isToday ? "border-rose-500/40 bg-rose-500/5" :
                  isUrgent ? "border-amber-500/30" :
                  "border-border hover:border-gold/30"
                }`}
                onClick={() => setLocation(`/crm/clientes/${item.clientId}`)}
              >
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${
                    isToday ? "bg-rose-500/15" : isUrgent ? "bg-amber-500/15" : isSoon ? "bg-sky-500/15" : "bg-muted"
                  }`}>
                    {item.date.type === "casamento" ? (
                      <Gift className={`h-5 w-5 ${isToday ? "text-rose-400" : isUrgent ? "text-amber-400" : "text-sky-400"}`} />
                    ) : (
                      <Calendar className={`h-5 w-5 ${isToday ? "text-rose-400" : isUrgent ? "text-amber-400" : "text-sky-400"}`} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground group-hover:text-gold transition-colors">
                      {item.date.personName || item.clientName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.date.title} · {getDateTypeLabel(item.date.type)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Cliente: {item.clientName} · {formatDate(item.date.date)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Badge
                      variant="outline"
                      className={`text-sm font-bold px-3 py-1 ${
                        isToday ? "text-rose-400 border-rose-500/40 bg-rose-500/10" :
                        isUrgent ? "text-amber-400 border-amber-500/30 bg-amber-500/10" :
                        isSoon ? "text-sky-400 border-sky-500/30 bg-sky-500/10" :
                        "text-muted-foreground border-border"
                      }`}
                    >
                      {isToday ? "HOJE!" : d === 1 ? "Amanhã" : `${d} dias`}
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-gold transition-colors" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card-elevated flex flex-col items-center justify-center py-20 text-center rounded-xl border border-border">
          <Bell className="h-14 w-14 text-muted-foreground/15 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma data nos próximos {days} dias</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Cadastre datas especiais nos perfis dos clientes para receber alertas aqui.
          </p>
        </div>
      )}
    </div>
  );
}
