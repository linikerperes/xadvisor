/*
 * Design: "Black Vault" — Dark Luxury / Fintech Premium
 * Sidebar fixa à esquerda com navegação vertical
 * Logo LP dourado + nome do assessor
 * Seções: Portfólio (Onil) e CRM
 */
import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Users, Menu, X, TrendingUp, Brain, Upload, RefreshCw,
  Bell, Gift, ClipboardList, BarChart2, Mail, ChevronDown, ChevronRight,
  Briefcase, FileText, Newspaper
} from "lucide-react";

const LOGO_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663361146918/vjDNWCRBVbSbAMfa.png";

const onilNavItems = [
  { href: "/", label: "Painel Onil", icon: LayoutDashboard },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/analise-ia", label: "Análise IA", icon: Brain },
  { href: "/importar", label: "Importar Dados", icon: Upload },
  { href: "/noticias", label: "Notícias", icon: Newspaper },
  { href: "/contratos", label: "Contratos", icon: FileText },
  { href: "/sincronizar", label: "Sincronizar Onil", icon: RefreshCw },
];

const crmNavItems = [
  { href: "/crm", label: "Painel CRM", icon: LayoutDashboard },
  { href: "/crm/clientes", label: "Clientes CRM", icon: Users },
  { href: "/crm/alertas", label: "Alertas de Datas", icon: Bell },
  { href: "/crm/presentes", label: "Presentes", icon: Gift },
  { href: "/crm/questionario", label: "Perfil DISC", icon: ClipboardList },
  { href: "/crm/relatorios", label: "Relatórios", icon: BarChart2 },
  { href: "/crm/notificacoes", label: "Notificações", icon: Mail },
];

function NavSection({
  label,
  items,
  location,
  onItemClick,
}: {
  label: string;
  items: typeof onilNavItems;
  location: string;
  onItemClick?: () => void;
}) {
  const isActiveSection = items.some((i) => {
    if (i.href === "/") return location === "/";
    if (i.href === "/crm") return location === "/crm";
    return location.startsWith(i.href);
  });
  const [open, setOpen] = useState(isActiveSection || label === "Portfólio");

  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-1.5 rounded text-[10px] font-semibold uppercase tracking-widest text-muted-foreground hover:text-gold-dim transition-colors"
      >
        <span>{label}</span>
        {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
      </button>
      {open && (
        <div className="space-y-0.5 mt-0.5">
          {items.map((item) => {
            const active =
              item.href === "/"
                ? location === "/"
                : item.href === "/crm"
                ? location === "/crm"
                : location.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <div
                  onClick={onItemClick}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                    active
                      ? "bg-sidebar-accent text-gold gold-glow"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-gold-dim"
                  }`}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = ({ onItemClick }: { onItemClick?: () => void }) => (
    <>
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <img src={LOGO_URL} alt="LP" className="w-10 h-10 rounded-lg" />
          <div>
            <h1 className="text-sm font-bold text-gold" style={{ fontFamily: "var(--font-display)" }}>
              Líniker Peres
            </h1>
            <p className="text-[11px] text-muted-foreground">Assessor de Investimentos</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <NavSection
          label="Portfólio"
          items={onilNavItems}
          location={location}
          onItemClick={onItemClick}
        />
        <div className="border-t border-sidebar-border my-3" />
        <NavSection
          label="CRM"
          items={crmNavItems}
          location={location}
          onItemClick={onItemClick}
        />
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <TrendingUp className="w-3 h-3 text-gold" />
          <span>ANCORD AI | CCA</span>
        </div>
        <p className="text-[10px] text-muted-foreground/50 mt-1">Peres Advisor Investimentos Ltda</p>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-sidebar border-r border-sidebar-border shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
            <div className="p-6 border-b border-sidebar-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={LOGO_URL} alt="LP" className="w-10 h-10 rounded-lg" />
                <div>
                  <h1 className="text-sm font-bold text-gold" style={{ fontFamily: "var(--font-display)" }}>
                    Líniker Peres
                  </h1>
                  <p className="text-[11px] text-muted-foreground">Assessor de Investimentos</p>
                </div>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              <NavSection
                label="Portfólio"
                items={onilNavItems}
                location={location}
                onItemClick={() => setMobileOpen(false)}
              />
              <div className="border-t border-sidebar-border my-3" />
              <NavSection
                label="CRM"
                items={crmNavItems}
                location={location}
                onItemClick={() => setMobileOpen(false)}
              />
            </nav>
            <div className="p-4 border-t border-sidebar-border">
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <TrendingUp className="w-3 h-3 text-gold" />
                <span>ANCORD AI | CCA</span>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-card">
          <button onClick={() => setMobileOpen(true)} className="text-foreground">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <img src={LOGO_URL} alt="LP" className="w-7 h-7 rounded" />
            <span className="text-sm font-bold text-gold" style={{ fontFamily: "var(--font-display)" }}>LP Dashboard</span>
          </div>
          <div className="w-5" />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
