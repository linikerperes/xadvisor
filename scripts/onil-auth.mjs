/**
 * Valida credenciais da Onil e retorna dados do assessor.
 * Uso: node scripts/onil-auth.mjs <email> <senha>
 * Saída JSON: { valid, name, company, email } | { error }
 */
import { chromium } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

chromium.use(StealthPlugin());

const [,, email, senha] = process.argv;
if (!email || !senha) {
  process.stdout.write(JSON.stringify({ error: 'Email e senha obrigatórios' }));
  process.exit(1);
}

const RECAPTCHA_SITEKEY = '6LfvZl4jAAAAAOLgcDuRZ612EvzZHNE0UgKaYKyT';

async function validateOnil(email, senha) {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox'],
  });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
  });

  const page = await context.newPage();

  try {
    await page.goto('https://broker.onilgroup.com.br/login', { waitUntil: 'networkidle', timeout: 40000 });

    // Aguarda o Cloudflare challenge passar (se houver)
    await page.waitForFunction(
      () => !document.title.includes('momento') && !document.title.includes('Just a moment'),
      { timeout: 20000 }
    ).catch(() => {});

    await page.waitForTimeout(2000);

    // Preenche os campos
    await page.fill('input[name="email"]', email);
    await page.waitForTimeout(400);
    await page.fill('input[type="password"]', senha);
    await page.waitForTimeout(400);

    // Executa reCAPTCHA v3 e injeta token
    const recaptchaToken = await page.evaluate(async (sitekey) => {
      try {
        if (typeof window.grecaptcha !== 'undefined') {
          await new Promise(r => window.grecaptcha.ready(r));
          return await window.grecaptcha.execute(sitekey, { action: 'login' });
        }
        return '';
      } catch (e) { return ''; }
    }, RECAPTCHA_SITEKEY);

    if (recaptchaToken) {
      await page.evaluate((token) => {
        const input = document.querySelector('input[name="g-recaptcha-response"]');
        if (input) input.value = token;
      }, recaptchaToken);
    }

    // Submete
    await page.click('button[type="submit"]');

    // Aguarda sair da página de login
    await Promise.race([
      page.waitForURL(url => !url.includes('/login'), { timeout: 20000 }),
      page.waitForTimeout(20000),
    ]).catch(() => {});

    await page.waitForTimeout(2000);
    const url = page.url();

    if (!url.includes('/login')) {
      // Login bem sucedido — extrai nome do usuário
      const userName = await page.evaluate((fallback) => {
        const selectors = [
          '[class*="user"] [class*="name"]', '[class*="username"]',
          '[class*="advisor"]', '.user-name', '.advisor-name',
          'header .name', 'nav .name', '[class*="profile"] [class*="name"]',
        ];
        for (const sel of selectors) {
          const el = document.querySelector(sel);
          if (el?.innerText?.trim()) return el.innerText.trim();
        }
        const headerText = document.querySelector('header, nav')?.innerText || '';
        const m = headerText.match(/([A-ZÀ-Ú][a-zà-ú]+ [A-ZÀ-Ú][a-zà-ú]+)/);
        return m ? m[1] : fallback;
      }, email.split('@')[0]);

      const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 1000));
      const companyMatch = bodyText.match(/([A-ZÀ-Ú][a-zà-ú]+(?: [A-ZÀ-Ú][a-zà-ú]+)+(?: (?:Ltda|S\.A\.|ME|EIRELI|Investimentos)\.?)?)/);
      const company = companyMatch ? companyMatch[1] : 'Assessor';

      await browser.close();
      return { valid: true, name: userName, company, email };
    } else {
      // Ainda no login — captura erro
      const errorMsg = await page.evaluate(() => {
        const selectors = ['.alert-danger', '.alert-error', '[class*="error"]', '.invalid-feedback', '.text-danger', '.alert'];
        for (const sel of selectors) {
          const el = document.querySelector(sel);
          if (el?.innerText?.trim()) return el.innerText.trim();
        }
        return null;
      });

      await browser.close();
      return { valid: false, error: errorMsg || 'Credenciais inválidas' };
    }
  } catch (e) {
    await browser.close().catch(() => {});
    return { valid: false, error: e.message };
  }
}

validateOnil(email, senha)
  .then(result => process.stdout.write(JSON.stringify(result)))
  .catch(e => process.stdout.write(JSON.stringify({ error: e.message })));
