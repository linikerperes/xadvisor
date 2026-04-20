#!/usr/bin/env python3
"""
Script de Extração Automatizada — Portal Onil Group
====================================================
Gera um CSV compatível com a página "Sincronizar Onil" do LP Advisor Dashboard.

Uso:
  python3 scripts/extract_onil_data.py <input_json_or_csv> <output_csv>

O script aceita dois formatos de entrada:
  1. JSON bruto extraído via browser automation (array de objetos)
  2. CSV existente (como o clientes_onil_final.csv)

O output é um CSV limpo com as colunas exatas esperadas pelo endpoint de importação.
"""

import sys
import csv
import json
import os

# Mapeamento de colunas do CSV da Onil para o formato do dashboard
ONIL_CSV_MAP = {
    "ID": "id",
    "Nome": "nome",
    "Email": "email",
    "Telefone": "telefone",
    "Nascimento": "nascimento",
    "Registrado": "registro",
    "Status": "status",
    "Saldo_Total_BRL": "totalBRL",
    "Carteira_BRL": "walletBRL",
    "Carteira_USDT": "walletUSDT",
    "Carteira_BTC": "walletBTC",
    "Carteira_ETH": "walletETH",
    "Seguranca_Onil_BRL": "securityBRL",
    "Especialista_Onil_BRL": "expertBRL",
    "Onil_SEC_BRL": "secBRL",
    "Onil_EXP_BRL": "expBRL",
    "Seguranca_Onil_USDT": "securityUSDT",
    "Especialista_Onil_USDT": "expertUSDT",
    "Onil_SEC_USDT": "secUSDT",
    "Onil_EXP_USDT": "expUSDT",
    "Seguranca_Onil_BTC": "securityBTC",
    "Onil_SEC_BTC": "secBTC",
    "Seguranca_Onil_ETH": "securityETH",
    "Onil_SEC_ETH": "secETH",
}

# Colunas de saída no formato esperado pelo dashboard
OUTPUT_COLUMNS = [
    "id", "nome", "email", "telefone", "nascimento", "registro", "status",
    "totalBRL", "walletBRL", "walletUSDT", "walletBTC", "walletETH",
    "securityBRL", "expertBRL", "secBRL", "expBRL",
    "securityUSDT", "expertUSDT", "secUSDT", "expUSDT",
    "securityBTC", "secBTC", "securityETH", "secETH",
]

NUMERIC_COLS = [
    "totalBRL", "walletBRL", "walletUSDT", "walletBTC", "walletETH",
    "securityBRL", "expertBRL", "secBRL", "expBRL",
    "securityUSDT", "expertUSDT", "secUSDT", "expUSDT",
    "securityBTC", "secBTC", "securityETH", "secETH",
]


def parse_number(val):
    """Converte string numérica brasileira para float."""
    if not val or val.strip() == "":
        return "0"
    val = val.strip().replace('"', '')
    # Se tem vírgula como decimal (formato BR)
    if "," in val and "." in val:
        val = val.replace(".", "").replace(",", ".")
    elif "," in val:
        val = val.replace(",", ".")
    try:
        return str(float(val))
    except ValueError:
        return "0"


def process_csv_input(input_path):
    """Processa CSV no formato Onil e retorna lista de dicts."""
    clients = []
    with open(input_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            client = {}
            for onil_col, dash_col in ONIL_CSV_MAP.items():
                val = row.get(onil_col, "")
                if dash_col in NUMERIC_COLS:
                    val = parse_number(val)
                client[dash_col] = val or ""
            # Preencher colunas faltantes
            for col in OUTPUT_COLUMNS:
                if col not in client:
                    client[col] = "0" if col in NUMERIC_COLS else ""
            clients.append(client)
    return clients


def process_json_input(input_path):
    """Processa JSON bruto e retorna lista de dicts."""
    with open(input_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    if not isinstance(data, list):
        data = [data]
    
    clients = []
    for item in data:
        client = {}
        # Tenta mapear campos comuns
        client["id"] = str(item.get("id", item.get("externalId", "")))
        client["nome"] = item.get("name", item.get("nome", ""))
        client["email"] = item.get("email", "")
        client["telefone"] = item.get("phone", item.get("telefone", ""))
        client["nascimento"] = item.get("birthDate", item.get("nascimento", ""))
        client["registro"] = item.get("registered", item.get("registro", ""))
        client["status"] = item.get("status", "Ativado")
        
        for col in NUMERIC_COLS:
            val = item.get(col, "0")
            client[col] = parse_number(str(val))
        
        clients.append(client)
    return clients


def write_output(clients, output_path):
    """Escreve o CSV de saída no formato do dashboard."""
    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=OUTPUT_COLUMNS, delimiter=";")
        writer.writeheader()
        for client in clients:
            row = {col: client.get(col, "0" if col in NUMERIC_COLS else "") for col in OUTPUT_COLUMNS}
            writer.writerow(row)


def main():
    if len(sys.argv) < 3:
        print("Uso: python3 extract_onil_data.py <input_json_or_csv> <output_csv>")
        print()
        print("Exemplos:")
        print("  python3 extract_onil_data.py clientes_onil_final.csv clientes_dashboard.csv")
        print("  python3 extract_onil_data.py clientes_raw.json clientes_dashboard.csv")
        sys.exit(1)

    input_path = sys.argv[1]
    output_path = sys.argv[2]

    if not os.path.exists(input_path):
        print(f"Erro: arquivo '{input_path}' não encontrado.")
        sys.exit(1)

    # Detectar formato
    ext = os.path.splitext(input_path)[1].lower()
    if ext == ".json":
        clients = process_json_input(input_path)
    else:
        clients = process_csv_input(input_path)

    write_output(clients, output_path)

    # Resumo
    total_aum = sum(float(c.get("totalBRL", "0")) for c in clients)
    active = sum(1 for c in clients if c.get("status", "").lower() != "inativo")
    
    print(f"✅ Extração concluída!")
    print(f"   Clientes: {len(clients)} ({active} ativos)")
    print(f"   AUM Total: R$ {total_aum:,.2f}")
    print(f"   Arquivo: {output_path}")
    print(f"   Formato: CSV com separador ';' — pronto para importar no dashboard")


if __name__ == "__main__":
    main()
