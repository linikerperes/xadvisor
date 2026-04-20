import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { Bell, Loader2, Save, Mail, MessageSquare, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function CrmNotifications() {
  const { data: settings, isLoading } = trpc.notifications.getSettings.useQuery();
  const updateSettings = trpc.notifications.saveSettings.useMutation({
    onSuccess: () => toast.success("Configurações salvas!"),
    onError: (e: any) => toast.error(e.message),
  });

  const [form, setForm] = useState({
    enabled: true,
    email: "",
    daysAhead: 7,
    sendDays: [1, 2, 3, 4, 5] as number[],
    sendHour: 9,
  });

  useEffect(() => {
    if (settings) {
      setForm({
        enabled: settings.enabled ?? true,
        email: settings.email ?? "",
        daysAhead: settings.daysAhead ?? 7,
        sendDays: settings.sendDays ?? [1, 2, 3, 4, 5],
        sendHour: settings.sendHour ?? 9,
      });
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings.mutate(form);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <p className="text-[10px] text-gold uppercase tracking-widest font-semibold mb-1">CRM</p>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
          <Bell className="h-7 w-7 text-gold" />
          Configurações de Notificação
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Configure como e quando receber alertas sobre datas especiais dos clientes
        </p>
      </div>

      {/* Email Settings */}
      <Card className="card-elevated border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gold flex items-center gap-2">
            <Mail className="h-4 w-4" /> Notificações por E-mail
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Ativar notificações</p>
              <p className="text-xs text-muted-foreground">Receba alertas por e-mail sobre datas especiais</p>
            </div>
            <Switch
              checked={form.enabled}
              onCheckedChange={(v) => setForm(f => ({ ...f, enabled: v }))}
            />
          </div>
          {form.enabled && (
            <div>
              <Label className="text-xs text-muted-foreground">E-mail para alertas</Label>
              <Input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="seu@email.com"
                className="mt-1"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* WhatsApp Settings - Coming Soon */}
      <Card className="card-elevated border-border opacity-60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <MessageSquare className="h-4 w-4" /> Notificações por WhatsApp
            <Badge variant="outline" className="text-xs">Em breve</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Integração com WhatsApp para alertas automáticos está em desenvolvimento.
          </p>
        </CardContent>
      </Card>

      {/* Timing */}
      <Card className="card-elevated border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gold flex items-center gap-2">
            <Clock className="h-4 w-4" /> Antecedência dos Alertas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label className="text-xs text-muted-foreground">Dias de antecedência</Label>
            <Input
              type="number"
              min={1}
              max={90}
              value={form.daysAhead}
              onChange={e => setForm(f => ({ ...f, daysAhead: Number(e.target.value) }))}
              className="mt-1 w-32"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Você será notificado {form.daysAhead} dias antes de cada data especial
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex justify-end pb-8">
        <Button
          className="bg-gold text-black hover:bg-gold-bright gap-2"
          disabled={updateSettings.isPending}
          onClick={handleSave}
        >
          {updateSettings.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
}
