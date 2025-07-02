const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();

  const page = await context.newPage();
  await page.goto('https://www.threads.net');

  console.log("🚨 Faça login manualmente na aba que abriu.");
  console.log("👉 Não feche a aba nem o terminal até que esteja logado!");
  console.log("✅ Após o login, pressione ENTER no terminal para salvar a sessão.");

  // Espera o ENTER do usuário no terminal
  process.stdin.once('data', async () => {
    const storage = await context.storageState();
    fs.writeFileSync('auth.json', JSON.stringify(storage, null, 2));
    console.log("✅ Sessão salva no arquivo auth.json");
    await browser.close();
    process.exit(0);
  });
})();
