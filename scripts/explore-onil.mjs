import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const LOGIN = process.env.ONIL_LOGIN;
const SENHA = process.env.ONIL_SENHA;

const SCREENSHOTS_DIR = path.join(process.cwd(), 'scripts', 'onil-screenshots');
fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

async function shot(page, name) {
  const file = path.join(SCREENSHOTS_DIR, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  console.log(`📸 ${name}.png`);
}

async function explore() {
  const browser = await chromium.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-blink-features=AutomationControlled']
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

  const apiRequests = [];
  page.on('response', async res => {
    const url = res.url();
    const ct = res.headers()['content-type'] || '';
    if ((ct.includes('json') || url.includes('/api/')) && !url.includes('analytics')) {
      try {
        const body = await res.json().catch(() => null);
        if (body) apiRequests.push({ url, body });
      } catch (_) {}
    }
  });

  // LOGIN
  console.log('🔐 Fazendo login...');
  await page.goto('https://broker.onilgroup.com.br/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.fill('input[name="email"]', LOGIN);
  await page.fill('input[type="password"]', SENHA);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard**', { timeout: 15000 });
  await page.waitForTimeout(3000);
  console.log('✅ Logado:', page.url());

  // Fechar overlay introjs se existir
  await page.evaluate(() => {
    const overlays = document.querySelectorAll('.introjs-overlay, .introjs-helperLayer, .introjs-tooltipReferenceLayer');
    overlays.forEach(el => el.remove());
    const tooltips = document.querySelectorAll('.introjs-tooltip');
    tooltips.forEach(el => el.remove());
  });
  await page.waitForTimeout(500);

  // IR DIRETO PARA LISTA DE CLIENTES
  console.log('👥 Acessando lista de clientes...');
  await page.goto('https://broker.onilgroup.com.br/management/investors/list/directs', {
    waitUntil: 'domcontentloaded', timeout: 20000
  });
  await page.waitForTimeout(3000);
  await shot(page, '01-lista-clientes');

  const clientesText = await page.evaluate(() => document.body.innerText);
  console.log('📄 Conteúdo da página:\n', clientesText.substring(0, 3000));

  // Capturar tabela de clientes
  const tabela = await page.evaluate(() => {
    const rows = [];
    const tableRows = document.querySelectorAll('table tr, .table tr');
    tableRows.forEach(tr => {
      const cells = Array.from(tr.querySelectorAll('td, th')).map(td => td.innerText.trim());
      if (cells.length > 0) rows.push(cells);
    });
    return rows;
  });
  console.log('📊 Tabela encontrada:', JSON.stringify(tabela.slice(0, 10), null, 2));

  // Ver se há paginação
  const paginacao = await page.$eval('ul.pagination, .pagination', el => el.innerText).catch(() => 'sem paginação');
  console.log('📄 Paginação:', paginacao);

  // Clicar no primeiro cliente para ver detalhes
  const primeiroCliente = await page.$('table tbody tr:first-child td a, table tbody tr:first-child a');
  if (primeiroCliente) {
    await primeiroCliente.click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    console.log('🔍 Página do cliente:', page.url());
    await shot(page, '02-cliente-detalhe');
    const detalhe = await page.evaluate(() => document.body.innerText);
    console.log('📋 Detalhes do cliente:\n', detalhe.substring(0, 3000));
  }

  // Voltar para lista e tentar relatórios
  await page.goto('https://broker.onilgroup.com.br/management/reports', {
    waitUntil: 'domcontentloaded', timeout: 15000
  }).catch(() => {});
  await page.waitForTimeout(2000);
  await shot(page, '03-relatorios');
  const relText = await page.evaluate(() => document.body.innerText);
  console.log('📊 Relatórios:\n', relText.substring(0, 2000));

  // Contratos
  await page.goto('https://broker.onilgroup.com.br/management/contracts/list/directs', {
    waitUntil: 'domcontentloaded', timeout: 15000
  }).catch(() => {});
  await page.waitForTimeout(2000);
  await shot(page, '04-contratos');
  const contText = await page.evaluate(() => document.body.innerText);
  console.log('💼 Contratos:\n', contText.substring(0, 2000));

  // Salvar APIs capturadas
  fs.writeFileSync(
    path.join(SCREENSHOTS_DIR, 'api-calls.json'),
    JSON.stringify(apiRequests, null, 2)
  );
  console.log(`\n🌐 ${apiRequests.length} chamadas de API capturadas`);
  console.log('✅ Exploração concluída! Screenshots em:', SCREENSHOTS_DIR);

  await browser.close();
}

explore().catch(e => { console.error('❌ Erro:', e.message); process.exit(1); });
