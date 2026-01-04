import { GoogleGenAI, Type } from "@google/genai";
import { CARD_PROMPT, GEMINI_MODEL } from "../constants";
import { ExtractedData } from "../types";
import { getApiKey } from "./storageService";

export const validateGeminiApiKey = async (key: string): Promise<boolean> => {
  try {
    const ai = new GoogleGenAI({ apiKey: key });
    // Minimal call to test validity
    await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: { parts: [{ text: "Hello" }] },
    });
    return true;
  } catch (error) {
    console.error("API Key Validation Failed:", error);
    return false;
  }
};

export const analyzeCardImage = async (base64Image: string): Promise<ExtractedData> => {
  // 1. Try to get key from local storage (User provided)
  let apiKey = getApiKey();

  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Please add it in Settings.");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Remove data URL prefix if present
  const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: {
        parts: [
          {
            text: CARD_PROMPT
          },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64
            }
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, nullable: true },
            company: { type: Type.STRING, nullable: true },
            phone: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              nullable: true 
            },
            email: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              nullable: true 
            },
            website: { type: Type.STRING, nullable: true },
            description: { type: Type.STRING, nullable: true },
            tags: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              nullable: true 
            },
          },
          required: ["name", "company", "tags"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from Gemini");
    }

    const data = JSON.parse(text);
    
    // Normalize data
    const phones = Array.isArray(data.phone) ? data.phone : (data.phone ? [data.phone] : []);
    const emails = Array.isArray(data.email) ? data.email : (data.email ? [data.email] : []);

    return {
      name: data.name || null,
      company: data.company || null,
      phone: phones,
      email: emails,
      website: data.website || null,
      description: data.description || null,
      tags: Array.isArray(data.tags) ? data.tags : [],
    };

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};