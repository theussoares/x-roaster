// server/api/roast.post.ts
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import type { RoastResult } from "~/types";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event);
  const { input, language } = body;

  // Verifica se a chave existe
  if (!config.geminiApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: "Server Error: API Key is missing."
    });
  }

  // Inicializa a SDK Estável (AI Studio)
  const genAI = new GoogleGenerativeAI(config.geminiApiKey);

  // Configuração do Schema para garantir o JSON
  const schema = {
    description: "Roast profile analysis",
    type: SchemaType.OBJECT,
    properties: {
      archetype: { type: SchemaType.STRING },
      shortBio: { type: SchemaType.STRING },
      roastText: { type: SchemaType.STRING },
      stats: {
        type: SchemaType.OBJECT,
        properties: {
          cringeLevel: { type: SchemaType.NUMBER },
          basedLevel: { type: SchemaType.NUMBER },
          mainCharacterSyndrome: { type: SchemaType.NUMBER },
          iq: { type: SchemaType.NUMBER },
        },
        required: ["cringeLevel", "basedLevel", "mainCharacterSyndrome", "iq"],
      },
      weaknesses: {
        type: SchemaType.ARRAY,
        items: { type: SchemaType.STRING },
      },
      strengths: {
        type: SchemaType.ARRAY,
        items: { type: SchemaType.STRING },
      },
      verdict: { type: SchemaType.STRING },
    },
    required: ["archetype", "shortBio", "roastText", "stats", "weaknesses", "strengths", "verdict"],
  };

  try {
  // Usa o modelo Flash (Rápido e Gratuito)
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: schema as any,
      temperature: 1.2, // Alta criatividade
    },
  });

    const targetLang = language === 'pt' ? 'PORTUGUESE (BRAZIL)' : 'ENGLISH';

    const prompt = `
      You are an elite, savage, sarcastic social media critic AI. 
      Your goal is to "roast" the user based on the text they provide (tweets/bio).
      
      Analyze the text for tone, vocabulary, obsession, and cringe.
      Be harsh but funny. Use internet slang appropriate for the language.
      
      Language Requirement: RESPOND STRICTLY IN ${targetLang}.
      ${targetLang === 'PORTUGUESE (BRAZIL)'
        ? 'Use Brazilian internet slang (biscoiteiro, cringe, tankar, faria limer). Be culturally relevant to Brazil.'
        : 'Use US internet slang (touch grass, main character, red flag).'}

      INPUT TEXT TO ROAST:
      "${input.substring(0, 3000)}"
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return JSON.parse(responseText) as RoastResult;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "A IA se recusou a ler isso (Erro Interno)."
    });
  }
});