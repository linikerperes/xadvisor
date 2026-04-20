import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import {
  ArrowLeft, User, Heart, Calendar, Gift, Brain, MessageSquare,
  Plus, Trash2, Edit, MapPin, Phone, Mail, Briefcase, Star,
  Music, Book, Utensils, Plane, Trophy, Sparkles, Loader2, Send,
  ExternalLink, Copy, Check
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  formatCurrency, formatDate, formatDateShort, getDaysUntil,
  getRiskLabel, getProfileLabel, getDateTypeLabel,
  getInteractionTypeLabel, getRelationshipLabel, today
} from "@/lib/utils-advisor";
import { AvatarUpload } from "@/components/AvatarUpload";
import ClientFormLinkModal from "@/components/ClientFormLinkModal";

export default function CrmClientDetail() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const clientId = Number(params.id);
  const utils = trpc.useUtils();

  const { data, isLoading, error } = trpc.advisorCrm.get.useQuery({ id: clientId });

  // ── Family ──
  const [familyOpen, setFamilyOpen] = useState(false);
  const [familyForm, setFamilyForm] = useState({ name: "", relationship: "filho" as const, birthDate: "" });
  const addFamily = trpc.family.upsert.useMutation({
    onSuccess: () => { utils.advisorCrm.get.invalidate({ id: clientId }); setFamilyOpen(false); setFamilyForm({ name: "", relationship: "filho", birthDate: "" }); toast.success("Familiar adicionado"); },
  });
  const delFamily = trpc.family.delete.useMutation({
    onSuccess: () => { utils.advisorCrm.get.invalidate({ id: clientId }); toast.success("Familiar removido"); },
  });

  // ── Dates ──
  const [dateOpen, setDateOpen] = useState(false);
  const [dateForm, setDateForm] = useState({ title: "", date: "", type: "aniversario_cliente" as const, personName: "" });
  const addDate = trpc.dates.upsert.useMutation({
    onSuccess: () => { utils.advisorCrm.get.invalidate({ id: clientId }); setDateOpen(false); setDateForm({ title: "", date: "", type: "aniversario_cliente", personName: "" }); toast.success("Data adicionada"); },
  });
  const delDate = trpc.dates.delete.useMutation({
    onSuccess: () => { utils.advisorCrm.get.invalidate({ id: clientId }); toast.success("Data removida"); },
  });

  // ── Gifts ──
  const [giftOpen, setGiftOpen] = useState(false);
  const [giftForm, setGiftForm] = useState({ giftName: "", giftCategory: "", giftValue: "", occasion: "", giftDate: today(), reaction: "gostou" as const, notes: "" });
  const addGift = trpc.gifts.add.useMutation({
    onSuccess: () => { utils.advisorCrm.get.invalidate({ id: clientId }); setGiftOpen(false); toast.success("Presente registrado"); },
  });
  const delGift = trpc.gifts.delete.useMutation({
    onSuccess: () => { utils.advisorCrm.get.invalidate({ id: clientId }); toast.success("Presente removido"); },
  });
  const suggestGifts = trpc.gifts.suggest.useMutation();

  // ── Interactions ──
  const [intOpen, setIntOpen] = useState(false);
  const [intForm, setIntForm] = useState({ type: "reuniao" as const, interactionDate: today(), title: "", description: "" });
  const addInt = trpc.interactions.add.useMutation({
    onSuccess: () => { utils.advisorCrm.get.invalidate({ id: clientId }); setIntOpen(false); toast.success("Interação registrada"); },
  });
  const delInt = trpc.interactions.delete.useMutation({
    onSuccess: () => { utils.advisorCrm.get.invalidate({ id: clientId }); toast.success("Interação removida"); },
  });

  // ── Form Link ──
  const [formLinkOpen, setFormLinkOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <p className="text-muted-foreground mb-4">Cliente não encontrado.</p>
        <Button variant="outline" onClick={() => setLocation("/crm/clientes")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
        </Button>
      </div>
    );
  }

  const { client, family, dates, portfolio, neuro, gifts, interactions } = data;

  const REACTION_EMOJI: Record<string, string> = { adorou: "😍", gostou: "😊", neutro: "😐", nao_gostou: "😕" };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/crm/clientes")} className="mt-1 shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-4 flex-wrap">
            <AvatarUpload clientId={clientId} currentPhotoUrl={client.photoUrl} clientName={client.name} />
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-foreground truncate" style={{ fontFamily: "var(--font-display)" }}>
                {client.name}
              </h1>
              <div className="flex items-center gap-3 mt-1 flex-wrap text-sm text-muted-foreground">
                {client.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{client.email}</span>}
                {client.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{client.phone}</span>}
                {client.city && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{client.city}{client.state ? `/${client.state}` : ""}</span>}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={() => setFormLinkOpen(true)} className="gap-1 text-xs">
                <Send className="h-3 w-3" /> Enviar Formulário
              </Button>
              <Button variant="outline" size="sm" onClick={() => setLocation(`/crm/clientes/${clientId}/editar`)} className="gap-1 text-xs">
                <Edit className="h-3 w-3" /> Editar
              </Button>
            </div>
          </div>

          {/* Quick Info Badges */}
          <div className="flex gap-2 mt-3 flex-wrap">
            {client.riskProfile && (
              <Badge variant="outline" className="text-xs">{getRiskLabel(client.riskProfile)}</Badge>
            )}
            {client.occupation && (
              <Badge variant="outline" className="text-xs"><Briefcase className="h-3 w-3 mr-1" />{client.occupation}</Badge>
            )}
            {portfolio?.totalCapital && parseFloat(portfolio.totalCapital) > 0 && (
              <Badge variant="outline" className="text-xs text-gold border-gold/30">{formatCurrency(parseFloat(portfolio.totalCapital))}</Badge>
            )}
            {neuro?.dominantProfile && (
              <Badge variant="outline" className="text-xs"><Brain className="h-3 w-3 mr-1" />{getProfileLabel(neuro.dominantProfile)}</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="bg-card border border-border w-full justify-start overflow-x-auto flex-nowrap">
          <TabsTrigger value="profile" className="gap-1.5 text-xs"><User className="h-3.5 w-3.5" />Perfil</TabsTrigger>
          <TabsTrigger value="family" className="gap-1.5 text-xs"><Heart className="h-3.5 w-3.5" />Família</TabsTrigger>
          <TabsTrigger value="dates" className="gap-1.5 text-xs"><Calendar className="h-3.5 w-3.5" />Datas</TabsTrigger>
          <TabsTrigger value="gifts" className="gap-1.5 text-xs"><Gift className="h-3.5 w-3.5" />Presentes</TabsTrigger>
          <TabsTrigger value="neuro" className="gap-1.5 text-xs"><Brain className="h-3.5 w-3.5" />Perfil Neuro</TabsTrigger>
          <TabsTrigger value="interactions" className="gap-1.5 text-xs"><MessageSquare className="h-3.5 w-3.5" />Interações</TabsTrigger>
        </TabsList>

        {/* ═══ PROFILE TAB ═══ */}
        <TabsContent value="profile" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Personal Info */}
            <Card className="card-elevated border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gold flex items-center gap-2">
                  <User className="h-4 w-4" /> Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <InfoRow label="Aniversário" value={formatDate(client.birthDate)} />
                <InfoRow label="Ocupação" value={client.occupation} />
                <InfoRow label="CPF" value={client.cpf} />
                <InfoRow label="Cônjuge" value={client.spouseName} />
                <InfoRow label="Aniv. Cônjuge" value={formatDate(client.spouseBirthDate)} />
                <InfoRow label="Casamento" value={formatDate(client.weddingDate)} />
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card className="card-elevated border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gold flex items-center gap-2">
                  <Star className="h-4 w-4" /> Preferências
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <InfoRow label="Hobbies" value={client.hobbies} icon={<Sparkles className="h-3 w-3" />} />
                <InfoRow label="Restaurantes" value={client.favoriteRestaurants} icon={<Utensils className="h-3 w-3" />} />
                <InfoRow label="Viagens" value={client.travelPreferences} icon={<Plane className="h-3 w-3" />} />
                <InfoRow label="Time" value={client.sportTeam} icon={<Trophy className="h-3 w-3" />} />
                <InfoRow label="Música" value={client.musicGenre} icon={<Music className="h-3 w-3" />} />
                <InfoRow label="Livros" value={client.favoriteBooks} icon={<Book className="h-3 w-3" />} />
              </CardContent>
            </Card>
          </div>

          {/* Notes */}
          {client.notes && (
            <Card className="card-elevated border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gold">Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{client.notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ═══ FAMILY TAB ═══ */}
        <TabsContent value="family" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Membros da Família</h3>
            <Dialog open={familyOpen} onOpenChange={setFamilyOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-gold text-black hover:bg-gold-bright gap-1 text-xs">
                  <Plus className="h-3 w-3" /> Adicionar
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader><DialogTitle>Novo Familiar</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Nome" value={familyForm.name} onChange={e => setFamilyForm(f => ({ ...f, name: e.target.value }))} />
                  <Select value={familyForm.relationship} onValueChange={v => setFamilyForm(f => ({ ...f, relationship: v as typeof familyForm.relationship }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["filho", "filha", "conjuge", "pai", "mae", "irmao", "irma", "outro"].map(r => (
                        <SelectItem key={r} value={r}>{getRelationshipLabel(r)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input type="date" value={familyForm.birthDate} onChange={e => setFamilyForm(f => ({ ...f, birthDate: e.target.value }))} />
                  <Button
                    className="w-full bg-gold text-black hover:bg-gold-bright"
                    disabled={!familyForm.name || addFamily.isPending}
                    onClick={() => addFamily.mutate({ clientId, ...familyForm })}
                  >
                    {addFamily.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {family.length > 0 ? (
            <div className="space-y-2">
              {family.map((m: any) => (
                <div key={m.id} className="card-elevated p-3 rounded-lg border border-border flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{getRelationshipLabel(m.relationship)} {m.birthDate ? `· ${formatDate(m.birthDate)}` : ""}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => delFamily.mutate({ id: m.id })}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={Heart} text="Nenhum familiar cadastrado" />
          )}
        </TabsContent>

        {/* ═══ DATES TAB ═══ */}
        <TabsContent value="dates" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Datas Especiais</h3>
            <Dialog open={dateOpen} onOpenChange={setDateOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-gold text-black hover:bg-gold-bright gap-1 text-xs">
                  <Plus className="h-3 w-3" /> Adicionar
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader><DialogTitle>Nova Data Especial</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Título" value={dateForm.title} onChange={e => setDateForm(f => ({ ...f, title: e.target.value }))} />
                  <Input type="date" value={dateForm.date} onChange={e => setDateForm(f => ({ ...f, date: e.target.value }))} />
                  <Select value={dateForm.type} onValueChange={v => setDateForm(f => ({ ...f, type: v as typeof dateForm.type }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["aniversario_cliente", "aniversario_familiar", "casamento", "aniversario_empresa", "outro"].map(t => (
                        <SelectItem key={t} value={t}>{getDateTypeLabel(t)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input placeholder="Nome da pessoa (opcional)" value={dateForm.personName} onChange={e => setDateForm(f => ({ ...f, personName: e.target.value }))} />
                  <Button
                    className="w-full bg-gold text-black hover:bg-gold-bright"
                    disabled={!dateForm.title || !dateForm.date || addDate.isPending}
                    onClick={() => addDate.mutate({ clientId, ...dateForm })}
                  >
                    {addDate.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {dates.length > 0 ? (
            <div className="space-y-2">
              {dates.map((d: any) => {
                const days = getDaysUntil(d.date);
                return (
                  <div key={d.id} className="card-elevated p-3 rounded-lg border border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                        days <= 7 ? "bg-amber-500/15" : "bg-sky-500/15"
                      }`}>
                        <Calendar className={`h-4 w-4 ${days <= 7 ? "text-amber-400" : "text-sky-400"}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{d.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(d.date)} · {getDateTypeLabel(d.type)}
                          {d.personName ? ` · ${d.personName}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-xs ${days <= 7 ? "text-amber-400 border-amber-500/30" : "text-sky-400 border-sky-500/30"}`}>
                        {days === 0 ? "Hoje!" : `${days}d`}
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => delDate.mutate({ id: d.id })}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState icon={Calendar} text="Nenhuma data especial cadastrada" />
          )}
        </TabsContent>

        {/* ═══ GIFTS TAB ═══ */}
        <TabsContent value="gifts" className="mt-4 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-sm font-semibold text-foreground">Histórico de Presentes</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1 text-xs"
                disabled={suggestGifts.isPending}
                onClick={() => suggestGifts.mutate({ clientId })}
              >
                {suggestGifts.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3 text-gold" />}
                Sugerir com IA
              </Button>
              <Dialog open={giftOpen} onOpenChange={setGiftOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-gold text-black hover:bg-gold-bright gap-1 text-xs">
                    <Plus className="h-3 w-3" /> Registrar
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border">
                  <DialogHeader><DialogTitle>Registrar Presente</DialogTitle></DialogHeader>
                  <div className="space-y-3">
                    <Input placeholder="Nome do presente" value={giftForm.giftName} onChange={e => setGiftForm(f => ({ ...f, giftName: e.target.value }))} />
                    <Input placeholder="Categoria (ex: experiência, gastronomia)" value={giftForm.giftCategory} onChange={e => setGiftForm(f => ({ ...f, giftCategory: e.target.value }))} />
                    <Input placeholder="Valor (R$)" value={giftForm.giftValue} onChange={e => setGiftForm(f => ({ ...f, giftValue: e.target.value }))} />
                    <Input placeholder="Ocasião" value={giftForm.occasion} onChange={e => setGiftForm(f => ({ ...f, occasion: e.target.value }))} />
                    <Input type="date" value={giftForm.giftDate} onChange={e => setGiftForm(f => ({ ...f, giftDate: e.target.value }))} />
                    <Select value={giftForm.reaction} onValueChange={v => setGiftForm(f => ({ ...f, reaction: v as typeof giftForm.reaction }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="adorou">😍 Adorou</SelectItem>
                        <SelectItem value="gostou">😊 Gostou</SelectItem>
                        <SelectItem value="neutro">😐 Neutro</SelectItem>
                        <SelectItem value="nao_gostou">😕 Não gostou</SelectItem>
                      </SelectContent>
                    </Select>
                    <Textarea placeholder="Observações" value={giftForm.notes} onChange={e => setGiftForm(f => ({ ...f, notes: e.target.value }))} />
                    <Button
                      className="w-full bg-gold text-black hover:bg-gold-bright"
                      disabled={!giftForm.giftName || addGift.isPending}
                      onClick={() => addGift.mutate({ clientId, ...giftForm })}
                    >
                      {addGift.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* AI Suggestions */}
          {suggestGifts.data?.suggestions && (
            <Card className="card-elevated border-gold/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gold flex items-center gap-2"><Sparkles className="h-4 w-4" /> Sugestões da IA</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {suggestGifts.data.suggestions.map((s: any, i: number) => (
                  <div key={i} className="p-3 rounded-lg bg-muted/30 border border-border">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.category} · {s.priceRange}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{s.justification}</p>
                    <p className="text-xs text-gold mt-1">{s.howToGet}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {gifts.length > 0 ? (
            <div className="space-y-2">
              {gifts.map((g: any) => (
                <div key={g.id} className="card-elevated p-3 rounded-lg border border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-gold/10 flex items-center justify-center">
                      <Gift className="h-4 w-4 text-gold" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{g.giftName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(g.giftDate)}
                        {g.giftCategory ? ` · ${g.giftCategory}` : ""}
                        {g.giftValue ? ` · R$ ${g.giftValue}` : ""}
                        {g.occasion ? ` · ${g.occasion}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {g.reaction && <span className="text-lg">{REACTION_EMOJI[g.reaction] ?? ""}</span>}
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => delGift.mutate({ id: g.id })}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={Gift} text="Nenhum presente registrado" />
          )}
        </TabsContent>

        {/* ═══ NEURO TAB ═══ */}
        <TabsContent value="neuro" className="mt-4 space-y-4">
          {neuro ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="card-elevated border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-gold flex items-center gap-2">
                    <Brain className="h-4 w-4" /> Perfil Neuropsicológico
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <InfoRow label="Perfil Dominante" value={getProfileLabel(neuro.dominantProfile)} />
                  <InfoRow label="Perfil Secundário" value={getProfileLabel(neuro.secondaryProfile)} />
                  <InfoRow label="Motivador Principal" value={neuro.primaryMotivator} />
                  <InfoRow label="Estilo de Decisão" value={neuro.decisionStyle} />
                  <InfoRow label="Comunicação" value={neuro.communicationStyle} />
                  <InfoRow label="Experiência vs Produto" value={neuro.experienceVsProduct} />
                  <InfoRow label="Nível de Luxo" value={neuro.luxuryLevel} />
                </CardContent>
              </Card>

              {(() => {
                const answersObj = neuro.answers as Record<string, string> | null;
                if (!answersObj || Object.keys(answersObj).length === 0) return null;
                return (
                  <Card className="card-elevated border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold text-gold">Respostas do Questionário</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm max-h-64 overflow-y-auto">
                      {Object.entries(answersObj).map(([q, a]) => (
                        <div key={q} className="p-2 rounded bg-muted/30">
                          <p className="text-xs text-muted-foreground">{q}</p>
                          <p className="text-sm text-foreground">{String(a)}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                );
              })()}
            </div>
          ) : (
            <div className="card-elevated flex flex-col items-center justify-center py-12 text-center rounded-xl border border-border">
              <Brain className="h-10 w-10 text-muted-foreground/20 mb-3" />
              <p className="text-sm text-muted-foreground font-medium">Perfil neuropsicológico não preenchido</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Envie o formulário ao cliente para coletar essas informações</p>
              <Button variant="outline" size="sm" className="mt-4 gap-1" onClick={() => setFormLinkOpen(true)}>
                <Send className="h-3 w-3" /> Enviar Formulário
              </Button>
            </div>
          )}
        </TabsContent>

        {/* ═══ INTERACTIONS TAB ═══ */}
        <TabsContent value="interactions" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Histórico de Interações</h3>
            <Dialog open={intOpen} onOpenChange={setIntOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-gold text-black hover:bg-gold-bright gap-1 text-xs">
                  <Plus className="h-3 w-3" /> Registrar
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader><DialogTitle>Nova Interação</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Select value={intForm.type} onValueChange={v => setIntForm(f => ({ ...f, type: v as typeof intForm.type }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["reuniao", "ligacao", "email", "whatsapp", "evento", "presente", "outro"].map(t => (
                        <SelectItem key={t} value={t}>{getInteractionTypeLabel(t)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input type="date" value={intForm.interactionDate} onChange={e => setIntForm(f => ({ ...f, interactionDate: e.target.value }))} />
                  <Input placeholder="Título" value={intForm.title} onChange={e => setIntForm(f => ({ ...f, title: e.target.value }))} />
                  <Textarea placeholder="Descrição (opcional)" value={intForm.description} onChange={e => setIntForm(f => ({ ...f, description: e.target.value }))} />
                  <Button
                    className="w-full bg-gold text-black hover:bg-gold-bright"
                    disabled={!intForm.title || addInt.isPending}
                    onClick={() => addInt.mutate({ clientId, ...intForm })}
                  >
                    {addInt.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {interactions.length > 0 ? (
            <div className="space-y-2">
              {interactions.map((int: any) => (
                <div key={int.id} className="card-elevated p-3 rounded-lg border border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-sky-500/10 flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 text-sky-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{int.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(int.interactionDate)} · {getInteractionTypeLabel(int.type)}
                      </p>
                      {int.description && <p className="text-xs text-muted-foreground/70 mt-0.5">{int.description}</p>}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => delInt.mutate({ id: int.id })}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={MessageSquare} text="Nenhuma interação registrada" />
          )}
        </TabsContent>
      </Tabs>

      {/* Form Link Modal */}
      <ClientFormLinkModal
        clientId={clientId}
        clientName={client.name}
        open={formLinkOpen}
        onClose={() => setFormLinkOpen(false)}
      />
    </div>
  );
}

function InfoRow({ label, value, icon }: { label: string; value: string | null | undefined; icon?: React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between py-1 border-b border-border/30 last:border-0">
      <span className="text-muted-foreground flex items-center gap-1.5">
        {icon}
        {label}
      </span>
      <span className="text-foreground text-right max-w-[60%]">{value}</span>
    </div>
  );
}

function EmptyState({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="card-elevated flex flex-col items-center justify-center py-12 text-center rounded-xl border border-border">
      <Icon className="h-10 w-10 text-muted-foreground/20 mb-3" />
      <p className="text-sm text-muted-foreground font-medium">{text}</p>
    </div>
  );
}
