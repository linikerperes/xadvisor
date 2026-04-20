import { useState, useEffect } from "react";

interface CryptoPrices {
  BTC: number;
  ETH: number;
  USDT: number;
  loading: boolean;
  lastUpdate: Date | null;
}

export function useCryptoPrices(): CryptoPrices {
  const [prices, setPrices] = useState<CryptoPrices>({
    BTC: 0,
    ETH: 0,
    USDT: 5.20,
    loading: true,
    lastUpdate: null,
  });

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether&vs_currencies=brl"
        );
        const data = await res.json();
        setPrices({
          BTC: data.bitcoin?.brl || 0,
          ETH: data.ethereum?.brl || 0,
          USDT: data.tether?.brl || 5.20,
          loading: false,
          lastUpdate: new Date(),
        });
      } catch {
        setPrices(prev => ({ ...prev, loading: false }));
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  return prices;
}
