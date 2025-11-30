
import { PromptConfig, Scene, Character, AspectRatio } from "../types";
import { GoogleGenAI } from "@google/genai";

// Helper to construct the text prompt optimized for Gemini Web
export const constructVeoPrompt = (config: PromptConfig): string => {
  let baseCommand = `Create a video of ${config.prompt.trim()}`;
  
  // Add aspect ratio instruction
  if (config.aspectRatio) {
    baseCommand += ` --aspect_ratio ${config.aspectRatio}`;
  }

  // Add style if provided (can be extended later)
  if (config.style) {
    baseCommand += `, ${config.style} style`;
  }

  return baseCommand;
};

export const openGeminiWeb = (authIndex: number = 0) => {
  const url = `https://gemini.google.com/app?authuser=${authIndex}`;
  const width = 1200;
  const height = 800;
  const left = (window.screen.width - width) / 2;
  const top = (window.screen.height - height) / 2;

  window.open(
    url, 
    'GeminiVeoWindow', 
    `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes,status=yes`
  );
};

export const openGoogleAccountChooser = (authIndex: number, email?: string) => {
  const targetUrl = `https://gemini.google.com/app?authuser=${authIndex}`;
  const width = 1000;
  const height = 700;
  const left = (window.screen.width - width) / 2;
  const top = (window.screen.height - height) / 2;
  
  let finalUrl = targetUrl;
  if (email && email.trim() !== '') {
    finalUrl = `https://accounts.google.com/AccountChooser?Email=${encodeURIComponent(email.trim())}&continue=${encodeURIComponent(targetUrl)}`;
  } 

  window.open(
    finalUrl, 
    'GoogleAccountChooser', 
    `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes,status=yes`
  );
};

export interface CreativeContext {
  concept: string;
  character: string;
  setting: string;
  weather: string;
  atmosphere: string;
  lighting: string;
  camera: string;
  intensity: string; 
}

export const generateCreativePrompt = async (apiKey: string, context: CreativeContext): Promise<string> => {
  if (!apiKey) throw new Error("API Key is required");

  const ai = new GoogleGenAI({ apiKey: apiKey });
  const systemInstruction = `You are an expert film director. Construct a detailed visual prompt.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: { parts: [{ text: `Generate prompt for: ${JSON.stringify(context)}` }] },
      config: { systemInstruction, temperature: 0.75 }
    });
    return response.text?.trim() || "";
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw error;
  }
};

// New: Generate Storyboard from Plot with Mood Context
export const generateStoryboardFromPlot = async (
  apiKey: string, 
  plot: string, 
  characters: Character[],
  moodContext?: { weather: string; atmosphere: string; lighting: string; intensity: number }
): Promise<Scene[]> => {
  if (!apiKey) throw new Error("API Key is required");
  if (!plot) return [];

  const ai = new GoogleGenAI({ apiKey: apiKey });
  
  const charList = characters.map(c => `- ${c.nameEn} (ID: ${c.id}): ${c.description}`).join('\n');
  
  let moodPrompt = "";
  if (moodContext) {
    moodPrompt = `
    Global Atmosphere Settings:
    - Weather: ${moodContext.weather}
    - Atmosphere: ${moodContext.atmosphere}
    - Lighting: ${moodContext.lighting}
    - Emotional Intensity: ${moodContext.intensity}% (0=Calm, 100=Extreme)
    
    Ensure the scenes reflect these settings. For example, if it's rainy, include rain in the setting description. If intensity is high, make the action dramatic.
    `;
  }

  const systemInstruction = `You are a professional storyboard artist.
  Based on the User's PLOT and available CHARACTERS, break the story down into 3-5 distinct video scenes.
  ${moodPrompt}
  
  Available Characters:
  ${charList}
  (If the plot needs a generic character not listed, use 'none' for characterId)

  Output STRICT JSON format:
  [
    {
      "characterId": "ID_FROM_LIST_OR_NONE",
      "action": "Visual description of action",
      "setting": "Visual description of setting",
      "shotType": "Camera angle (e.g. Wide Shot, Close Up)",
      "dialogue": "Optional dialogue line",
      "duration": "5s"
    }
  ]
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: { parts: [{ text: `Plot: ${plot}` }] },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: 'application/json'
      }
    });

    const jsonText = response.text || "[]";
    const scenes = JSON.parse(jsonText);
    return scenes.map((s: any) => ({
      ...s,
      id: Date.now().toString() + Math.random().toString()
    }));
  } catch (error) {
    console.error("Storyboard Generation Error:", error);
    return [];
  }
};

// Generate Video using Veo 3.1
export const generateVeoVideo = async (
  apiKey: string, 
  prompt: string, 
  aspectRatio: AspectRatio
): Promise<string> => {
  if (!apiKey) throw new Error("API Key is required");

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '1080p',
        aspectRatio: aspectRatio as any
      }
    });

    // Polling for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    if (operation.error) {
      throw new Error((operation.error.message as string) || "Video generation failed");
    }

    const uri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!uri) throw new Error("No video URI returned from API");
    
    // Append API key to allow fetching/viewing
    return `${uri}&key=${apiKey}`;
  } catch (error) {
    console.error("Veo Video Generation Error:", error);
    throw error;
  }
};
