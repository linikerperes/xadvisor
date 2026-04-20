import { trpc } from "@/lib/trpc";
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Search, Plus, Users, ChevronRight, Brain, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, getRiskLabel, getRiskBadgeClass } from "@/lib/utils-advisor";

export default function CrmClientList() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const { data: allClients, isLoading } = trpc.clients.list.useQuery();

  // Clients from advisor_clients table (CRM)
  // We use the Onil clients list and link them to CRM data via advisorCrm.get
  // For now, show all clients and allow navigation to CRM detail

  const filtered = useMemo(() => {
    if (!allClients) return [];
    const q = search.toLowerCase();
    return allClients.filter((c: any) =>
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.includes(q)
    );
  }, [allClients, search]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <p className="text-[10px] text-gold uppercase tracking-widest font-semibold mb-1">CRM</p>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
            <Users className="h-7 w-7 text-gold" />
            Clientes
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {allClients?.length ?? 0} clientes cadastrados
          </p>
        </div>
        <Button
          onClick={() => setLocation("/crm/clientes/novo")}
          className="bg-gold text-black hover:bg-gold-bright font-semibold gap-2"
        >
          <Plus className="h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, email ou telefone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-card border-border text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {/* Client List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 card-elevated rounded-xl animate-pulse border border-border" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map((client: any) => (
            <div
              key={client.id}
              className="card-elevated p-4 rounded-xl border border-border hover:border-gold/30 transition-all cursor-pointer group"
              onClick={() => setLocation(`/crm/clientes/${client.id}`)}
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="h-11 w-11 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                  {client.photoUrl ? (
                    <img src={client.photoUrl} alt="" className="h-11 w-11 rounded-full object-cover" />
                  ) : (
                    <span className="text-gold font-bold text-sm" style={{ fontFamily: "var(--font-display)" }}>
                      {client.name?.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground group-hover:text-gold transition-colors truncate">
                    {client.name}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5">
                    {client.email && (
                      <p className="text-xs text-muted-foreground truncate">{client.email}</p>
                    )}
                    {client.city && client.state && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {client.city}/{client.state}
                      </span>
                    )}
                  </div>
                </div>

                {/* Risk + Capital */}
                <div className="flex items-center gap-3 shrink-0">
                  {client.riskProfile && (
                    <Badge variant="outline" className={`text-xs font-semibold ${getRiskBadgeClass(client.riskProfile)}`}>
                      {getRiskLabel(client.riskProfile)}
                    </Badge>
                  )}
                  {client.totalBRL && parseFloat(client.totalBRL) > 0 && (
                    <span className="text-sm font-bold mono-nums text-foreground">
                      {formatCurrency(parseFloat(client.totalBRL))}
                    </span>
                  )}
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-gold transition-colors" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card-elevated flex flex-col items-center justify-center py-16 text-center rounded-xl border border-border">
          <Users className="h-12 w-12 text-muted-foreground/20 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {search ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {search ? "Tente buscar com outros termos." : "Comece cadastrando seu primeiro cliente."}
          </p>
          {!search && (
            <Button
              onClick={() => setLocation("/crm/clientes/novo")}
              className="mt-4 bg-gold text-black hover:bg-gold-bright font-semibold gap-2"
            >
              <Plus className="h-4 w-4" />
              Cadastrar Cliente
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
