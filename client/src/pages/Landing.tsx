import { useState } from "react";
import { useLocation } from "wouter";
import { Shield, TrendingUp, Bell, Users, RefreshCw, ChevronRight, Check, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

const LOGO_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663361146918/vjDNWCRBVbSbAMfa.png";

const features = [
  { icon: RefreshCw, title: "Sync automático com Onil", desc: "Seus dados de clientes e contratos sincronizados com um clique, direto do portal." },
  { icon: Bell, title: "Alertas de vencimento", desc: "Receba alertas 30 dias antes dos contratos vencerem. Nunca perca uma renovação." },
  { icon: TrendingUp, title: "Dashboard completo", desc: "AUM, ticket médio, alocação por ativo e performance — tudo em um lugar." },
  { icon: Users, title: "CRM integrado", desc: "Gerencie relacionamentos, datas especiais, presentes e histórico de cada cliente." },
  { icon: Shield, title: "Notícias em tempo real", desc: "Feed de notícias de cripto e macroeconomia para estar sempre informado." },
  { icon: TrendingUp, title: "Análise com IA", desc: "Insights sobre sua carteira gerados por inteligência artificial." },
];

const plans = [
  {
    key: "starter" as const,
    name: "Starter",
    price: "R$ 197",
    period: "/mês",
    features: ["Até 50 clientes", "Sync automático Onil", "Dashboard completo", "Alertas de vencimento"],
    cta: "Começar grátis",
    highlighted: false,
  },
  {
    key: "pro" as const,
    name: "Pro",
    price: "R$ 497",
    period: "/mês",
    features: ["Clientes ilimitados", "Tudo do Starter", "CRM completo", "Análise com IA", "Notícias em tempo real", "Suporte prioritário"],
    cta: "Assinar Pro",
    highlighted: true,
  },
];

export default function Landing() {
  const [, navigate] = useLocation();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [showEmailModal, setShowEmailModal] = useState<"starter" | "pro" | null>(null);

  const createCheckout = trpc.auth.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
    },
    onError: (err) => {
      alert("Erro ao iniciar pagamento: " + err.message);
      setLoadingPlan(null);
    },
  });

  const handlePlanClick = (plan: "starter" | "pro") => {
    setShowEmailModal(plan);
  };

  const handleCheckout = async () => {
    if (!email || !showEmailModal) return;
    setLoadingPlan(showEmailModal);
    setShowEmailModal(null);
    await createCheckout.mutateAsync({ plan: showEmailModal, email });
    setLoadingPlan(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white"
      style={{ fontFamily: "var(--font-display)" }}>

      {/* Modal de email para checkout */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-1">Qual seu e-mail?</h3>
            <p className="text-sm text-muted-foreground mb-4">Você será redirecionado ao checkout seguro do Stripe.</p>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleCheckout()}
              placeholder="seu@email.com"
              autoFocus
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm mb-4 outline-none focus:border-gold/50"
            />
            <div className="flex gap-2">
              <button onClick={() => setShowEmailModal(null)}
                className="flex-1 border border-white/10 py-2.5 rounded-lg text-sm hover:border-white/20 transition-colors">
                Cancelar
              </button>
              <button onClick={handleCheckout}
                disabled={!email}
                className="flex-1 bg-gold hover:bg-gold/90 text-black font-bold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50">
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-40 border-b border-white/5 bg-[#0a0a0a]/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={LOGO_URL} alt="X-Advisor" className="h-8 w-8 object-contain" />
            <span className="text-xl font-bold text-gold">X-Advisor</span>
          </div>
          <button onClick={() => navigate("/login")}
            className="bg-gold hover:bg-gold/90 text-black font-bold px-5 py-2 rounded-lg text-sm transition-colors">
            Entrar
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 text-center"
        style={{ backgroundImage: "radial-gradient(ellipse at 50% 0%, rgba(212,175,55,0.12) 0%, transparent 60%)" }}>
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 bg-gold rounded-full animate-pulse" />
            <span className="text-xs text-gold font-medium">Plataforma para assessores Onil Group</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">
            Gerencie sua carteira<br />
            <span className="text-gold">como um profissional</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto" style={{ fontFamily: "system-ui" }}>
            Dashboard completo para assessores do Onil Group. Sync automático, alertas de vencimento, CRM e análise com IA.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button onClick={() => handlePlanClick("pro")}
              className="bg-gold hover:bg-gold/90 text-black font-bold px-8 py-3.5 rounded-xl text-base w-full sm:w-auto flex items-center justify-center gap-2 transition-colors">
              Começar grátis — 14 dias
              <ChevronRight className="w-4 h-4" />
            </button>
            <button onClick={() => navigate("/login")}
              className="border border-white/10 hover:border-white/20 text-white px-8 py-3.5 rounded-xl text-base w-full sm:w-auto transition-colors">
              Já tenho conta
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">14 dias grátis · Sem compromisso · Cancele quando quiser</p>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">Tudo que você precisa em um lugar</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div key={i} className="bg-white/3 border border-white/8 rounded-xl p-5 hover:border-gold/20 transition-colors">
                <div className="w-9 h-9 bg-gold/10 rounded-lg flex items-center justify-center mb-3">
                  <f.icon className="w-4.5 h-4.5 text-gold" />
                </div>
                <h3 className="font-bold text-sm mb-1.5">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed" style={{ fontFamily: "system-ui" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-3">Planos simples e transparentes</h2>
          <p className="text-sm text-muted-foreground text-center mb-10" style={{ fontFamily: "system-ui" }}>
            14 dias grátis em qualquer plano. Sem compromisso.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {plans.map((plan) => (
              <div key={plan.name}
                className={`rounded-2xl p-6 border ${plan.highlighted ? "bg-gold/5 border-gold/30" : "bg-white/3 border-white/10"}`}>
                {plan.highlighted && (
                  <span className="text-[10px] bg-gold text-black font-bold px-2.5 py-1 rounded-full mb-3 inline-block">MAIS POPULAR</span>
                )}
                <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-bold text-gold">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm" style={{ fontFamily: "system-ui" }}>
                      <Check className="w-3.5 h-3.5 text-gold shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handlePlanClick(plan.key)}
                  disabled={loadingPlan === plan.key}
                  className={`w-full py-2.5 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2
                    ${plan.highlighted
                      ? "bg-gold hover:bg-gold/90 text-black"
                      : "border border-white/20 hover:border-white/40"
                    } disabled:opacity-60`}>
                  {loadingPlan === plan.key
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Aguarde...</>
                    : plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <img src={LOGO_URL} alt="X-Advisor" className="h-5 w-5 object-contain opacity-50" />
          <span className="text-sm text-muted-foreground">X-Advisor</span>
        </div>
        <p className="text-xs text-muted-foreground">Plataforma independente. Não é afiliado ao Onil Group.</p>
      </footer>
    </div>
  );
}
