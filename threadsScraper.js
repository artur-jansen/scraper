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
const N8N_WEBHOOK = 'https://n8n.doisdev.com.br/workflow/TNhLNO6JBGg9ClzR';

async function run() {
  console.log('⚡ Iniciando o scraper de Threads...');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ storageState: 'auth.json' });
  const page = await context.newPage();

  for (const tag of HASHTAGS) {
    try {
      console.log(`\n➡️ Acessando hashtag: #${tag}...`);
      await page.goto(`https://www.threads.net/t/${tag}`);
      await page.waitForTimeout(5000);

      const posts = await page.$$eval('article', articles =>
        articles.map(article => {
          const text = article.innerText;
          const username = article.querySelector('a')?.href || 'desconhecido';
          return { text, username };
        })
      );

      console.log(`🔎 Hashtag #${tag}: Encontrados ${posts.length} posts.`);
      if (posts.length === 0) {
        console.log(`⚠️ Nenhum post encontrado na hashtag #${tag}.`);
      }

      let achouLead = false;

      for (const post of posts) {
        console.log('📌 Post encontrado:', post); // Loga todo post para debug

        const texto = post.text.toLowerCase();
        const encontrou = palavrasChave.some(p => texto.includes(p.toLowerCase()));
        if (encontrou) {
          achouLead = true;
          console.log('🎯 Lead relevante encontrado:', post);
          // Só tente enviar para o n8n se quiser verificar eventual erro, pode deixar comentado por enquanto
          await axios.post(N8N_WEBHOOK, {
            text: post.text,
            username: post.username
          }).catch(err => {
            console.error('❌ Erro ao enviar para n8n:', err.message);
          });
        }
      }

      if (!achouLead && posts.length > 0) {
        console.log(`🤷‍♂️ Nenhum lead relevante encontrado na hashtag #${tag}.`);
      }
    } catch (err) {
      console.error(`❗ Erro ao processar hashtag #${tag}:`, err.message);
    }
  }
  await browser.close();
  console.log('\n✅ Scraper finalizado!');
}

run().catch(console.error);
