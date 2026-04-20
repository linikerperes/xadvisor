import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { ArrowLeft, Save, Loader2, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function CrmClientForm() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const clientId = Number(params.id);
  const isNew = isNaN(clientId);

  const { data, isLoading } = trpc.advisorCrm.get.useQuery(
    { id: clientId },
    { enabled: !isNew }
  );

  const updateMutation = trpc.advisorCrm.update.useMutation({
    onSuccess: () => {
      toast.success("Cliente atualizado com sucesso!");
      setLocation(`/crm/clientes/${clientId}`);
    },
    onError: (e) => toast.error(e.message),
  });

  const [form, setForm] = useState({
    hobbies: "",
    favoriteRestaurants: "",
    travelPreferences: "",
    sportTeam: "",
    musicGenre: "",
    favoriteBooks: "",
    notes: "",
    spouseName: "",
    spouseBirthDate: "",
    weddingDate: "",
    occupation: "",
    city: "",
    state: "",
    cpf: "",
    riskProfile: "" as string,
    riskScore: undefined as number | undefined,
  });

  useEffect(() => {
    if (data?.client) {
      const c = data.client;
      setForm({
        hobbies: c.hobbies ?? "",
        favoriteRestaurants: c.favoriteRestaurants ?? "",
        travelPreferences: c.travelPreferences ?? "",
        sportTeam: c.sportTeam ?? "",
        musicGenre: c.musicGenre ?? "",
        favoriteBooks: c.favoriteBooks ?? "",
        notes: c.notes ?? "",
        spouseName: c.spouseName ?? "",
        spouseBirthDate: c.spouseBirthDate ?? "",
        weddingDate: c.weddingDate ?? "",
        occupation: c.occupation ?? "",
        city: c.city ?? "",
        state: c.state ?? "",
        cpf: c.cpf ?? "",
        riskProfile: c.riskProfile ?? "",
        riskScore: c.riskScore ?? undefined,
      });
    }
  }, [data]);

  const handleSave = () => {
    const payload: Record<string, any> = { id: clientId };
    Object.entries(form).forEach(([key, val]) => {
      if (val !== "" && val !== undefined) {
        payload[key] = val;
      }
    });
    if (payload.riskProfile && !["conservador", "moderado", "arrojado", "agressivo"].includes(payload.riskProfile)) {
      delete payload.riskProfile;
    }
    updateMutation.mutate(payload as any);
  };

  if (!isNew && isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  const set = (key: string, value: string | number) => setForm(f => ({ ...f, [key]: value }));

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation(isNew ? "/crm/clientes" : `/crm/clientes/${clientId}`)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <p className="text-[10px] text-gold uppercase tracking-widest font-semibold mb-0.5">CRM</p>
          <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
            {isNew ? "Novo Cliente" : `Editar — ${data?.client?.name ?? ""}`}
          </h1>
        </div>
      </div>

      {/* Personal Info */}
      <Card className="card-elevated border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gold flex items-center gap-2">
            <User className="h-4 w-4" /> Informações Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Ocupação</Label>
              <Input value={form.occupation} onChange={e => set("occupation", e.target.value)} placeholder="Ex: Empresário" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">CPF</Label>
              <Input value={form.cpf} onChange={e => set("cpf", e.target.value)} placeholder="000.000.000-00" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Cidade</Label>
              <Input value={form.city} onChange={e => set("city", e.target.value)} placeholder="Cidade" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Estado</Label>
              <Input value={form.state} onChange={e => set("state", e.target.value)} placeholder="UF" className="mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Cônjuge</Label>
              <Input value={form.spouseName} onChange={e => set("spouseName", e.target.value)} placeholder="Nome do cônjuge" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Aniv. Cônjuge</Label>
              <Input type="date" value={form.spouseBirthDate} onChange={e => set("spouseBirthDate", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Data Casamento</Label>
              <Input type="date" value={form.weddingDate} onChange={e => set("weddingDate", e.target.value)} className="mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Profile */}
      <Card className="card-elevated border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gold">Perfil de Risco</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Perfil</Label>
              <Select value={form.riskProfile || "none"} onValueChange={v => set("riskProfile", v === "none" ? "" : v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Não definido</SelectItem>
                  <SelectItem value="conservador">Conservador</SelectItem>
                  <SelectItem value="moderado">Moderado</SelectItem>
                  <SelectItem value="arrojado">Arrojado</SelectItem>
                  <SelectItem value="agressivo">Agressivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Score de Risco (0-100)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={form.riskScore ?? ""}
                onChange={e => set("riskScore", e.target.value ? Number(e.target.value) : "")}
                placeholder="0-100"
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card className="card-elevated border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gold">Preferências e Gostos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Hobbies</Label>
              <Input value={form.hobbies} onChange={e => set("hobbies", e.target.value)} placeholder="Ex: Golfe, Vinhos" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Restaurantes Favoritos</Label>
              <Input value={form.favoriteRestaurants} onChange={e => set("favoriteRestaurants", e.target.value)} placeholder="Ex: Fasano, Mani" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Preferências de Viagem</Label>
              <Input value={form.travelPreferences} onChange={e => set("travelPreferences", e.target.value)} placeholder="Ex: Europa, Praias" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Time Favorito</Label>
              <Input value={form.sportTeam} onChange={e => set("sportTeam", e.target.value)} placeholder="Ex: Corinthians" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Gênero Musical</Label>
              <Input value={form.musicGenre} onChange={e => set("musicGenre", e.target.value)} placeholder="Ex: MPB, Jazz" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Livros Favoritos</Label>
              <Input value={form.favoriteBooks} onChange={e => set("favoriteBooks", e.target.value)} placeholder="Ex: O Investidor Inteligente" className="mt-1" />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Observações Gerais</Label>
            <Textarea
              value={form.notes}
              onChange={e => set("notes", e.target.value)}
              placeholder="Anotações sobre o cliente..."
              className="mt-1 min-h-[80px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex justify-end gap-3 pb-8">
        <Button variant="outline" onClick={() => setLocation(isNew ? "/crm/clientes" : `/crm/clientes/${clientId}`)}>
          Cancelar
        </Button>
        <Button
          className="bg-gold text-black hover:bg-gold-bright gap-2"
          disabled={updateMutation.isPending}
          onClick={handleSave}
        >
          {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar
        </Button>
      </div>
    </div>
  );
}
