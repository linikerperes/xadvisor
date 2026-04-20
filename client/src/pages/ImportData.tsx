/*
 * Design: "Black Vault" — Dark Luxury / Fintech Premium
 * Página de Importação de Dados — CSV upload e edição manual de depósitos/saques
 */
import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { clients, formatBRL } from "@/lib/clientData";
import { useDepositData, DepositRecord, saveDepositData } from "@/hooks/useDepositData";
import { Upload, FileSpreadsheet, Plus, Trash2, Save, Download, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function ImportData() {
  const { deposits, setDeposits } = useDepositData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingClient, setEditingClient] = useState<number | null>(null);
  const [newDeposit, setNewDeposit] = useState({ date: "", amount: "", type: "deposito" as "deposito" | "saque" });
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split("\n").filter(l => l.trim());
        const header = lines[0].toLowerCase();
        
        // Detect CSV format
        const separator = header.includes(";") ? ";" : ",";
        const headers = header.split(separator).map(h => h.trim().replace(/"/g, ""));
        
        const idCol = headers.findIndex(h => h === "id" || h === "client_id" || h === "id_cliente");
        const dateCol = headers.findIndex(h => h.includes("data") || h.includes("date"));
        const amountCol = headers.findIndex(h => h.includes("valor") || h.includes("amount") || h.includes("quantia"));
        const typeCol = headers.findIndex(h => h.includes("tipo") || h.includes("type"));

        if (idCol === -1 || amountCol === -1) {
          toast.error("CSV inválido. Colunas obrigatórias: id, valor. Opcionais: data, tipo");
          return;
        }

        const newDeposits: Record<number, DepositRecord[]> = { ...deposits };
        let imported = 0;

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(separator).map(c => c.trim().replace(/"/g, ""));
          const clientId = parseInt(cols[idCol]);
          if (isNaN(clientId)) continue;

          const client = clients.find(c => c.id === clientId);
          if (!client) continue;

          const amount = parseFloat(cols[amountCol]?.replace(/\./g, "").replace(",", ".") || "0");
          if (amount === 0) continue;

          const date = dateCol >= 0 ? cols[dateCol] : new Date().toLocaleDateString("pt-BR");
          const type = typeCol >= 0 
            ? (cols[typeCol]?.toLowerCase().includes("saque") ? "saque" : "deposito")
            : (amount < 0 ? "saque" : "deposito");

          if (!newDeposits[clientId]) newDeposits[clientId] = [];
          newDeposits[clientId].push({
            date,
            amount: Math.abs(amount),
            type: type as "deposito" | "saque",
          });
          imported++;
        }

        setDeposits(newDeposits);
        saveDepositData(newDeposits);
        setImportStatus(`${imported} registros importados com sucesso!`);
        toast.success(`${imported} registros importados!`);
      } catch (err) {
        toast.error("Erro ao processar CSV. Verifique o formato do arquivo.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const addManualDeposit = (clientId: number) => {
    if (!newDeposit.date || !newDeposit.amount) {
      toast.error("Preencha data e valor.");
      return;
    }
    const amount = parseFloat(newDeposit.amount.replace(/\./g, "").replace(",", "."));
    if (isNaN(amount) || amount <= 0) {
      toast.error("Valor inválido.");
      return;
    }

    const updated = { ...deposits };
    if (!updated[clientId]) updated[clientId] = [];
    updated[clientId].push({
      date: newDeposit.date,
      amount,
      type: newDeposit.type,
    });

    setDeposits(updated);
    saveDepositData(updated);
    setNewDeposit({ date: "", amount: "", type: "deposito" });
    setEditingClient(null);
    toast.success("Registro adicionado!");
  };

  const removeDeposit = (clientId: number, index: number) => {
    const updated = { ...deposits };
    if (updated[clientId]) {
      updated[clientId].splice(index, 1);
      if (updated[clientId].length === 0) delete updated[clientId];
      setDeposits(updated);
      saveDepositData(updated);
      toast.success("Registro removido.");
    }
  };

  const exportTemplate = () => {
    const header = "id;nome;data;valor;tipo";
    const rows = clients
      .filter(c => c.totalBRL > 0)
      .map(c => `${c.id};${c.name};;0;deposito`);
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "template_depositos_lp.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Template exportado!");
  };

  const clientsWithDeposits = clients.filter(c => deposits[c.id]?.length > 0);
  const totalDeposited = Object.values(deposits).flat().filter((d: DepositRecord) => d.type === "deposito").reduce((s: number, d: DepositRecord) => s + d.amount, 0);
  const totalWithdrawn = Object.values(deposits).flat().filter((d: DepositRecord) => d.type === "saque").reduce((s: number, d: DepositRecord) => s + d.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
          Importar Dados
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Importe depósitos e saques via CSV ou adicione manualmente
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="card-elevated gold-border rounded-xl p-4">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Depositado</p>
          <p className="text-lg font-bold text-gold mono-nums mt-1">{formatBRL(totalDeposited)}</p>
        </div>
        <div className="card-elevated rounded-xl p-4">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Sacado</p>
          <p className="text-lg font-bold text-destructive mono-nums mt-1">{formatBRL(totalWithdrawn)}</p>
        </div>
        <div className="card-elevated rounded-xl p-4">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Clientes com Registros</p>
          <p className="text-lg font-bold mono-nums mt-1">{clientsWithDeposits.length}</p>
        </div>
      </div>

      {/* Import Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="card-elevated gold-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gold flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
              <Upload className="w-4 h-4" />
              Importar CSV
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Formato aceito: CSV com colunas <code className="text-gold">id;data;valor;tipo</code>. 
              O separador pode ser <code className="text-gold">;</code> ou <code className="text-gold">,</code>.
              O tipo pode ser "deposito" ou "saque".
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              onChange={handleCSVImport}
              className="hidden"
            />
            <div className="flex gap-2">
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-gold text-black hover:bg-gold-bright"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Selecionar CSV
              </Button>
              <Button
                onClick={exportTemplate}
                variant="outline"
                className="border-gold/30 text-gold hover:bg-gold/10"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar Template
              </Button>
            </div>
            {importStatus && (
              <div className="flex items-center gap-2 text-xs text-profit">
                <CheckCircle2 className="w-4 h-4" />
                {importStatus}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gold flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
              <AlertCircle className="w-4 h-4" />
              Como Funciona
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-gold font-bold">1.</span>
                Exporte os dados de depósitos/saques do portal Onil Group
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold font-bold">2.</span>
                Organize em CSV com as colunas: id do cliente, data, valor, tipo (deposito/saque)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold font-bold">3.</span>
                Importe o CSV aqui ou adicione registros manualmente
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold font-bold">4.</span>
                Os dados de rendimento serão calculados automaticamente (saldo atual vs capital aportado)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold font-bold">5.</span>
                Use o template para facilitar o preenchimento
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Manual Entry per Client */}
      <Card className="card-elevated">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-gold" style={{ fontFamily: "var(--font-display)" }}>
            Registros por Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {clients.filter(c => c.totalBRL > 0).slice(0, 30).map(client => {
              const clientDeposits = deposits[client.id] || [];
              const totalDep = clientDeposits.filter((d: DepositRecord) => d.type === "deposito").reduce((s: number, d: DepositRecord) => s + d.amount, 0);
              const totalSaq = clientDeposits.filter((d: DepositRecord) => d.type === "saque").reduce((s: number, d: DepositRecord) => s + d.amount, 0);
              const capitalAportado = totalDep - totalSaq;
              const rendimento = client.totalBRL - capitalAportado;
              const rendPercent = capitalAportado > 0 ? ((rendimento / capitalAportado) * 100) : 0;
              const isEditing = editingClient === client.id;

              return (
                <div key={client.id} className="border border-border/30 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-foreground">{client.name}</span>
                        <span className="text-[10px] text-muted-foreground">ID: {client.id}</span>
                      </div>
                      <div className="flex gap-4 mt-1 text-[11px]">
                        <span className="text-muted-foreground">Saldo: <span className="text-gold mono-nums">{formatBRL(client.totalBRL)}</span></span>
                        {capitalAportado > 0 && (
                          <>
                            <span className="text-muted-foreground">Aportado: <span className="mono-nums">{formatBRL(capitalAportado)}</span></span>
                            <span className={rendimento >= 0 ? "text-profit" : "text-destructive"}>
                              Rend: {rendPercent.toFixed(1)}% ({formatBRL(rendimento)})
                            </span>
                          </>
                        )}
                        <span className="text-muted-foreground">{clientDeposits.length} registro(s)</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gold/30 text-gold hover:bg-gold/10 text-xs"
                      onClick={() => setEditingClient(isEditing ? null : client.id)}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      {isEditing ? "Fechar" : "Adicionar"}
                    </Button>
                  </div>

                  {/* Existing deposits */}
                  {clientDeposits.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {clientDeposits.map((dep: DepositRecord, i: number) => (
                        <div key={i} className="flex items-center justify-between py-1.5 px-2 rounded bg-muted/20 text-xs">
                          <div className="flex items-center gap-3">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${
                              dep.type === "deposito" ? "bg-profit/15 text-profit" : "bg-destructive/15 text-destructive"
                            }`}>
                              {dep.type === "deposito" ? "DEP" : "SAQ"}
                            </span>
                            <span className="text-muted-foreground mono-nums">{dep.date}</span>
                            <span className="font-medium mono-nums">{formatBRL(dep.amount)}</span>
                          </div>
                          <button
                            onClick={() => removeDeposit(client.id, i)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add new deposit form */}
                  {isEditing && (
                    <div className="mt-3 flex gap-2 items-end">
                      <div className="flex-1">
                        <label className="text-[10px] text-muted-foreground">Data</label>
                        <Input
                          type="date"
                          value={newDeposit.date}
                          onChange={e => setNewDeposit(p => ({ ...p, date: e.target.value }))}
                          className="bg-card border-border text-foreground h-8 text-xs"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] text-muted-foreground">Valor (R$)</label>
                        <Input
                          type="text"
                          placeholder="10.000,00"
                          value={newDeposit.amount}
                          onChange={e => setNewDeposit(p => ({ ...p, amount: e.target.value }))}
                          className="bg-card border-border text-foreground h-8 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground">Tipo</label>
                        <select
                          value={newDeposit.type}
                          onChange={e => setNewDeposit(p => ({ ...p, type: e.target.value as "deposito" | "saque" }))}
                          className="h-8 px-2 rounded-md bg-card border border-border text-foreground text-xs"
                        >
                          <option value="deposito">Depósito</option>
                          <option value="saque">Saque</option>
                        </select>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => addManualDeposit(client.id)}
                        className="bg-gold text-black hover:bg-gold-bright h-8 text-xs"
                      >
                        <Save className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
