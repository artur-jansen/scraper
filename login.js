const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: false }); // deixe visível para logar
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://www.threads.net/');

  console.log("🚨 Faça login manualmente na aba que abriu.");
  console.log("Depois feche o navegador para salvar a sessão.");

  // Espera manual até você fechar o navegador
  await page.waitForTimeout(120000); // 2 minutos

  // Salva sessão
  await context.storageState({ path: 'auth.json' });

  await browser.close();
})();
