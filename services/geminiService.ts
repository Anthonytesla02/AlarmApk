import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateWakeUpMessage = async (time: string, weather: string = "unknown"): Promise<string> => {
  if (!apiKey) return "Good morning! Rise and shine.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a motivating, slightly witty alarm clock assistant. 
      The user just woke up at ${time}. 
      Generate a very short (max 2 sentences) motivational greeting to get them out of bed. 
      Be punchy and energetic. Do not use hashtags.`,
    });
    return response.text || "Good morning! Time to conquer the day.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Good morning! Start your day with energy.";
  }
};
