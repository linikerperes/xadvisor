/*
 * Design: "Black Vault" — Dark Luxury / Fintech Premium
 * Listagem completa de clientes com busca, filtros, ordenação
 * Mostra saldo BRL direto, cripto convertido em BRL e patrimônio total
 */
import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { clients, formatBRL, getClientSummary, getTotalAUM, getActiveClients, getClientsWithBalance, getClientTotalBRL } from "@/lib/clientData";
import { getClientCapitalAportado, getClientTotalDepositos, getClientRendimento, loadDepositData } from "@/hooks/useDepositData";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { Link } from "wouter";
import { Search, ArrowUpDown, Users, Wallet, TrendingUp, UserX, DollarSign, Percent, Bitcoin, Coins } from "lucide-react";

type SortKey = "name" | "totalBRL" | "registered" | "products" | "depositos" | "rendimento" | "criptoBRL" | "patrimonioTotal";
type SortDir = "asc" | "desc";

export default function Clients() {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("patrimonioTotal");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [statusFilter, setStatusFilter] = useState<"all" | "Ativado" | "Inativo" | "comSaldo" | "semSaldo" | "comCripto">("all");
  const prices = useCryptoPrices();
  const depositData = loadDepositData();

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const filtered = useMemo(() => {
    let result = [...clients];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q));
    }

    if (statusFilter === "Ativado") result = result.filter(c => c.status === "Ativado");
    else if (statusFilter === "Inativo") result = result.filter(c => c.status === "Inativo");
    else if (statusFilter === "comSaldo") result = result.filter(c => c.totalBRL > 0);
    else if (statusFilter === "semSaldo") result = result.filter(c => c.totalBRL === 0);
    else if (statusFilter === "comCripto") {
      result = result.filter(c => {
        const cv = getClientTotalBRL(c, prices);
        return cv.totalCriptoBRL > 0;
      });
    }

    result.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.name.localeCompare(b.name);
      else if (sortKey === "totalBRL") cmp = a.totalBRL - b.totalBRL;
      else if (sortKey === "criptoBRL") {
        const ca = getClientTotalBRL(a, prices).totalCriptoBRL;
        const cb = getClientTotalBRL(b, prices).totalCriptoBRL;
        cmp = ca - cb;
      } else if (sortKey === "patrimonioTotal") {
        const pa = getClientTotalBRL(a, prices).patrimonioTotal;
        const pb = getClientTotalBRL(b, prices).patrimonioTotal;
        cmp = pa - pb;
      } else if (sortKey === "depositos") cmp = getClientTotalDepositos(a.id) - getClientTotalDepositos(b.id);
      else if (sortKey === "rendimento") cmp = getClientRendimento(a.id, a.totalBRL).percentual - getClientRendimento(b.id, b.totalBRL).percentual;
      else if (sortKey === "products") {
        cmp = getClientSummary(a).activeProducts.length - getClientSummary(b).activeProducts.length;
      } else {
        const da = a.registered.split("/").reverse().join("");
        const db = b.registered.split("/").reverse().join("");
        cmp = da.localeCompare(db);
      }
      return sortDir === "desc" ? -cmp : cmp;
    });

    return result;
  }, [search, sortKey, sortDir, statusFilter, prices]);

  const activeCount = getActiveClients().length;
  const withBalanceCount = getClientsWithBalance().length;
  const totalAUM = getTotalAUM();

  // Totais com cripto
  const totalCriptoBRL = clients.reduce((s, c) => s + getClientTotalBRL(c, prices).totalCriptoBRL, 0);
  const totalBRLDireto = clients.reduce((s, c) => s + getClientTotalBRL(c, prices).brlDireto, 0);
  const clientsWithCrypto = clients.filter(c => getClientTotalBRL(c, prices).totalCriptoBRL > 0).length;

  const SortButton = ({ label, field }: { label: string; field: SortKey }) => (
    <button
      onClick={() => toggleSort(field)}
      className="flex items-center gap-1 text-[11px] text-muted-foreground uppercase tracking-wider font-medium hover:text-gold transition-colors"
    >
      {label}
      <ArrowUpDown className={`w-3 h-3 ${sortKey === field ? "text-gold" : ""}`} />
    </button>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
          Clientes
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {clients.length} investidores registrados — {filtered.length} exibidos
        </p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <div className="card-elevated gold-border rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-3.5 h-3.5 text-gold" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Total</span>
          </div>
          <p className="text-lg font-bold mono-nums">{clients.length}</p>
        </div>
        <div className="card-elevated rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-profit" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Ativos</span>
          </div>
          <p className="text-lg font-bold mono-nums">{activeCount}</p>
        </div>
        <div className="card-elevated rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Coins className="w-3.5 h-3.5 text-green-400" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">BRL Direto</span>
          </div>
          <p className="text-sm font-bold mono-nums">{formatBRL(totalBRLDireto)}</p>
        </div>
        <div className="card-elevated rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Bitcoin className="w-3.5 h-3.5 text-gold" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Cripto (BRL)</span>
          </div>
          <p className="text-sm font-bold mono-nums text-green-400">{prices.loading ? "..." : formatBRL(totalCriptoBRL)}</p>
          <p className="text-[9px] text-muted-foreground">{clientsWithCrypto} clientes</p>
        </div>
        <div className="card-elevated rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="w-3.5 h-3.5 text-gold" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Com Saldo</span>
          </div>
          <p className="text-lg font-bold mono-nums">{withBalanceCount}</p>
        </div>
        <div className="card-elevated rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <UserX className="w-3.5 h-3.5 text-destructive" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Sem Saldo</span>
          </div>
          <p className="text-lg font-bold mono-nums">{clients.length - withBalanceCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email ou telefone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-card border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {([
            { key: "all" as const, label: "Todos" },
            { key: "comSaldo" as const, label: "Com Saldo" },
            { key: "comCripto" as const, label: "Com Cripto" },
            { key: "semSaldo" as const, label: "Sem Saldo" },
            { key: "Ativado" as const, label: "Ativos" },
            { key: "Inativo" as const, label: "Inativos" },
          ]).map(s => (
            <button
              key={s.key}
              onClick={() => setStatusFilter(s.key)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                statusFilter === s.key
                  ? "bg-gold/15 text-gold border border-gold/30"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card className="card-elevated">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4"><SortButton label="Nome" field="name" /></th>
                  <th className="text-left py-3 px-4 hidden md:table-cell"><SortButton label="Registrado" field="registered" /></th>
                  <th className="text-right py-3 px-4"><SortButton label="Saldo BRL" field="totalBRL" /></th>
                  <th className="text-right py-3 px-4 hidden md:table-cell"><SortButton label="Cripto (BRL)" field="criptoBRL" /></th>
                  <th className="text-right py-3 px-4"><SortButton label="Total Real" field="patrimonioTotal" /></th>
                  <th className="text-right py-3 px-4 hidden lg:table-cell"><SortButton label="Depositado" field="depositos" /></th>
                  <th className="text-right py-3 px-4 hidden lg:table-cell"><SortButton label="Rendimento" field="rendimento" /></th>
                  <th className="text-center py-3 px-4 hidden xl:table-cell"><SortButton label="Produtos" field="products" /></th>
                  <th className="text-center py-3 px-4 text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(client => {
                  const summary = getClientSummary(client);
                  const cv = getClientTotalBRL(client, prices);
                  const totalDep = getClientTotalDepositos(client.id);
                  const rend = getClientRendimento(client.id, client.totalBRL);
                  const numDeposits = (depositData[client.id] || []).filter(d => d.type === "deposito").length;
                  
                  return (
                    <tr key={client.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4">
                        <Link href={`/cliente/${client.id}`}>
                          <span className="text-foreground hover:text-gold transition-colors cursor-pointer font-medium text-sm">
                            {client.name}
                          </span>
                        </Link>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{client.email}</p>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-xs mono-nums hidden md:table-cell">{client.registered}</td>
                      <td className="py-3 px-4 text-right mono-nums font-medium">
                        {cv.brlDireto > 0 ? (
                          <span className="text-foreground">{formatBRL(cv.brlDireto)}</span>
                        ) : (
                          <span className="text-muted-foreground/50">R$ 0,00</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right hidden md:table-cell">
                        {cv.totalCriptoBRL > 0 ? (
                          <div>
                            <span className="mono-nums text-xs font-medium text-green-400">{formatBRL(cv.totalCriptoBRL)}</span>
                            <p className="text-[9px] text-muted-foreground">
                              {cv.btcTotal > 0 ? `${cv.btcTotal.toFixed(4)} BTC` : ""}
                              {cv.btcTotal > 0 && cv.ethTotal > 0 ? " · " : ""}
                              {cv.ethTotal > 0 ? `${cv.ethTotal.toFixed(2)} ETH` : ""}
                              {(cv.btcTotal > 0 || cv.ethTotal > 0) && cv.usdtTotal > 0 ? " · " : ""}
                              {cv.usdtTotal > 0 ? `${cv.usdtTotal.toFixed(0)} USDT` : ""}
                            </p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/30 text-xs">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right mono-nums font-bold">
                        {cv.patrimonioTotal > 0 ? (
                          <span className="text-gold">{formatBRL(cv.patrimonioTotal)}</span>
                        ) : (
                          <span className="text-muted-foreground/50">R$ 0,00</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right hidden lg:table-cell">
                        {totalDep > 0 ? (
                          <div>
                            <span className="mono-nums text-xs font-medium">{formatBRL(totalDep)}</span>
                            <p className="text-[9px] text-muted-foreground">{numDeposits} depósito(s)</p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/30 text-xs">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right hidden lg:table-cell">
                        {rend.valor !== 0 ? (
                          <div>
                            <span className={`mono-nums text-xs font-medium ${rend.valor >= 0 ? "text-profit" : "text-destructive"}`}>
                              {rend.percentual >= 0 ? "+" : ""}{rend.percentual.toFixed(1)}%
                            </span>
                            <p className={`text-[9px] ${rend.valor >= 0 ? "text-profit/70" : "text-destructive/70"}`}>
                              {formatBRL(rend.valor)}
                            </p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/30 text-xs">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center hidden xl:table-cell">
                        <div className="flex flex-wrap gap-1 justify-center">
                          {summary.activeProducts.length > 0 ? (
                            summary.activeProducts.slice(0, 3).map(p => (
                              <span key={p} className="inline-block px-1.5 py-0.5 rounded text-[9px] font-medium bg-gold/10 text-gold border border-gold/20">
                                {p}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-muted-foreground/50">—</span>
                          )}
                          {summary.activeProducts.length > 3 && (
                            <span className="text-[9px] text-muted-foreground">+{summary.activeProducts.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
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
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>Nenhum cliente encontrado.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
