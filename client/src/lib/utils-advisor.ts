export function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `R$ ${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `R$ ${(value / 1_000).toFixed(0)}K`;
  }
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatCurrencyFull(value: number | string): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "R$ 0,00";
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function getDaysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [, month, day] = dateStr.split("-").map(Number);
  let target = new Date(today.getFullYear(), (month ?? 1) - 1, day ?? 1);
  if (target < today) target.setFullYear(today.getFullYear() + 1);
  return Math.floor((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  const [year, month, day] = dateStr.split("-");
  if (!year || !month || !day) return dateStr;
  return `${day}/${month}/${year}`;
}

export function formatDateShort(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  const [, month, day] = dateStr.split("-");
  if (!month || !day) return dateStr;
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return `${day} ${months[parseInt(month) - 1]}`;
}

export function getRiskBadgeClass(profile: string | null | undefined): string {
  const map: Record<string, string> = {
    conservador: "risk-conservador",
    moderado: "risk-moderado",
    arrojado: "risk-arrojado",
    agressivo: "risk-agressivo",
  };
  return map[profile ?? ""] ?? "risk-indefinido";
}

export function getRiskLabel(profile: string | null | undefined): string {
  const map: Record<string, string> = {
    conservador: "Conservador",
    moderado: "Moderado",
    arrojado: "Arrojado",
    agressivo: "Agressivo",
    indefinido: "Indefinido",
  };
  return map[profile ?? ""] ?? "Indefinido";
}

export function getProfileLabel(profile: string | null | undefined): string {
  const map: Record<string, string> = {
    dominante: "Dominante (D)",
    influente: "Influente (I)",
    estavel: "Estável (S)",
    cauteloso: "Cauteloso (C)",
  };
  return map[profile ?? ""] ?? "-";
}

export function getDateTypeLabel(type: string): string {
  const map: Record<string, string> = {
    aniversario_cliente: "Aniversário do Cliente",
    aniversario_familiar: "Aniversário Familiar",
    casamento: "Casamento",
    aniversario_empresa: "Aniversário de Empresa",
    outro: "Outro",
  };
  return map[type] ?? type;
}

export function getInteractionTypeLabel(type: string): string {
  const map: Record<string, string> = {
    reuniao: "Reunião",
    ligacao: "Ligação",
    email: "E-mail",
    whatsapp: "WhatsApp",
    evento: "Evento",
    presente: "Presente",
    outro: "Outro",
  };
  return map[type] ?? type;
}

export function getRelationshipLabel(rel: string): string {
  const map: Record<string, string> = {
    filho: "Filho",
    filha: "Filha",
    conjuge: "Cônjuge",
    pai: "Pai",
    mae: "Mãe",
    irmao: "Irmão",
    irma: "Irmã",
    outro: "Outro",
  };
  return map[rel] ?? rel;
}

export function today(): string {
  return new Date().toISOString().split("T")[0] ?? "";
}
