import { GoogleGenAI } from "@google/genai";
import { Product } from "../types";

// Initialize Gemini Client
// The API key is obtained exclusively from the environment variable process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateCuratorNote = async (product: Product): Promise<string> => {
  if (!process.env.API_KEY) {
    console.warn("API Key is missing.");
    return "The curator is currently away gathering inspiration. (API Key missing)";
  }

  try {
    const prompt = `
      You are a curator for a high-end, minimalist lifestyle shop called "Choose".
      Brand Philosophy: "Life is what you choose, taste is what you choose. Choose a tasteful life, a better choice."
      
      Write a short, poetic, and atmospheric product description for the following item.
      Focus on the sensory experience, the material, and how it represents a conscious choice for a better life.
      Do not be salesy. Be contemplative and calm. Maximum 3 sentences.

      Product Name: ${product.name}
      Material: ${product.material}
      Origin: ${product.origin}
      Description: ${product.details}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    return response.text || "Quiet beauty speaks for itself.";
  } catch (error) {
    console.error("Error generating curator note:", error);
    return "The object's silence tells its own story.";
  }
};
