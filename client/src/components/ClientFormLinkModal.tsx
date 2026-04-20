import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Copy, Link2, CheckCircle, Trash2, Clock, Loader2, ExternalLink, Scissors } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Props {
  clientId: number;
  clientName: string;
  open: boolean;
  onClose: () => void;
}

export default function ClientFormLinkModal({ clientId, clientName, open, onClose }: Props) {
  const [expiresInDays, setExpiresInDays] = useState("30");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [shortLinks, setShortLinks] = useState<Record<number, string>>({});
  const [shorteningId, setShorteningId] = useState<number | null>(null);

  const utils = trpc.useUtils();

  const { data: tokens, isLoading } = trpc.clientForm.listTokens.useQuery(
    { clientId },
    { enabled: open }
  );

  const shortenMutation = trpc.utils.shortenLink.useMutation({
    onSuccess: (data, variables) => {
      // Find token id from the url
      const tokenId = (variables as any)._tokenId as number;
      const shortUrl = `${window.location.origin}${data.shortUrl}`;
      setShortLinks(prev => ({ ...prev, [tokenId]: shortUrl }));
      navigator.clipboard.writeText(shortUrl);
      toast.success("Link encurtado copiado!");
      setShorteningId(null);
    },
    onError: () => { toast.error("Erro ao encurtar link"); setShorteningId(null); },
  });

  const generateMutation = trpc.clientForm.generate.useMutation({
    onSuccess: () => {
      utils.clientForm.listTokens.invalidate({ clientId });
      toast.success("Link gerado com sucesso!");
    },
    onError: (e) => toast.error(e.message),
  });

  const revokeMutation = trpc.clientForm.revokeToken.useMutation({
    onSuccess: () => {
      utils.clientForm.listTokens.invalidate({ clientId });
      toast.success("Link removido");
    },
  });

  const getFormUrl = (token: string) =>
    `${window.location.origin}/form/${token}`;

  const copyLink = async (token: string, id: number) => {
    await navigator.clipboard.writeText(getFormUrl(token));
    setCopiedId(id);
    toast.success("Link copiado!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const statusBadge = (status: string, expiresAt: Date | null) => {
    if (status === "completed") return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 border text-xs">Preenchido</Badge>;
    if (status === "expired") return <Badge className="bg-red-500/20 text-red-400 border-red-500/30 border text-xs">Expirado</Badge>;
    if (expiresAt && new Date() > expiresAt) return <Badge className="bg-red-500/20 text-red-400 border-red-500/30 border text-xs">Expirado</Badge>;
    return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 border text-xs">Aguardando</Badge>;
  };

  const pendingTokens = tokens?.filter((t) => t.status === "pending") ?? [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Link2 className="h-5 w-5 text-primary" />
            Link de Formulário — {clientName}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Gere um link único para enviar ao cliente. Ele preenche o questionário e você vê os resultados no dashboard.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Gerar novo link */}
          <div className="bg-accent/30 rounded-xl p-4 border border-border space-y-3">
            <p className="text-sm font-medium text-foreground">Gerar novo link</p>
            <div className="flex gap-2">
              <Select value={expiresInDays} onValueChange={setExpiresInDays}>
                <SelectTrigger className="bg-card border-border flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Expira em 7 dias</SelectItem>
                  <SelectItem value="15">Expira em 15 dias</SelectItem>
                  <SelectItem value="30">Expira em 30 dias</SelectItem>
                  <SelectItem value="60">Expira em 60 dias</SelectItem>
                  <SelectItem value="90">Expira em 90 dias</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() => generateMutation.mutate({ clientId, expiresInDays: parseInt(expiresInDays) })}
                disabled={generateMutation.isPending}
                className="gap-2 shrink-0"
              >
                {generateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
                Gerar
              </Button>
            </div>
          </div>

          {/* Lista de links */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Links gerados ({tokens?.length ?? 0})
            </p>
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : tokens && tokens.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {tokens.map((t) => {
                  const url = getFormUrl(t.token);
                  const isActive = t.status === "pending" && (!t.expiresAt || new Date() <= t.expiresAt);
                  return (
                    <div key={t.id} className="bg-background border border-border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        {statusBadge(t.status, t.expiresAt)}
                        <div className="flex items-center gap-1 ml-auto">
                          {isActive && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => copyLink(t.token, t.id)}
                                title="Copiar link"
                              >
                                {copiedId === t.id ? (
                                  <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => window.open(url, "_blank")}
                                title="Abrir link"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => revokeMutation.mutate({ id: t.id })}
                            title="Remover link"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs font-mono text-muted-foreground truncate bg-muted/30 px-2 py-1 rounded">
                        {url}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>
                          Criado em {new Date(t.createdAt).toLocaleDateString("pt-BR")}
                          {t.expiresAt && ` · Expira em ${new Date(t.expiresAt).toLocaleDateString("pt-BR")}`}
                          {t.completedAt && ` · Preenchido em ${new Date(t.completedAt).toLocaleDateString("pt-BR")}`}
                        </span>
                      </div>
                      {isActive && (
                        <div className="flex gap-2 mt-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 gap-2 text-xs"
                            onClick={() => copyLink(t.token, t.id)}
                          >
                            <Copy className="h-3 w-3" />
                            Copiar link
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 gap-2 text-xs border-primary/30 text-primary hover:bg-primary/10"
                            disabled={shorteningId === t.id}
                            onClick={() => {
                              if (shortLinks[t.id]) {
                                navigator.clipboard.writeText(shortLinks[t.id]!);
                                toast.success("Link curto copiado!");
                                return;
                              }
                              setShorteningId(t.id);
                              (shortenMutation.mutate as any)({ url: getFormUrl(t.token), clientId, _tokenId: t.id });
                            }}
                          >
                            {shorteningId === t.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Scissors className="h-3 w-3" />
                            )}
                            {shortLinks[t.id] ? "Copiar link curto" : "Encurtar link"}
                          </Button>
                        </div>
                      )}
                      {shortLinks[t.id] && (
                        <p className="text-xs font-mono text-primary truncate bg-primary/10 px-2 py-1 rounded mt-1">
                          {shortLinks[t.id]}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-sm text-muted-foreground">
                Nenhum link gerado ainda. Clique em "Gerar" para criar o primeiro.
              </div>
            )}
          </div>

          {pendingTokens.length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-xs text-amber-400">
              <strong>Dica:</strong> Copie o link e envie via WhatsApp ou e-mail para o cliente. Quando ele preencher, o perfil será atualizado automaticamente no seu dashboard.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
