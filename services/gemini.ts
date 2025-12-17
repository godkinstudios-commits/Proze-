import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateText = async (prompt: string, context?: string): Promise<string> => {
  try {
    const modelId = 'gemini-2.5-flash';
    
    let finalPrompt = prompt;
    if (context) {
      finalPrompt = `Context: The user is writing a document. Here is the current content:\n"${context}"\n\nTask: ${prompt}`;
    }

    const response = await ai.models.generateContent({
      model: modelId,
      contents: finalPrompt,
    });

    return response.text || "";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const polishText = async (text: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Improve the clarity, grammar, and flow of the following text, keeping the tone professional yet minimalist. Do not add conversational filler. Just return the improved text:\n\n"${text}"`
        });
        return response.text || text;
    } catch (e) {
        console.error(e);
        return text;
    }
}