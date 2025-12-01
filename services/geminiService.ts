

import { PromptConfig, Scene, Character, AspectRatio } from "../types";
import { GoogleGenAI } from "@google/genai";

// Removed redundant declare global block as it's now correctly defined in types.ts.

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

export const generateCreativePrompt = async (apiKeyFromProp: string, context: CreativeContext): Promise<string> => {
  // Always use process.env.API_KEY for actual API calls
  if (!process.env.API_KEY) throw new Error("API Key is required. Please set it in the API Key Manager.");

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const systemInstruction = `You are an expert film director. Construct a detailed visual prompt.`;

  try {
    // Updated model from 'gemini-2.0-flash' to 'gemini-2.5-flash' as per guidelines.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: `Generate prompt for: ${JSON.stringify(context)}` }] },
      config: { systemInstruction, temperature: 0.75 }
    });
    return response.text?.trim() || "";
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    if (error.message && error.message.includes("PERMISSION_DENIED")) {
        throw new Error(
            "Permission denied. This usually means your API Key is not configured for billing or the Generative Language API is not enabled in your Google Cloud Project. " +
            "Please check your Google Cloud project settings and ensure billing is enabled and the Generative Language API is active. " +
            "For image generation with `gemini-3-pro-image-preview` and video generation with Veo, you must select a paid API key via the 'ตั้งค่า API Key' button."
        );
    }
    throw error;
  }
};

// New: Generate Storyboard from Plot with Mood Context
export const generateStoryboardFromPlot = async (
  apiKeyFromProp: string, 
  plot: string, 
  characters: Character[],
  moodContext?: { weather: string; atmosphere: string; lighting: string; intensity: number }
): Promise<Scene[]> => {
  // Always use process.env.API_KEY for actual API calls
  if (!process.env.API_KEY) throw new Error("API Key is required. Please set it in the API Key Manager.");
  if (!plot) return [];

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
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
    // Updated model from 'gemini-2.0-flash' to 'gemini-2.5-flash' as per guidelines.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
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
  } catch (error: any) {
    console.error("Storyboard Generation Error:", error);
    if (error.message && error.message.includes("PERMISSION_DENIED")) {
        throw new Error(
            "Permission denied. This usually means your API Key is not configured for billing or the Generative Language API is not enabled in your Google Cloud Project. " +
            "Please check your Google Cloud project settings and ensure billing is enabled and the Generative Language API is active. " +
            "For image generation with `gemini-3-pro-image-preview` and video generation with Veo, you must select a paid API key via the 'ตั้งค่า API Key' button."
        );
    }
    throw error;
  }
};

// Generate Video using Veo 3.1
export const generateVeoVideo = async (
  apiKeyFromProp: string, 
  prompt: string, 
  aspectRatio: AspectRatio
): Promise<string> => {
  // Always use process.env.API_KEY for actual API calls
  if (!process.env.API_KEY) throw new Error("API Key is required. Please set it in the API Key Manager.");

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
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
    return `${uri}&key=${process.env.API_KEY}`;
  } catch (error: any) {
    console.error("Veo Video Generation Error:", error);
    if (error.message && error.message.includes("PERMISSION_DENIED")) {
        throw new Error(
            "Permission denied. This usually means your API Key is not configured for billing or the Generative Language API is not enabled in your Google Cloud Project. " +
            "Please check your Google Cloud project settings and ensure billing is enabled and the Generative Language API is active. " +
            "For image generation with `gemini-3-pro-image-preview` and video generation with Veo, you must select a paid API key via the 'ตั้งค่า API Key' button."
        );
    } else if (error.message && error.message.includes("Requested entity was not found.")) {
        // This is the specific error mentioned in the guidelines for `window.aistudio` failure
        if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
            console.warn("Veo API call failed with 'Requested entity was not found.'. Attempting to reset API key selection.");
            // We cannot directly reset the AISTUDIO key selection, but we can instruct the user
            throw new Error(
              "การสร้างวิดีโอไม่สำเร็จ: ไม่พบเอนทิตีที่ร้องขอ (Requested entity was not found). " +
              "โปรดตรวจสอบว่าคุณได้เลือก API Key ที่ถูกต้องจากโปรเจกต์ที่มีการตั้งค่าการเรียกเก็บเงินแล้วผ่านปุ่ม 'ตั้งค่า API Key'."
            );
        }
    }
    throw error;
  }
};

/**
 * Generates an image of a character using the Gemini API.
 * Uses gemini-3-pro-image-preview model.
 * Uses `process.env.API_KEY` directly as required for models needing API Key selection.
 * @param prompt - The textual description of the character to generate.
 * @returns A base64 encoded image data URL.
 */
export const generateCharacterImage = async (prompt: string): Promise<string> => {
  // CRITICAL: Always use process.env.API_KEY for API calls to models like gemini-3-pro-image-preview
  // as it's populated by window.aistudio.openSelectKey()
  if (!process.env.API_KEY) {
    throw new Error(
      "API Key is not available. Please ensure you have selected a valid API Key " +
      "via the 'ตั้งค่า API Key' button for `gemini-3-pro-image-preview` (from a paid GCP project)."
    );
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview', // Use a suitable image generation model
      contents: {
        parts: [
          {
            text: `Generate a realistic portrait image of: ${prompt}`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1", // Default to square for character portraits
          imageSize: "1K" // Default resolution
        },
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64EncodeString: string = part.inlineData.data;
        return `data:${part.inlineData.mimeType};base64,${base64EncodeString}`;
      }
    }
    throw new Error("No image data found in the response.");

  } catch (error: any) {
    console.error("Gemini Character Image Generation Error:", error);
    if (error.message && error.message.includes("PERMISSION_DENIED")) {
        throw new Error(
            "Permission denied. This usually means your API Key is not configured for billing or the Generative Language API is not enabled in your Google Cloud Project. " +
            "For `gemini-3-pro-image-preview`, you MUST select a paid API key via the 'ตั้งค่า API Key' button." +
            "Please check your Google Cloud project settings and ensure billing is enabled and the Generative Language API is active. " +
            "More info: ai.google.dev/gemini-api/docs/billing"
        );
    } else if (error.message && error.message.includes("Requested entity was not found.")) {
        // This is the specific error mentioned in the guidelines for `window.aistudio` failure
        if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
            console.warn("Image API call failed with 'Requested entity was not found.'. Attempting to reset API key selection.");
            // We cannot directly reset the AISTUDIO key selection, but we can instruct the user
            throw new Error(
              "การสร้างภาพไม่สำเร็จ: ไม่พบเอนทิตีที่ร้องขอ (Requested entity was not found). " +
              "โปรดตรวจสอบว่าคุณได้เลือก API Key ที่ถูกต้องจากโปรเจกต์ที่มีการตั้งค่าการเรียกเก็บเงินแล้วผ่านปุ่ม 'ตั้งค่า API Key'."
            );
        }
    }
    throw error;
  }
};