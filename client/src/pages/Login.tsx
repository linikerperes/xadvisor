import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Loader2, Eye, EyeOff, Shield } from "lucide-react";

const LOGO_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663361146918/vjDNWCRBVbSbAMfa.png";

export default function Login() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const login = trpc.auth.loginWithOnil.useMutation({
    onSuccess: () => navigate("/"),
    onError: (err) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    login.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4"
      style={{ backgroundImage: "radial-gradient(ellipse at 50% 0%, rgba(212,175,55,0.08) 0%, transparent 60%)" }}>

      {/* Logo */}
      <div className="flex items-center gap-3 mb-10">
        <img src={LOGO_URL} alt="X-Advisor" className="h-10 w-10 object-contain" />
        <span className="text-2xl font-bold text-gold" style={{ fontFamily: "var(--font-display)", letterSpacing: "0.05em" }}>
          X-Advisor
        </span>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-[#111] border border-white/10 rounded-2xl p-8 shadow-2xl">
        <h1 className="text-xl font-bold text-white mb-1" style={{ fontFamily: "var(--font-display)" }}>
          Entrar na plataforma
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          Use suas credenciais do portal <span className="text-gold">Onil Broker</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Email Onil
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-gold/50 transition-colors"
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Senha Onil
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 pr-10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-gold/50 transition-colors"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-950/50 border border-red-800/50 rounded-lg px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button type="submit" disabled={login.isPending}
            className="w-full bg-gold hover:bg-gold/90 text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors mt-2">
            {login.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Verificando no portal Onil...
              </>
            ) : "Entrar"}
          </button>
        </form>

        <div className="flex items-center gap-2 mt-6 text-xs text-muted-foreground">
          <Shield className="w-3.5 h-3.5 text-gold/50" />
          <span>Suas credenciais são validadas diretamente no portal Onil. Nunca armazenamos sua senha em texto puro.</span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-6">
        Não tem acesso? Entre em contato com o administrador.
      </p>
    </div>
  );
}
