/*
 * Design: "Black Vault" — Dark Luxury / Fintech Premium
 * Página de Sincronização com Onil Group — Importação de dados para o banco de dados
 */
import { useState, useRef, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import {
  RefreshCw, Upload, FileSpreadsheet, Download, CheckCircle2, AlertCircle,
  Database, Clock, Users, DollarSign, ArrowUpRight, ArrowDownRight, Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface ParsedClient {
  externalId: number;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  registered: string;
  status: "Ativado" | "Inativo";
  totalBRL: string;
  walletBRL: string;
  walletUSDT: string;
  walletBTC: string;
  walletETH: string;
  securityBRL: string;
  expertBRL: string;
  secBRL: string;
  expBRL: string;
  securityUSDT: string;
  expertUSDT: string;
  secUSDT: string;
  expUSDT: string;
  securityBTC: string;
  secBTC: string;
  securityETH: string;
  secETH: string;
}

interface ParsedTransaction {
  clientExternalId: number;
  type: "deposito" | "saque";
  amount: string;
  date: string;
  description: string;
}

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function SyncOnil() {
  const [clientsPreview, setClientsPreview] = useState<ParsedClient[]>([]);
  const [transactionsPreview, setTransactionsPreview] = useState<ParsedTransaction[]>([]);
  const [importStep, setImportStep] = useState<"idle" | "preview" | "importing" | "done">("idle");
  const [importType, setImportType] = useState<"clients" | "transactions">("clients");
  const clientsFileRef = useRef<HTMLInputElement>(null);
  const txFileRef = useRef<HTMLInputElement>(null);

  // tRPC queries
  const { data: dbClients, refetch: refetchClients } = trpc.clients.list.useQuery();
  const { data: snapshots, refetch: refetchSnapshots } = trpc.snapshots.list.useQuery();
  const { data: stats, refetch: refetchStats } = trpc.clients.stats.useQuery();

  // Auto-sync Onil
  const syncOnil = trpc.sync.onil.useMutation({
    onSuccess: (data) => {
      toast.success(`✅ Sync concluído! ${data.imported} clientes atualizados. AUM: R$ ${parseFloat(data.totalAUM).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`);
      refetchClients();
      refetchSnapshots();
      refetchStats();
    },
    onError: (err) => toast.error(`Erro no sync: ${err.message}`),
  });

  // tRPC mutations
  const bulkImportClients = trpc.clients.bulkImport.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.imported} clientes importados com sucesso!`);
      setImportStep("done");
      refetchClients();
      refetchSnapshots();
      refetchStats();
    },
    onError: (err) => {
      toast.error(`Erro: ${err.message}`);
      setImportStep("preview");
    },
  });

  const bulkImportTx = trpc.transactions.bulkImport.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.imported} transações importadas com sucesso!`);
      setImportStep("done");
      refetchSnapshots();
    },
    onError: (err) => {
      toast.error(`Erro: ${err.message}`);
      setImportStep("preview");
    },
  });

  // Parse clients CSV
  const handleClientsCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split("\n").filter(l => l.trim());
        const sep = lines[0].includes(";") ? ";" : ",";
        const headers = lines[0].split(sep).map(h => h.trim().replace(/"/g, "").toLowerCase());

        const findCol = (names: string[]) => headers.findIndex(h => names.some(n => h.includes(n)));
        const idCol = findCol(["id", "external"]);
        const nameCol = findCol(["nome", "name"]);
        const emailCol = findCol(["email"]);
        const phoneCol = findCol(["phone", "telefone", "fone"]);
        const birthCol = findCol(["nascimento", "birth"]);
        const regCol = findCol(["registro", "registered", "cadastro"]);
        const statusCol = findCol(["status"]);
        const totalCol = findCol(["totalbrl", "total_brl", "total"]);
        const walletBRLCol = findCol(["walletbrl", "wallet_brl"]);
        const walletUSDTCol = findCol(["walletusdt", "wallet_usdt"]);
        const walletBTCCol = findCol(["walletbtc", "wallet_btc"]);
        const walletETHCol = findCol(["walleteth", "wallet_eth"]);
        const securityBRLCol = findCol(["securitybrl", "security_brl"]);
        const expertBRLCol = findCol(["expertbrl", "expert_brl"]);
        const secBRLCol = findCol(["secbrl", "sec_brl"]);
        const expBRLCol = findCol(["expbrl", "exp_brl"]);
        const securityUSDTCol = findCol(["securityusdt", "security_usdt"]);
        const expertUSDTCol = findCol(["expertusdt", "expert_usdt"]);
        const secUSDTCol = findCol(["secusdt", "sec_usdt"]);
        const expUSDTCol = findCol(["expusdt", "exp_usdt"]);
        const securityBTCCol = findCol(["securitybtc", "security_btc"]);
        const secBTCCol = findCol(["secbtc", "sec_btc"]);
        const securityETHCol = findCol(["securityeth", "security_eth"]);
        const secETHCol = findCol(["seceth", "sec_eth"]);

        if (idCol === -1 || nameCol === -1) {
          toast.error("CSV inválido. Colunas obrigatórias: id e nome/name.");
          return;
        }

        const parseNum = (val: string | undefined) => {
          if (!val) return "0";
          return val.replace(/"/g, "").replace(/\./g, "").replace(",", ".") || "0";
        };

        const parsed: ParsedClient[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(sep).map(c => c.trim().replace(/^"|"$/g, ""));
          const externalId = parseInt(cols[idCol]);
          if (isNaN(externalId)) continue;

          parsed.push({
            externalId,
            name: cols[nameCol] || "",
            email: emailCol >= 0 ? cols[emailCol] || "" : "",
            phone: phoneCol >= 0 ? cols[phoneCol] || "" : "",
            birthDate: birthCol >= 0 ? cols[birthCol] || "" : "",
            registered: regCol >= 0 ? cols[regCol] || "" : "",
            status: statusCol >= 0 && cols[statusCol]?.toLowerCase().includes("inativ") ? "Inativo" : "Ativado",
            totalBRL: totalCol >= 0 ? parseNum(cols[totalCol]) : "0",
            walletBRL: walletBRLCol >= 0 ? parseNum(cols[walletBRLCol]) : "0",
            walletUSDT: walletUSDTCol >= 0 ? parseNum(cols[walletUSDTCol]) : "0",
            walletBTC: walletBTCCol >= 0 ? parseNum(cols[walletBTCCol]) : "0",
            walletETH: walletETHCol >= 0 ? parseNum(cols[walletETHCol]) : "0",
            securityBRL: securityBRLCol >= 0 ? parseNum(cols[securityBRLCol]) : "0",
            expertBRL: expertBRLCol >= 0 ? parseNum(cols[expertBRLCol]) : "0",
            secBRL: secBRLCol >= 0 ? parseNum(cols[secBRLCol]) : "0",
            expBRL: expBRLCol >= 0 ? parseNum(cols[expBRLCol]) : "0",
            securityUSDT: securityUSDTCol >= 0 ? parseNum(cols[securityUSDTCol]) : "0",
            expertUSDT: expertUSDTCol >= 0 ? parseNum(cols[expertUSDTCol]) : "0",
            secUSDT: secUSDTCol >= 0 ? parseNum(cols[secUSDTCol]) : "0",
            expUSDT: expUSDTCol >= 0 ? parseNum(cols[expUSDTCol]) : "0",
            securityBTC: securityBTCCol >= 0 ? parseNum(cols[securityBTCCol]) : "0",
            secBTC: secBTCCol >= 0 ? parseNum(cols[secBTCCol]) : "0",
            securityETH: securityETHCol >= 0 ? parseNum(cols[securityETHCol]) : "0",
            secETH: secETHCol >= 0 ? parseNum(cols[secETHCol]) : "0",
          });
        }

        setClientsPreview(parsed);
        setImportType("clients");
        setImportStep("preview");
        toast.success(`${parsed.length} clientes encontrados no CSV.`);
      } catch {
        toast.error("Erro ao processar CSV.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Parse transactions CSV
  const handleTransactionsCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split("\n").filter(l => l.trim());
        const sep = lines[0].includes(";") ? ";" : ",";
        const headers = lines[0].split(sep).map(h => h.trim().replace(/"/g, "").toLowerCase());

        const findCol = (names: string[]) => headers.findIndex(h => names.some(n => h.includes(n)));
        const idCol = findCol(["id", "client", "cliente"]);
        const typeCol = findCol(["tipo", "type"]);
        const amountCol = findCol(["valor", "amount", "quantia"]);
        const dateCol = findCol(["data", "date"]);
        const descCol = findCol(["descri", "description", "obs"]);

        if (idCol === -1 || amountCol === -1) {
          toast.error("CSV inválido. Colunas obrigatórias: id e valor/amount.");
          return;
        }

        const parsed: ParsedTransaction[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(sep).map(c => c.trim().replace(/^"|"$/g, ""));
          const clientExternalId = parseInt(cols[idCol]);
          if (isNaN(clientExternalId)) continue;

          const rawAmount = cols[amountCol]?.replace(/"/g, "").replace(/\./g, "").replace(",", ".") || "0";
          const amount = parseFloat(rawAmount);
          if (amount === 0) continue;

          const type = typeCol >= 0 && cols[typeCol]?.toLowerCase().includes("saque") ? "saque" : "deposito";
          const date = dateCol >= 0 ? cols[dateCol] || new Date().toLocaleDateString("pt-BR") : new Date().toLocaleDateString("pt-BR");

          parsed.push({
            clientExternalId,
            type: amount < 0 ? "saque" : type,
            amount: Math.abs(amount).toFixed(2),
            date,
            description: descCol >= 0 ? cols[descCol] || "" : "",
          });
        }

        setTransactionsPreview(parsed);
        setImportType("transactions");
        setImportStep("preview");
        toast.success(`${parsed.length} transações encontradas no CSV.`);
      } catch {
        toast.error("Erro ao processar CSV.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Execute import
  const executeImport = () => {
    setImportStep("importing");
    if (importType === "clients") {
      bulkImportClients.mutate({ clients: clientsPreview, notes: `Importação manual de ${clientsPreview.length} clientes` });
    } else {
      bulkImportTx.mutate({ transactions: transactionsPreview });
    }
  };

  // Export template
  const exportClientsTemplate = () => {
    const header = "id;nome;email;telefone;nascimento;registro;status;totalBRL;walletBRL;walletUSDT;walletBTC;walletETH;securityBRL;expertBRL;secBRL;expBRL;securityUSDT;expertUSDT;secUSDT;expUSDT;securityBTC;secBTC;securityETH;secETH";
    const csv = header + "\n";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "template_clientes_onil.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Template de clientes exportado!");
  };

  const exportTransactionsTemplate = () => {
    const header = "id_cliente;tipo;valor;data;descricao";
    const csv = header + "\n";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "template_transacoes_onil.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Template de transações exportado!");
  };

  const previewAUM = useMemo(() => {
    if (importType === "clients") {
      return clientsPreview.reduce((s, c) => s + parseFloat(c.totalBRL || "0"), 0);
    }
    return transactionsPreview.reduce((s, t) => s + parseFloat(t.amount), 0);
  }, [clientsPreview, transactionsPreview, importType]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
            Sincronizar com Onil Group
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Importe dados atualizados do portal Onil para o banco de dados do dashboard
          </p>
        </div>
        <Button
          onClick={() => syncOnil.mutate()}
          disabled={syncOnil.isPending}
          className="bg-gold hover:bg-gold/90 text-black font-bold px-6 py-5 text-base rounded-xl shadow-lg shadow-gold/20 flex items-center gap-2"
        >
          {syncOnil.isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Sincronizando... (pode levar 1-2 min)
            </>
          ) : (
            <>
              <RefreshCw className="w-5 h-5" />
              Sincronizar Agora
            </>
          )}
        </Button>
      </div>

      {/* Status do Banco */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="card-elevated gold-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Database className="w-3.5 h-3.5 text-gold" />
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Clientes no Banco</p>
          </div>
          <p className="text-lg font-bold text-gold mono-nums">{stats?.totalClients ?? 0}</p>
        </div>
        <div className="card-elevated rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-3.5 h-3.5 text-gold" />
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Ativos</p>
          </div>
          <p className="text-lg font-bold mono-nums">{stats?.activeClients ?? 0}</p>
        </div>
        <div className="card-elevated rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-3.5 h-3.5 text-gold" />
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">AUM no Banco</p>
          </div>
          <p className="text-lg font-bold mono-nums">{formatBRL(parseFloat(stats?.totalAUM || "0"))}</p>
        </div>
        <div className="card-elevated rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-3.5 h-3.5 text-gold" />
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Última Sync</p>
          </div>
          <p className="text-sm font-bold mono-nums">
            {snapshots && snapshots.length > 0
              ? new Date(snapshots[0].createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
              : "Nunca"}
          </p>
        </div>
      </div>

      {/* Import Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Clientes CSV */}
        <Card className="card-elevated gold-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gold flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
              <Users className="w-4 h-4" />
              Importar Clientes (CSV)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Importe o CSV com dados dos clientes extraídos do portal Onil Group.
              Colunas obrigatórias: <code className="text-gold">id</code> e <code className="text-gold">nome</code>.
              Todos os saldos são opcionais.
            </p>
            <input ref={clientsFileRef} type="file" accept=".csv,.txt" onChange={handleClientsCSV} className="hidden" />
            <div className="flex gap-2">
              <Button onClick={() => clientsFileRef.current?.click()} className="bg-gold text-black hover:bg-gold-bright">
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Selecionar CSV
              </Button>
              <Button onClick={exportClientsTemplate} variant="outline" className="border-gold/30 text-gold hover:bg-gold/10">
                <Download className="w-4 h-4 mr-2" />
                Template
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transações CSV */}
        <Card className="card-elevated">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gold flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
              <ArrowUpRight className="w-4 h-4" />
              Importar Depósitos/Saques (CSV)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Importe o CSV com depósitos e saques.
              Colunas: <code className="text-gold">id_cliente</code>, <code className="text-gold">tipo</code> (deposito/saque),
              <code className="text-gold"> valor</code>, <code className="text-gold">data</code>.
            </p>
            <input ref={txFileRef} type="file" accept=".csv,.txt" onChange={handleTransactionsCSV} className="hidden" />
            <div className="flex gap-2">
              <Button onClick={() => txFileRef.current?.click()} className="bg-gold text-black hover:bg-gold-bright">
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Selecionar CSV
              </Button>
              <Button onClick={exportTransactionsTemplate} variant="outline" className="border-gold/30 text-gold hover:bg-gold/10">
                <Download className="w-4 h-4 mr-2" />
                Template
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview */}
      {importStep === "preview" && (
        <Card className="card-elevated gold-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gold flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
              <AlertCircle className="w-4 h-4" />
              Pré-visualização — {importType === "clients" ? `${clientsPreview.length} Clientes` : `${transactionsPreview.length} Transações`}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Total: <span className="text-gold font-bold mono-nums">{formatBRL(previewAUM)}</span></span>
              <span>Registros: <span className="font-bold mono-nums">{importType === "clients" ? clientsPreview.length : transactionsPreview.length}</span></span>
            </div>

            {/* Preview table */}
            <div className="max-h-64 overflow-y-auto rounded-lg border border-border/30">
              <table className="w-full text-xs">
                <thead className="bg-muted/30 sticky top-0">
                  {importType === "clients" ? (
                    <tr>
                      <th className="text-left p-2 text-muted-foreground">ID</th>
                      <th className="text-left p-2 text-muted-foreground">Nome</th>
                      <th className="text-left p-2 text-muted-foreground">Email</th>
                      <th className="text-right p-2 text-muted-foreground">Total BRL</th>
                      <th className="text-left p-2 text-muted-foreground">Status</th>
                    </tr>
                  ) : (
                    <tr>
                      <th className="text-left p-2 text-muted-foreground">ID Cliente</th>
                      <th className="text-left p-2 text-muted-foreground">Tipo</th>
                      <th className="text-right p-2 text-muted-foreground">Valor</th>
                      <th className="text-left p-2 text-muted-foreground">Data</th>
                    </tr>
                  )}
                </thead>
                <tbody>
                  {importType === "clients"
                    ? clientsPreview.slice(0, 20).map((c, i) => (
                        <tr key={i} className="border-t border-border/20">
                          <td className="p-2 mono-nums text-muted-foreground">{c.externalId}</td>
                          <td className="p-2">{c.name}</td>
                          <td className="p-2 text-muted-foreground">{c.email}</td>
                          <td className="p-2 text-right mono-nums text-gold">{formatBRL(parseFloat(c.totalBRL))}</td>
                          <td className="p-2">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] ${c.status === "Ativado" ? "bg-profit/15 text-profit" : "bg-destructive/15 text-destructive"}`}>
                              {c.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    : transactionsPreview.slice(0, 20).map((t, i) => (
                        <tr key={i} className="border-t border-border/20">
                          <td className="p-2 mono-nums text-muted-foreground">{t.clientExternalId}</td>
                          <td className="p-2">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] ${t.type === "deposito" ? "bg-profit/15 text-profit" : "bg-destructive/15 text-destructive"}`}>
                              {t.type === "deposito" ? "DEP" : "SAQ"}
                            </span>
                          </td>
                          <td className="p-2 text-right mono-nums">{formatBRL(parseFloat(t.amount))}</td>
                          <td className="p-2 text-muted-foreground">{t.date}</td>
                        </tr>
                      ))}
                </tbody>
              </table>
              {(importType === "clients" ? clientsPreview.length : transactionsPreview.length) > 20 && (
                <p className="text-center text-[10px] text-muted-foreground py-2">
                  ... e mais {(importType === "clients" ? clientsPreview.length : transactionsPreview.length) - 20} registros
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button onClick={executeImport} className="bg-gold text-black hover:bg-gold-bright">
                <Upload className="w-4 h-4 mr-2" />
                Confirmar Importação
              </Button>
              <Button onClick={() => { setImportStep("idle"); setClientsPreview([]); setTransactionsPreview([]); }} variant="outline" className="border-gold/30 text-gold hover:bg-gold/10">
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Importing */}
      {importStep === "importing" && (
        <Card className="card-elevated gold-border">
          <CardContent className="flex items-center justify-center py-12 gap-3">
            <Loader2 className="w-6 h-6 text-gold animate-spin" />
            <span className="text-sm text-gold">Importando dados para o banco de dados...</span>
          </CardContent>
        </Card>
      )}

      {/* Done */}
      {importStep === "done" && (
        <Card className="card-elevated gold-border">
          <CardContent className="flex flex-col items-center justify-center py-8 gap-3">
            <CheckCircle2 className="w-10 h-10 text-profit" />
            <p className="text-sm text-profit font-medium">Importação concluída com sucesso!</p>
            <Button onClick={() => { setImportStep("idle"); setClientsPreview([]); setTransactionsPreview([]); }} variant="outline" className="border-gold/30 text-gold hover:bg-gold/10 mt-2">
              Nova Importação
            </Button>
          </CardContent>
        </Card>
      )}

      {/* How it works */}
      <Card className="card-elevated">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-gold flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
            <RefreshCw className="w-4 h-4" />
            Como Sincronizar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xs font-bold text-gold mb-2">Fluxo Automático (via Manus)</h3>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-gold font-bold">1.</span>
                  Peça ao Manus: "Atualize os dados dos meus clientes da Onil"
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold font-bold">2.</span>
                  O Manus acessa o portal, extrai os dados atualizados e gera o CSV
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold font-bold">3.</span>
                  Importe o CSV gerado nesta página para atualizar o banco de dados
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-bold text-gold mb-2">Fluxo Manual</h3>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-gold font-bold">1.</span>
                  Baixe o template CSV e preencha com os dados do portal Onil
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold font-bold">2.</span>
                  Importe o CSV de clientes para atualizar saldos e posições
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold font-bold">3.</span>
                  Importe o CSV de transações para registrar depósitos e saques
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Histórico de Importações */}
      {snapshots && snapshots.length > 0 && (
        <Card className="card-elevated">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gold flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
              <Clock className="w-4 h-4" />
              Histórico de Importações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {snapshots.map((snap) => (
                <div key={snap.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/20 text-xs">
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground mono-nums">
                      {new Date(snap.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span className="text-foreground">{snap.notes}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground">{snap.totalClients} clientes</span>
                    <span className="text-gold mono-nums font-medium">{formatBRL(parseFloat(snap.totalAUM as string))}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
