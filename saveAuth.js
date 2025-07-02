const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false }); // VISUAL para você logar
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://www.threads.net/login'); // URL do login
  console.log('Faça login manualmente e depois feche o navegador');

  // Espera o usuário logar
  await page.waitForTimeout(60000); // 1 minuto para login

  await context.storageState({ path: 'auth.json' }); // salva a sessão
  await browser.close();

  console.log('Sessão salva em auth.json');
})();
