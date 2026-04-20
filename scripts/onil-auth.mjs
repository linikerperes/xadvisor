/**
 * Valida credenciais da Onil e retorna dados do assessor.
 * Uso: node scripts/onil-auth.mjs <email> <senha>
 * Saída JSON: { valid, name, company, email, userId } | { error }
 */
import { chromium } from 'playwright';

const [,, email, senha] = process.argv;
if (!email || !senha) {
  process.stdout.write(JSON.stringify({ error: 'Email e senha obrigatórios' }));
  process.exit(1);
}

async function validateOnil(email, senha) {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-blink-features=AutomationControlled'],
  });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  });
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  });

  const page = await context.newPage();

  try {
    await page.goto('https://broker.onilgroup.com.br/login', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(1500);
    await page.fill('input[name="email"]', email);
    await page.fill('input[type="password"]', senha);
    await page.click('button[type="submit"]');

    // Aguarda redirect ou erro
    await Promise.race([
      page.waitForURL('**/dashboard**', { timeout: 10000 }),
      page.waitForSelector('.alert-danger, .alert-error, [class*="error"]', { timeout: 10000 }),
    ]).catch(() => {});

    const url = page.url();
    if (url.includes('/dashboard')) {
      // Extrai dados do assessor do dashboard
      const info = await page.evaluate(() => {
        const text = document.body.innerText;
        const nameMatch = text.match(/Peres Advisor|([A-Z][a-z]+ [A-Z][a-z]+(?:\s[A-Z][a-z]+)*)\s*\n.*assessor/i);
        // Pega nome e empresa do sidebar
        const sidebarText = document.querySelector('.sidebar, nav, header')?.innerText || text;
        return {
          bodyText: text.substring(0, 500),
          url: window.location.href,
        };
      });

      // Extrai nome da empresa e email do conteúdo
      const bodyText = info.bodyText;
      const companyMatch = bodyText.match(/([A-ZÀ-Ú][a-zà-ú]+(?: [A-ZÀ-Ú][a-zà-ú]+)+(?: (?:Ltda|S\.A\.|ME|EIRELI|Investimentos)\.?)?)/);
      const company = companyMatch ? companyMatch[1] : 'Assessor';

      // Pega o nome do usuário do menu
      const userName = await page.$eval(
        '[class*="user"] [class*="name"], .user-name, .advisor-name, header .name',
        el => el.innerText.trim()
      ).catch(() => email.split('@')[0]);

      await browser.close();
      return { valid: true, name: userName, company, email };
    } else {
      await browser.close();
      return { valid: false, error: 'Credenciais inválidas' };
    }
  } catch (e) {
    await browser.close().catch(() => {});
    return { valid: false, error: e.message };
  }
}

validateOnil(email, senha)
  .then(result => process.stdout.write(JSON.stringify(result)))
  .catch(e => process.stdout.write(JSON.stringify({ error: e.message })));
