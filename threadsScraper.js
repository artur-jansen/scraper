const axios = require('axios');
const { chromium } = require('playwright');

const HASHTAGS = ['automacao', 'agentesia', 'chatbot'];
const palavrasChave = ['agente ia', 'automação', 'whatsapp', 'atendimento automático'];

const N8N_WEBHOOK = 'https://n8n.doisdev.com.br/workflow/WE0NnvA3OfjtztLC';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ storageState: 'auth.json' });
  const page = await context.newPage();

  for (const tag of HASHTAGS) {
    await page.goto(`https://www.threads.net/t/${tag}`);
    await page.waitForTimeout(5000);

    const posts = await page.$$eval('article', articles =>
      articles.map(article => {
        const text = article.innerText;
        const username = article.querySelector('a')?.href || 'desconhecido';
        return { text, username };
      })
    );

    for (const post of posts) {
      const texto = post.text.toLowerCase();
      const encontrou = palavrasChave.some(p => texto.includes(p.toLowerCase()));

      if (encontrou) {
        console.log('🔥 Lead encontrado:', post);

        await axios.post(N8N_WEBHOOK, {
          text: post.text,
          username: post.username
        });
      }
    }
  }

  await browser.close();
}

run().catch(console.error);
