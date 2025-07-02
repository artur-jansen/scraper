const axios = require('axios');
const { chromium } = require('playwright');

const HASHTAGS = [
  'automacao', 'agentesia', 'agenteia', 'agenteswhatsapp',
  'chatbot', 'inteligenciaartificial'
];

const palavrasChave = [
  "agente ia", "automação", "chatbot", "inteligência artificial",
  "mensagem automática", "ia whatsapp", "responder automático",
  "resposta automática", "fluxo automático", "assistente virtual",
  "bot instagram", "automação de atendimento", "atendimento automático"
];

// ⚠️ Substitua essa URL pelo seu webhook real do n8n
const N8N_WEBHOOK = 'https://n8n.doisdev.com.br/workflow/WE0NnvA3OfjtztLC';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ storageState: 'auth.json' }); // Usa o login salvo
  const page = await context.newPage();

  for (const tag of HASHTAGS) {
    try {
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
          console.log('Lead encontrado:', post);

          await axios.post(N8N_WEBHOOK, {
            text: post.text,
            username: post.username
          }).catch(err => {
            console.error('Erro ao enviar para n8n:', err.message);
          });
        }
      }
    } catch (err) {
      console.error(`Erro ao processar hashtag #${tag}:`, err.message);
    }
  }

  await browser.close();
}

run().catch(console.error);
