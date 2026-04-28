require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function run() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.log('Sem GEMINI_API_KEY no .env.local');
      return;
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // O SDK não tem um método genAI.listModels() publicamente documentado de forma simples,
    // mas podemos fazer uma requisição fetch direta para a API REST para listar os modelos.
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    
    if (data.models) {
      console.log('Modelos disponíveis para esta chave de API:');
      data.models.filter(m => m.supportedGenerationMethods.includes('generateContent')).forEach(m => {
        console.log(`- ${m.name.replace('models/', '')}`);
      });
    } else {
      console.log('Erro ao buscar modelos:', data);
    }
  } catch (e) {
    console.log('Exceção:', e);
  }
}
run();
