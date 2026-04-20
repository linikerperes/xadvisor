import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useLocation } from "wouter";
import { Gift, Loader2, Search, ChevronRight, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils-advisor";

const reactionEmoji: Record<string, string> = {
  adorou: "😍",
  gostou: "😊",
  neutro: "😐",
  nao_gostou: "😕",
};

export default function CrmGifts() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const { data: clients, isLoading: clientsLoading } = trpc.advisorCrm.search.useQuery({});
  const { data: allGiftsData, isLoading: giftsLoading } = trpc.gifts.listAll.useQuery();
  const isLoading = clientsLoading || giftsLoading;

  // Build client name map
  const clientMap = new Map<number, string>();
  if (clients) {
    for (const c of clients) {
      clientMap.set(c.id, c.name);
    }
  }

  // Flatten all gifts
  const allGifts: Array<{
    clientId: number;
    clientName: string;
    gift: any;
  }> = [];

  if (allGiftsData) {
    for (const g of allGiftsData) {
      allGifts.push({
        clientId: g.clientId,
        clientName: clientMap.get(g.clientId) ?? `Cliente #${g.clientId}`,
        gift: g,
      });
    }
  }

  // Sort by date descending
  allGifts.sort((a, b) => {
    const da = a.gift.giftDate ? new Date(a.gift.giftDate).getTime() : 0;
    const db = b.gift.giftDate ? new Date(b.gift.giftDate).getTime() : 0;
    return db - da;
  });

  const filtered = search
    ? allGifts.filter(
        (g) =>
          g.clientName.toLowerCase().includes(search.toLowerCase()) ||
          g.gift.giftName?.toLowerCase().includes(search.toLowerCase()) ||
          g.gift.occasion?.toLowerCase().includes(search.toLowerCase())
      )
    : allGifts;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <p className="text-[10px] text-gold uppercase tracking-widest font-semibold mb-1">CRM</p>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
            <Gift className="h-7 w-7 text-gold" />
            Presentes
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Histórico de presentes enviados para seus clientes
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por cliente, presente ou ocasião..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Gifts List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map((item, idx) => (
            <div
              key={`${item.clientId}-${item.gift.id}-${idx}`}
              className="card-elevated p-4 rounded-xl border border-border hover:border-gold/30 transition-all cursor-pointer group"
              onClick={() => setLocation(`/crm/clientes/${item.clientId}`)}
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                  <Gift className="h-5 w-5 text-gold" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-foreground group-hover:text-gold transition-colors">
                      {item.gift.giftName || "Presente"}
                    </p>
                    {item.gift.reaction && (
                      <span className="text-sm">{reactionEmoji[item.gift.reaction] ?? ""}</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Para: {item.clientName}
                    {item.gift.occasion && ` · ${item.gift.occasion}`}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {item.gift.giftValue && (
                    <Badge variant="outline" className="text-gold border-gold/30 bg-gold/5 font-mono">
                      {formatCurrency(parseFloat(item.gift.giftValue))}
                    </Badge>
                  )}
                  {item.gift.giftDate && (
                    <span className="text-xs text-muted-foreground">{formatDate(item.gift.giftDate)}</span>
                  )}
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-gold transition-colors" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card-elevated flex flex-col items-center justify-center py-20 text-center rounded-xl border border-border">
          <Gift className="h-14 w-14 text-muted-foreground/15 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {search ? "Nenhum presente encontrado" : "Nenhum presente registrado"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            {search
              ? "Tente buscar com outros termos."
              : "Registre presentes nos perfis dos clientes para vê-los aqui."}
          </p>
        </div>
      )}

      {/* Summary */}
      {allGifts.length > 0 && (
        <Card className="card-elevated border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gold flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> Resumo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold mono-nums">{allGifts.length}</p>
                <p className="text-xs text-muted-foreground">Total Presentes</p>
              </div>
              <div>
                <p className="text-2xl font-bold mono-nums text-gold">
                  {formatCurrency(allGifts.reduce((sum, g) => sum + parseFloat(g.gift.giftValue || "0"), 0))}
                </p>
                <p className="text-xs text-muted-foreground">Valor Total</p>
              </div>
              <div>
                <p className="text-2xl font-bold mono-nums">
                  {new Set(allGifts.map((g) => g.clientId)).size}
                </p>
                <p className="text-xs text-muted-foreground">Clientes Presenteados</p>
              </div>
              <div>
                <p className="text-2xl font-bold mono-nums text-emerald-400">
                  {allGifts.filter((g) => g.gift.reaction === "adorou").length}
                </p>
                <p className="text-xs text-muted-foreground">Adoraram 😍</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
