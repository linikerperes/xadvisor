import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { trpc } from "@/lib/trpc";
import { useEffect } from "react";

// Onil / Portfólio
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import ClientDetail from "./pages/ClientDetail";
import AIAnalysis from "./pages/AIAnalysis";
import ImportData from "./pages/ImportData";
import SyncOnil from "./pages/SyncOnil";
import Contracts from "./pages/Contracts";
import News from "./pages/News";

// CRM
import CrmDashboard from "./pages/CrmDashboard";
import CrmClientList from "./pages/CrmClientList";
import CrmClientForm from "./pages/CrmClientForm";
import CrmClientDetail from "./pages/CrmClientDetail";
import CrmAlerts from "./pages/CrmAlerts";
import CrmGifts from "./pages/CrmGifts";
import CrmQuestionnaire from "./pages/CrmQuestionnaire";
import CrmReports from "./pages/CrmReports";
import CrmNotifications from "./pages/CrmNotifications";

// Auth / Landing
import Login from "./pages/Login";
import Landing from "./pages/Landing";

import DashboardLayout from "./components/DashboardLayout";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();
  const { data: user, isLoading } = trpc.auth.me.useQuery();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/landing");
    }
  }, [isLoading, user, navigate]);

  if (isLoading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      {/* Páginas públicas */}
      <Route path="/landing" component={Landing} />
      <Route path="/login" component={Login} />

      {/* App protegido */}
      <Route>
        <AuthGuard>
          <DashboardLayout>
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/clientes" component={Clients} />
              <Route path="/cliente/:id" component={ClientDetail} />
              <Route path="/analise-ia" component={AIAnalysis} />
              <Route path="/noticias" component={News} />
              <Route path="/contratos" component={Contracts} />
              <Route path="/importar" component={ImportData} />
              <Route path="/sincronizar" component={SyncOnil} />

              {/* CRM */}
              <Route path="/crm" component={CrmDashboard} />
              <Route path="/crm/clientes" component={CrmClientList} />
              <Route path="/crm/clientes/novo" component={CrmClientForm} />
              <Route path="/crm/clientes/:id/editar" component={CrmClientForm} />
              <Route path="/crm/clientes/:id" component={CrmClientDetail} />
              <Route path="/crm/alertas" component={CrmAlerts} />
              <Route path="/crm/presentes" component={CrmGifts} />
              <Route path="/crm/questionario" component={CrmQuestionnaire} />
              <Route path="/crm/relatorios" component={CrmReports} />
              <Route path="/crm/notificacoes" component={CrmNotifications} />

              <Route path="/404" component={NotFound} />
              <Route component={NotFound} />
            </Switch>
          </DashboardLayout>
        </AuthGuard>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
