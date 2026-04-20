import { trpc } from "@/lib/trpc";
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Brain, Loader2, Search, ChevronRight, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getProfileLabel } from "@/lib/utils-advisor";

const PROFILE_COLORS: Record<string, string> = {
  dominante: "text-red-400 border-red-500/30 bg-red-500/10",
  influente: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  estavel: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  cauteloso: "text-sky-400 border-sky-500/30 bg-sky-500/10",
};

export default function CrmQuestionnaire() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const { data: clients, isLoading } = trpc.advisorCrm.search.useQuery({});

  // For each client, check if they have neuro answers
  // We'll show a list of clients with their neuro status
  const filtered = useMemo(() => {
    if (!clients) return [];
    let list = clients;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q));
    }
    return list;
  }, [clients, search]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <p className="text-[10px] text-gold uppercase tracking-widest font-semibold mb-1">CRM</p>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
          <Brain className="h-7 w-7 text-gold" />
          Questionário Neuropsicológico
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Perfil comportamental dos clientes baseado em neurociência financeira
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Info */}
      <div className="bg-gold/5 border border-gold/20 rounded-xl p-4 text-sm text-muted-foreground">
        <p>
          <strong className="text-gold">Como funciona:</strong> Envie o link do formulário para o cliente (na página de detalhe do cliente).
          Quando ele preencher o questionário, o perfil neuropsicológico será calculado automaticamente e aparecerá aqui.
        </p>
      </div>

      {/* Client List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map((client) => (
            <div
              key={client.id}
              className="card-elevated p-4 rounded-xl border border-border hover:border-gold/30 transition-all cursor-pointer group"
              onClick={() => setLocation(`/crm/clientes/${client.id}`)}
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                  {client.photoUrl ? (
                    <img src={client.photoUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground group-hover:text-gold transition-colors truncate">
                    {client.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {client.email || client.phone || "Sem contato"}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="text-muted-foreground border-border text-xs">
                    Ver perfil
                  </Badge>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-gold transition-colors" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card-elevated flex flex-col items-center justify-center py-20 text-center rounded-xl border border-border">
          <Brain className="h-14 w-14 text-muted-foreground/15 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {search ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            {search
              ? "Tente buscar com outros termos."
              : "Importe clientes do broker Onil para começar."}
          </p>
        </div>
      )}
    </div>
  );
}
