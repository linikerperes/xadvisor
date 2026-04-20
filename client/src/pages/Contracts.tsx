import { trpc } from "@/lib/trpc";
import { AlertTriangle, Clock, CheckCircle2, TrendingUp, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";

function formatCurrency(value: string | number, currency: string): string {
  const n = parseFloat(String(value));
  if (isNaN(n)) return "—";
  if (currency === "BRL") return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  if (currency === "USDT") return `$ ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (currency === "BTC") return `₿ ${n.toFixed(8)}`;
  if (currency === "ETH") return `Ξ ${n.toFixed(6)}`;
  return `${n} ${currency}`;
}

function urgencyColor(days: number | null): string {
  if (days === null || days === undefined) return "text-muted-foreground";
  if (days <= 7) return "text-red-400";
  if (days <= 15) return "text-orange-400";
  if (days <= 30) return "text-yellow-400";
  return "text-green-400";
}

function urgencyBg(days: number | null): string {
  if (days === null || days === undefined) return "";
  if (days <= 7) return "border-red-900/40 bg-red-950/20";
  if (days <= 15) return "border-orange-900/40 bg-orange-950/20";
  if (days <= 30) return "border-yellow-900/40 bg-yellow-950/20";
  return "";
}

function ProgressBar({ elapsed, total }: { elapsed: number; total: number }) {
  const pct = total > 0 ? Math.min(100, (elapsed / total) * 100) : 0;
  const color = pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-yellow-500" : "bg-gold";
  return (
    <div className="w-full bg-white/10 rounded-full h-1.5 mt-1">
      <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function Contracts() {
  const { data: stats } = trpc.contracts.stats.useQuery();
  const { data: expiring } = trpc.contracts.expiring.useQuery({ days: 30 });
  const { data: all, refetch } = trpc.contracts.list.useQuery();
  const syncOnil = trpc.sync.onil.useMutation({
    onSuccess: (data) => {
      toast.success(`✅ Sync concluído! ${data.contracts} contratos atualizados.`);
      refetch();
    },
    onError: (err) => toast.error(`Erro: ${err.message}`),
  });

  const expiringCount = stats?.expiringSoon ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
            Contratos Onil
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Acompanhamento de contratos e alertas de vencimento
          </p>
        </div>
        <button
          onClick={() => syncOnil.mutate()}
          disabled={syncOnil.isPending}
          className="flex items-center gap-2 bg-gold hover:bg-gold/90 text-black font-bold px-5 py-2.5 rounded-xl text-sm"
        >
          {syncOnil.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          {syncOnil.isPending ? "Sincronizando..." : "Sincronizar"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card-elevated rounded-xl p-4">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Total</p>
          <p className="text-2xl font-bold text-gold mono-nums">{stats?.total ?? 0}</p>
        </div>
        <div className="card-elevated rounded-xl p-4">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Em andamento</p>
          <p className="text-2xl font-bold mono-nums">{stats?.active ?? 0}</p>
        </div>
        <div className={`card-elevated rounded-xl p-4 ${expiringCount > 0 ? "border border-yellow-700/50" : ""}`}>
          <div className="flex items-center gap-1 mb-1">
            {expiringCount > 0 && <AlertTriangle className="w-3 h-3 text-yellow-400" />}
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Vencem em 30d</p>
          </div>
          <p className={`text-2xl font-bold mono-nums ${expiringCount > 0 ? "text-yellow-400" : ""}`}>
            {expiringCount}
          </p>
        </div>
        <div className="card-elevated rounded-xl p-4">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Vencendo este mês</p>
          <p className="text-2xl font-bold mono-nums">{stats?.expiredThisMonth ?? 0}</p>
        </div>
      </div>

      {/* Alerta de contratos próximos do vencimento */}
      {expiring && expiring.length > 0 && (
        <div className="card-elevated border border-yellow-700/50 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <h2 className="text-sm font-bold text-yellow-400" style={{ fontFamily: "var(--font-display)" }}>
              {expiring.length} contrato{expiring.length > 1 ? "s" : ""} vencendo nos próximos 30 dias
            </h2>
          </div>
          <div className="space-y-2">
            {expiring.map(c => (
              <div key={c.id} className={`rounded-lg border p-3 ${urgencyBg(c.daysRemaining)}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{c.clientName}</p>
                    <p className="text-xs text-muted-foreground">{c.contractType} · #{c.onilContractId}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold mono-nums">{formatCurrency(c.value, c.currency)}</p>
                    <p className={`text-xs font-bold mono-nums ${urgencyColor(c.daysRemaining)}`}>
                      {c.daysRemaining === 0 ? "Vence hoje!" : `${c.daysRemaining} dias restantes`}
                    </p>
                  </div>
                </div>
                <ProgressBar elapsed={c.daysElapsed} total={c.totalDays} />
                <p className="text-[10px] text-muted-foreground mt-1">
                  {c.daysElapsed}/{c.totalDays} dias · Vence em {c.expiryDate}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista completa */}
      <div className="card-elevated rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <h2 className="text-sm font-bold text-gold" style={{ fontFamily: "var(--font-display)" }}>
            Todos os Contratos
          </h2>
        </div>
        {!all || all.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            Nenhum contrato. Clique em <strong>Sincronizar</strong> para importar do portal Onil.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {all.map(c => (
              <div key={c.id} className={`p-3 flex items-center gap-3 hover:bg-white/5 transition-colors ${urgencyBg(c.daysRemaining)}`}>
                <div className="shrink-0">
                  {(c.daysRemaining ?? 999) <= 30
                    ? <AlertTriangle className={`w-4 h-4 ${urgencyColor(c.daysRemaining)}`} />
                    : c.status === "Em andamento"
                      ? <Clock className="w-4 h-4 text-gold" />
                      : <CheckCircle2 className="w-4 h-4 text-green-500" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold truncate">{c.clientName}</p>
                    <span className="text-[10px] text-muted-foreground shrink-0">#{c.onilContractId}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{c.contractType}</p>
                  <ProgressBar elapsed={c.daysElapsed} total={c.totalDays} />
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {c.daysElapsed}/{c.totalDays} dias · vence {c.expiryDate}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold mono-nums">{formatCurrency(c.value, c.currency)}</p>
                  <p className={`text-xs font-semibold mono-nums ${urgencyColor(c.daysRemaining)}`}>
                    {c.daysRemaining !== null && c.daysRemaining !== undefined
                      ? c.daysRemaining <= 0 ? "Vencido" : `${c.daysRemaining}d`
                      : "—"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
