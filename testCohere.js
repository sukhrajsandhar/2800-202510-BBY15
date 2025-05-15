require('dotenv').config();
const { CohereClient } = require('cohere-ai');

const cohere = new CohereClient({
  apiKey: process.env.COHERE_API_KEY
});

async function generateFunFact(campsiteName) {
    const prompt = `Tell me a unique, short camping fact related to nature or this place: ${campsiteName}. Only 1 sentence!`;
    const response = await cohere.generate({
        model: 'command-r-plus',
        prompt: prompt,
        max_tokens: 40,
        temperature: 0.7,
    });
    console.log(response.generations[0].text);
}

generateFunFact("Porteau Cove Provincial Park");
