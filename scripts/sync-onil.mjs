/**
 * Scraper do portal Onil Group.
 * Extrai todos os clientes com saldos e contratos.
 * Saída: JSON para stdout → consumido pelo endpoint /api/sync/onil
 */
import { chromium } from 'playwright';

const LOGIN = process.env.ONIL_LOGIN;
const SENHA = process.env.ONIL_SENHA;

if (!LOGIN || !SENHA) {
  console.error(JSON.stringify({ error: 'ONIL_LOGIN e ONIL_SENHA são obrigatórios' }));
  process.exit(1);
}

function parseBRL(str) {
  if (!str) return '0';
  return str.replace(/\./g, '').replace(',', '.').trim() || '0';
}

function parseNum(str) {
  if (!str) return '0';
  return str.trim() || '0';
}

function extractContracts(text) {
  const get = (label) => {
    const m = text.match(new RegExp(label + '[:\\s]+([\\d.,]+)'));
    return m ? m[1] : '0';
  };
  return {
    securityBRL: parseBRL(get('Onil Perfil Security BRL')),
    expertBRL:   parseBRL(get('Onil Perfil Expert BRL')),
    secBRL:      parseBRL(get('Onil Perfil SEC BRL')),
    expBRL:      parseBRL(get('Onil Perfil EXP BRL')),
    securityUSDT: parseNum(get('Onil Perfil Security USDT')),
    expertUSDT:   parseNum(get('Onil Perfil Expert USDT')),
    secUSDT:      parseNum(get('Onil Perfil SEC USDT')),
    expUSDT:      parseNum(get('Onil Perfil EXP USDT')),
    securityBTC: parseNum(get('Onil Perfil Security BTC')),
    secBTC:      parseNum(get('Onil Perfil SEC BTC')),
    securityETH: parseNum(get('Onil Perfil Security ETH')),
    secETH:      parseNum(get('Onil Perfil SEC ETH')),
    totalBRL:    parseBRL(get('Total convertido para BRL')),
  };
}

function extractWallets(text) {
  const get = (label) => {
    const m = text.match(new RegExp(label + '[:\\s]+([\\d.,]+)'));
    return m ? m[1] : '0';
  };
  return {
    walletBRL:  parseBRL(get('Carteira BRL')),
    walletUSDT: parseNum(get('Carteira USDT')),
    walletBTC:  parseNum(get('Carteira BTC')),
    walletETH:  parseNum(get('Carteira ETH')),
  };
}

function parseNameCell(cell) {
  const lines = cell.split('\n').map(l => l.trim()).filter(Boolean);
  let name = lines[0] || '';
  let cpf = null;

  // Remove CPF prefix se existir (ex: "60.409.738 Bruno Lima")
  const cpfMatch = name.match(/^(\d{2,3}\.\d{3}\.\d{3})\s+(.+)/);
  if (cpfMatch) {
    cpf = cpfMatch[1];
    name = cpfMatch[2];
  }

  const email = lines.find(l => l.includes('@')) || null;
  const phone = lines.find(l => l.match(/^\+\d/)) || null;
  const birthDate = lines.find(l => l.match(/^\d{2}\/\d{2}\/\d{4}$/)) || null;

  return { name, cpf, email, phone, birthDate };
}

function parseContractRow(cells) {
  // cells: [DETALHES, CLIENTE, MOEDA, TIPO, VALOR, STATUS]
  const detalhes = cells[0] || '';
  const clienteCell = cells[1] || '';
  const moeda = (cells[2] || '').trim();
  const tipoCell = cells[3] || '';
  const valorCell = cells[4] || '';
  const status = (cells[5] || 'Em andamento').trim();

  // ID do contrato: "#300149\n13/04/2026..."
  const idMatch = detalhes.match(/#(\d+)/);
  if (!idMatch) return null;
  const onilContractId = parseInt(idMatch[1]);

  // Data de início
  const dateMatch = detalhes.match(/(\d{2}\/\d{2}\/\d{4})/);
  const startDate = dateMatch ? dateMatch[1] : '';

  // Cliente: nome\nemail\nCliente
  const clientLines = clienteCell.split('\n').map(l => l.trim()).filter(Boolean);
  const clientName = clientLines[0] || '';
  const clientEmail = clientLines.find(l => l.includes('@')) || '';
  // ID do cliente – pode estar em link href /management/investor/show/ID
  const clientIdMatch = clienteCell.match(/\/(\d{4,6})/);
  const clientExternalId = clientIdMatch ? parseInt(clientIdMatch[1]) : 0;

  // Tipo e dias: "Onil Perfil SEC (30 dias)\n7/30 DIAS\nCarência..."
  const tipoLines = tipoCell.split('\n').map(l => l.trim()).filter(Boolean);
  const contractType = tipoLines[0] || '';
  const diasMatch = tipoCell.match(/(\d+)\/(\d+)\s*DIAS/i);
  const daysElapsed = diasMatch ? parseInt(diasMatch[1]) : 0;
  const totalDays = diasMatch ? parseInt(diasMatch[2]) : 0;

  // Valor: "5,740.54 USDT" ou "1.743,85 BRL" ou "0.01030571 BTC"
  const valorRaw = valorCell.replace(/[^\d.,]/g, '').trim();
  const value = valorRaw.replace(/\./g, '').replace(',', '.') || '0';

  const currency = moeda || (valorCell.includes('BRL') ? 'BRL' :
    valorCell.includes('USDT') ? 'USDT' :
    valorCell.includes('BTC') ? 'BTC' : 'ETH');

  return { onilContractId, clientExternalId, clientName, clientEmail, currency, contractType, totalDays, daysElapsed, value, startDate, status };
}

async function scrapeContracts(page) {
  process.stderr.write('📋 Extraindo contratos...\n');
  await page.goto('https://broker.onilgroup.com.br/management/contracts/list/directs', {
    waitUntil: 'domcontentloaded', timeout: 20000,
  });
  await page.waitForTimeout(2000);

  // Mudar para 50 por página se possível
  try {
    await page.selectOption('select[name*="length"], select.form-select', '50');
    await page.waitForTimeout(1500);
  } catch (_) {}

  let allContracts = [];
  let currentPage = 1;
  let totalPages = 1;

  try {
    const pageLinks = await page.$$eval('ul.pagination li a, .pagination li a', els =>
      els.map(el => el.innerText.trim()).filter(t => /^\d+$/.test(t)).map(Number)
    );
    if (pageLinks.length > 0) totalPages = Math.max(...pageLinks);
  } catch (_) {}

  process.stderr.write(`  📄 Páginas de contratos: ${totalPages}\n`);

  for (let p = 1; p <= totalPages; p++) {
    if (p > 1) {
      try {
        await page.click(`ul.pagination li a:text("${p}"), .pagination li a:text("${p}")`);
        await page.waitForTimeout(1500);
      } catch (_) {
        const url = new URL(page.url());
        url.searchParams.set('page', String(p));
        await page.goto(url.toString(), { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForTimeout(1500);
      }
    }

    const rows = await page.evaluate(() => {
      const result = [];
      document.querySelectorAll('table tbody tr').forEach(tr => {
        const cells = Array.from(tr.querySelectorAll('td')).map(td => td.innerText.trim());
        if (cells.length >= 5) result.push(cells);
      });
      return result;
    });

    // Tentar extrair clientExternalId dos links
    const rowsWithLinks = await page.evaluate(() => {
      const result = [];
      document.querySelectorAll('table tbody tr').forEach(tr => {
        const cells = Array.from(tr.querySelectorAll('td')).map(td => ({
          text: td.innerText.trim(),
          links: Array.from(td.querySelectorAll('a')).map(a => a.href),
        }));
        if (cells.length >= 5) result.push(cells);
      });
      return result;
    });

    for (let i = 0; i < rows.length; i++) {
      const cells = rows[i];
      const cellsWithLinks = rowsWithLinks[i] || [];
      // Try to get client ID from link in client cell
      const clientLinks = cellsWithLinks[1]?.links || [];
      const clientIdFromLink = clientLinks.map(l => l.match(/\/(\d{4,6})$/)?.[1]).find(Boolean);

      const contract = parseContractRow(cells);
      if (!contract) continue;
      if (clientIdFromLink) contract.clientExternalId = parseInt(clientIdFromLink);
      allContracts.push(contract);
    }

    process.stderr.write(`  ✓ ${allContracts.length} contratos extraídos até agora\n`);
  }

  return allContracts;
}

async function scrapeClients() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-blink-features=AutomationControlled'],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    locale: 'pt-BR',
  });
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  });

  const page = await context.newPage();

  // Login
  process.stderr.write('🔐 Fazendo login...\n');
  await page.goto('https://broker.onilgroup.com.br/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
  // Aguarda Cloudflare passar e o formulário aparecer
  await page.waitForFunction(
    () => !document.title.includes('momento') && !document.title.includes('Just a moment'),
    { timeout: 30000 }
  ).catch(() => {});
  await page.waitForSelector('input[name="email"]', { timeout: 30000 });
  await page.fill('input[name="email"]', LOGIN);
  await page.fill('input[type="password"]', SENHA);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard**', { timeout: 15000 });
  await page.waitForTimeout(2000);
  process.stderr.write('✅ Logado\n');

  const clients = [];
  let currentPage = 1;
  let totalPages = 1;

  // Navegar para lista de clientes
  await page.goto('https://broker.onilgroup.com.br/management/investors/list/directs', {
    waitUntil: 'domcontentloaded', timeout: 20000,
  });
  await page.waitForTimeout(2000);

  // Descobrir total de páginas
  try {
    const pageLinks = await page.$$eval('ul.pagination li a, .pagination li a', els =>
      els.map(el => el.innerText.trim()).filter(t => /^\d+$/.test(t)).map(Number)
    );
    if (pageLinks.length > 0) totalPages = Math.max(...pageLinks);
  } catch (_) {}

  process.stderr.write(`📄 Total de páginas: ${totalPages}\n`);

  for (let p = 1; p <= totalPages; p++) {
    if (p > 1) {
      // Clicar na página
      try {
        await page.click(`ul.pagination li a:text("${p}"), .pagination li a:text("${p}")`);
        await page.waitForTimeout(2000);
      } catch (_) {
        // Tentar via query param
        const url = new URL(page.url());
        url.searchParams.set('page', String(p));
        await page.goto(url.toString(), { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForTimeout(2000);
      }
    }

    process.stderr.write(`👥 Extraindo página ${p}/${totalPages}...\n`);

    // Extrair linhas da tabela (apenas linhas com 9 células = desktop rows)
    const rows = await page.evaluate(() => {
      const result = [];
      const tableRows = document.querySelectorAll('table tbody tr');
      tableRows.forEach(tr => {
        const cells = Array.from(tr.querySelectorAll('td')).map(td => td.innerText.trim());
        if (cells.length >= 8) result.push(cells);
      });
      return result;
    });

    for (const cells of rows) {
      // cells: [checkbox, ID, REGISTRADO, NOME, SALDOS, CONTRATOS, VERIFICAÇÕES, STATUS, ACTIONS]
      const idRaw = cells[1]?.trim();
      if (!idRaw || !/^\d+$/.test(idRaw)) continue;

      const externalId = parseInt(idRaw);
      const registered = cells[2]?.trim() || null;
      const nameCell = cells[3] || '';
      const saldosCell = cells[4] || '';
      const contratosCell = cells[5] || '';
      const statusRaw = cells[7]?.trim() || 'Ativado';
      const status = statusRaw === 'Ativado' ? 'Ativado' : 'Inativo';

      const { name, cpf, email, phone, birthDate } = parseNameCell(nameCell);
      const wallets = extractWallets(saldosCell);
      const contracts = extractContracts(contratosCell);

      clients.push({
        externalId,
        name,
        email,
        phone,
        birthDate,
        registered,
        status,
        ...wallets,
        ...contracts,
      });
    }

    process.stderr.write(`  ✓ ${clients.length} clientes extraídos até agora\n`);
  }

  // Extrair contratos
  const contracts = await scrapeContracts(page);

  await browser.close();
  process.stderr.write(`✅ Extração concluída: ${clients.length} clientes, ${contracts.length} contratos\n`);

  process.stdout.write(JSON.stringify({ clients, contracts }));
}

scrapeClients().catch(e => {
  process.stdout.write(JSON.stringify({ error: e.message }));
  process.exit(1);
});
