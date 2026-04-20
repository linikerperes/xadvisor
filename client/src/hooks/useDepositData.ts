import { useState, useEffect } from "react";

export interface DepositRecord {
  date: string;
  amount: number;
  type: "deposito" | "saque";
}

export type DepositData = Record<number, DepositRecord[]>;

const STORAGE_KEY = "lp_deposit_data";

export function loadDepositData(): DepositData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

export function saveDepositData(data: DepositData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getClientDeposits(clientId: number): DepositRecord[] {
  const data = loadDepositData();
  return data[clientId] || [];
}

export function getClientCapitalAportado(clientId: number): number {
  const records = getClientDeposits(clientId);
  const totalDep = records.filter(d => d.type === "deposito").reduce((s: number, d: DepositRecord) => s + d.amount, 0);
  const totalSaq = records.filter(d => d.type === "saque").reduce((s: number, d: DepositRecord) => s + d.amount, 0);
  return totalDep - totalSaq;
}

export function getClientTotalDepositos(clientId: number): number {
  const records = getClientDeposits(clientId);
  return records.filter(d => d.type === "deposito").reduce((s: number, d: DepositRecord) => s + d.amount, 0);
}

export function getClientTotalSaques(clientId: number): number {
  const records = getClientDeposits(clientId);
  return records.filter(d => d.type === "saque").reduce((s: number, d: DepositRecord) => s + d.amount, 0);
}

export function getClientRendimento(clientId: number, saldoAtual: number): { valor: number; percentual: number } {
  const capital = getClientCapitalAportado(clientId);
  if (capital <= 0) return { valor: 0, percentual: 0 };
  const valor = saldoAtual - capital;
  const percentual = (valor / capital) * 100;
  return { valor, percentual };
}

export function useDepositData() {
  const [deposits, setDeposits] = useState<DepositData>(loadDepositData);

  useEffect(() => {
    const handleStorage = () => setDeposits(loadDepositData());
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return { deposits, setDeposits };
}
