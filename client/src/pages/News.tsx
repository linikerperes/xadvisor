import { trpc } from "@/lib/trpc";
import { ExternalLink, TrendingUp, Globe, RefreshCw, Loader2, Bitcoin } from "lucide-react";
import { useState, useEffect } from "react";

const CRYPTO_RSS = "https://cryptopanic.com/api/v1/posts/?auth_token=free&public=true&kind=news";
const MACRO_FEEDS = [
  { label: "Valor Econômico", url: "https://rss.app/feeds/valor-economico.xml" },
  { label: "InfoMoney", url: "https://rss.app/feeds/infomoney.xml" },
];

type NewsItem = {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  type: "crypto" | "macro";
  currencies?: string[];
};

function timeAgo(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "agora";
  if (diff < 3600) return `${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

function NewsCard({ item }: { item: NewsItem }) {
  return (
    <a href={item.url} target="_blank" rel="noopener noreferrer"
      className="block p-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground group-hover:text-gold transition-colors line-clamp-2 leading-snug">
            {item.title}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[10px] text-muted-foreground">{item.source}</span>
            <span className="text-[10px] text-muted-foreground">·</span>
            <span className="text-[10px] text-muted-foreground">{timeAgo(item.publishedAt)}</span>
            {item.currencies && item.currencies.map(c => (
              <span key={c} className="text-[10px] bg-gold/10 text-gold px-1.5 py-0.5 rounded">{c}</span>
            ))}
          </div>
        </div>
        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0 mt-0.5 group-hover:text-gold transition-colors" />
      </div>
    </a>
  );
}

export default function News() {
  const [cryptoNews, setCryptoNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const loadNews = async () => {
    setLoading(true);
    try {
      const res = await fetch(CRYPTO_RSS);
      const data = await res.json();
      const items: NewsItem[] = (data.results || []).slice(0, 20).map((n: any) => ({
        title: n.title,
        url: n.url,
        source: n.source?.title || "CryptoPanic",
        publishedAt: n.published_at,
        type: "crypto" as const,
        currencies: n.currencies?.map((c: any) => c.code).slice(0, 3) || [],
      }));
      setCryptoNews(items);
      setLastUpdate(new Date());
    } catch (e) {
      console.error("Erro ao carregar notícias", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
    const interval = setInterval(loadNews, 5 * 60 * 1000); // atualiza a cada 5 min
    return () => clearInterval(interval);
  }, []);

  // Preços cripto via trpc (já tem CoinGecko)
  const { data: stats } = trpc.clients.stats.useQuery();

  const macroLinks = [
    { title: "Boletim Focus - Banco Central", url: "https://www.bcb.gov.br/publicacoes/focus", source: "BCB" },
    { title: "IPCA - IBGE", url: "https://www.ibge.gov.br/explica/inflacao.php", source: "IBGE" },
    { title: "Taxa Selic atual", url: "https://www.bcb.gov.br/controleinflacao/taxaselic", source: "BCB" },
    { title: "Câmbio - USD/BRL", url: "https://www.bcb.gov.br/estabilidadefinanceira/historicocotacoes", source: "BCB" },
    { title: "Bitcoin - CoinGecko", url: "https://www.coingecko.com/pt/moedas/bitcoin", source: "CoinGecko" },
    { title: "Ethereum - CoinGecko", url: "https://www.coingecko.com/pt/moedas/ethereum", source: "CoinGecko" },
    { title: "InfoMoney - Mercados", url: "https://www.infomoney.com.br/mercados/", source: "InfoMoney" },
    { title: "Valor Econômico", url: "https://valor.globo.com/financas/", source: "Valor" },
    { title: "Investing.com - Cripto", url: "https://br.investing.com/crypto/", source: "Investing" },
    { title: "TradingView - BTC", url: "https://www.tradingview.com/symbols/BTCBRL/", source: "TradingView" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
            Notícias & Mercado
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Macroeconomia e criptomoedas em tempo real
            {lastUpdate && <span className="ml-2">· atualizado {timeAgo(lastUpdate.toISOString())}</span>}
          </p>
        </div>
        <button onClick={loadNews} disabled={loading}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-sm px-4 py-2 rounded-lg transition-colors">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Atualizar
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Cripto News */}
        <div className="card-elevated rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center gap-2">
            <Bitcoin className="w-4 h-4 text-gold" />
            <h2 className="text-sm font-bold text-gold" style={{ fontFamily: "var(--font-display)" }}>
              Notícias Cripto
            </h2>
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground ml-auto" />}
          </div>
          {cryptoNews.length === 0 && !loading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Nenhuma notícia disponível no momento
            </div>
          ) : (
            <div>
              {cryptoNews.map((item, i) => <NewsCard key={i} item={item} />)}
            </div>
          )}
        </div>

        {/* Macro links */}
        <div className="space-y-4">
          {/* Links rápidos */}
          <div className="card-elevated rounded-xl overflow-hidden">
            <div className="p-4 border-b border-white/5 flex items-center gap-2">
              <Globe className="w-4 h-4 text-gold" />
              <h2 className="text-sm font-bold text-gold" style={{ fontFamily: "var(--font-display)" }}>
                Fontes Macroeconômicas
              </h2>
            </div>
            <div>
              {macroLinks.map((link, i) => (
                <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 group">
                  <div>
                    <p className="text-sm text-foreground group-hover:text-gold transition-colors">{link.title}</p>
                    <p className="text-[10px] text-muted-foreground">{link.source}</p>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-gold transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* AUM rápido */}
          {stats && (
            <div className="card-elevated gold-border rounded-xl p-4">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Seu AUM (X-Advisor)</p>
              <p className="text-xl font-bold text-gold mono-nums">
                {parseFloat(stats.totalAUM || "0").toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{stats.totalClients} clientes · {stats.activeClients} ativos</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
