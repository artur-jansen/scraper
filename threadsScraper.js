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
      console.log(`\n➡️ Pesquisando termo: "${tag}"...`);
      await page.goto(`https://www.threads.com/search?q=${encodeURIComponent(tag)}&serp_type=default`);
      await page.waitForTimeout(7000); // Aguarde um pouco mais, pode ser necessário

      // Faz scroll para baixo para tentar carregar mais resultados
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      await page.waitForTimeout(2000);

      // Salvando título e screenshot para depuração automática
      const titulo = await page.title();
      await page.screenshot({ path: `threads-debug-${tag}.png` });
      console.log(`📝 Título da página: ${titulo}`);

      // Troque aqui pelo seletor correto para posts após descobrir (exemplo abaixo)
      const posts = await page.$$eval('SELETOR_CORRETO_AQUI', articles =>
        articles.map(article => {
          const text = article.innerText;
          const username = article.querySelector('a')?.href || 'desconhecido';
          return { text, username };
        })
      );

      console.log(`🔎 Termo "${tag}": Encontrados ${posts.length} posts.`);
      if (posts.length === 0) {
        console.log(`⚠️ Nenhum post encontrado no termo "${tag}".`);
      }
      let achouLead = false;
      for (const post of posts) {
        console.log('📌 Post encontrado:', post);
        const texto = post.text.toLowerCase();
        const encontrou = palavrasChave.some(p => texto.includes(p.toLowerCase()));
        if (encontrou) {
          achouLead = true;
          console.log('🎯 Lead relevante encontrado:', post);
          await axios.post(N8N_WEBHOOK, {
            text: post.text,
            username: post.username
          }).catch(err => {
            console.error('❌ Erro ao enviar para n8n:', err.message);
          });
        }
      }
      if (!achouLead && posts.length > 0) {
        console.log(`🤷‍♂️ Nenhum lead relevante encontrado no termo "${tag}".`);
      }
    } catch (err) {
      console.error(`❗ Erro ao processar termo "${tag}":`, err.message);
    }
  }
  await browser.close();
  console.log('\n✅ Scraper finalizado!');
}

run().catch(console.error);
