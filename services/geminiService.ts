
import { PromptConfig, Scene, Character, AspectRatio } from "../types";
import { GoogleGenAI, GenerateContentResponse } from "@google/genai"; // Import GenerateContentResponse for type safety

// Removed duplicate declare global for window.aistudio.
// The type definition for window.aistudio is already handled in types.ts

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
  const targetUrl = `https://accounts.google.com/AccountChooser?continue=https://gemini.google.com/app&service=mail&authuser=${authIndex}`;
  const width = 1000;
  const height = 700;
  const left = (window.screen.width - width) / 2;
  const top = (window.screen.height - height) / 2;

  window.open(
    targetUrl, 
    `AccountChooser-${authIndex}`, 
    `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes,status=yes`
  );

  // In a real application, you might want to periodically check if the user has signed in
  // or provide a manual refresh button.
};


// Function to handle common API key error logic for AISTUDIO models
const handleAistudioApiKeyError = async (modelName: string) => {
  if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
    alert(`สำหรับ '${modelName}' คุณต้องเลือก API Key ที่ผูกกับการเรียกเก็บเงินแล้ว ผ่านหน้าต่าง 'ตั้งค่า API Key' ที่จะเปิดขึ้นมา`);
    await window.aistudio.openSelectKey();
    // Assuming success after openSelectKey() as per guidelines, no delay needed for race condition.
  } else {
    throw new Error(`API Key selection (window.aistudio) is not available for ${modelName}. Ensure your environment supports it.`);
  }
};

// --- Character Image Generation ---
export const generateCharacterImage = async (prompt: string): Promise<string> => {
  const modelName = 'gemini-3-pro-image-preview';
  
  if (!process.env.API_KEY) {
    throw new Error("API Key is required. Please set it in the API Key Manager.");
  }

  // Check AISTUDIO key for gemini-3-pro-image-preview
  if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await handleAistudioApiKeyError(modelName);
      // After opening the dialog, we proceed. The new instance of GoogleGenAI below
      // will pick up the updated process.env.API_KEY.
    }
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          { text: `${prompt}. Generate a realistic, high-quality image. Aspect ratio 1:1, image size 1K.` },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "1K"
        },
        tools: [{googleSearch: {}}], // Use googleSearch for enhanced context if available for this model
      },
    });

    const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

    if (imagePart?.inlineData?.data && imagePart.inlineData.mimeType) {
      // Ensure data is string, TS2322 fix
      const base64EncodeString: string = imagePart.inlineData.data; 
      return `data:${imagePart.inlineData.mimeType};base64,${base64EncodeString}`;
    } else {
      const textOutput = response.text;
      console.warn("No image data found in response. Text output:", textOutput);
      throw new Error(`AI returned text instead of image or no image data: ${textOutput?.substring(0, 100) || 'No text content'}`);
    }
  } catch (error: any) {
    console.error("Error from Gemini API (generateCharacterImage):", error);
    // Specific handling for "Requested entity was not found." as per guidelines
    if (error.message && error.message.includes("Requested entity was not found.")) {
        // This means the selected key might be invalid/not billed for Veo
        throw new Error("API Key configuration error. Please ensure your selected API Key is from a paid GCP project and enabled for this model. Requested entity was not found.");
    }
    throw new Error(`Failed to generate image: ${error.message || 'Unknown API error'}`);
  }
};


// --- Storyboard Generation ---
export const generateStoryboardFromPlot = async (plot: string, characters: Character[], moodContext: any): Promise<Scene[]> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is required. Please set it in the API Key Manager.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const characterDescriptions = characters.map(c => `${c.name} (${c.nameEn}): ${c.description}`).join('\n');

  const fullPrompt = `Based on the following plot and character descriptions, generate a list of 3-5 distinct video scenes for a short film. Each scene should have a characterId (or 'none'), action, setting, shotType (e.g., Wide Angle, Close Up), and duration ('5s' or '8s'). Incorporate the global mood settings.

Plot: ${plot}

Characters:
${characterDescriptions}

Global Mood: Weather: ${moodContext.weather}, Atmosphere: ${moodContext.atmosphere}, Lighting: ${moodContext.lighting}, Intensity: ${moodContext.intensity}%.

Output in JSON format as an array of Scene objects:
[
  {
    "characterId": "character_id_here", 
    "action": "Character doing something", 
    "setting": "Location", 
    "shotType": "Shot Type",
    "duration": "5s"
  }
]`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Using gemini-2.5-flash for text tasks
      contents: fullPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              characterId: { type: "STRING" },
              action: { type: "STRING" },
              setting: { type: "STRING" },
              shotType: { type: "STRING" },
              duration: { type: "STRING" },
            },
            required: ["characterId", "action", "setting", "shotType", "duration"],
          },
        },
      },
    });

    let jsonStr = response.text?.trim(); // Use optional chaining for response.text
    if (!jsonStr) {
      throw new Error("AI did not return any JSON content.");
    }

    // Attempt to parse JSON, sometimes AI might add comments or extra text.
    // Try to find the first and last brace to extract valid JSON
    const firstBrace = jsonStr.indexOf('[');
    const lastBrace = jsonStr.lastIndexOf(']');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
    } else {
      console.warn("JSON string might be malformed or not an array:", jsonStr);
    }
    
    const scenes: Scene[] = JSON.parse(jsonStr).map((s: any) => ({
      ...s,
      duration: s.duration === '8s' ? '8s' : '5s', // Ensure duration is valid type
      generationStatus: 'idle'
    }));
    return scenes;

  } catch (error: any) {
    console.error("Error from Gemini API (generateStoryboardFromPlot):", error);
    throw new Error(`Failed to generate storyboard: ${error.message || 'Unknown API error'}`);
  }
};


// --- Video Generation (Veo) ---
export const generateVeoVideo = async (prompt: string, aspectRatio: AspectRatio): Promise<string> => {
  const modelName = 'veo-3.1-fast-generate-preview';

  if (!process.env.API_KEY) {
    throw new Error("API Key is required. Please set it in the API Key Manager.");
  }

  // Check AISTUDIO key for Veo models
  if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await handleAistudioApiKeyError(modelName);
      // After opening the dialog, we proceed. The new instance of GoogleGenAI below
      // will pick up the updated process.env.API_KEY.
    }
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    let operation = await ai.models.generateVideos({
      model: modelName,
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p', // Default resolution for fast preview
        aspectRatio: aspectRatio
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
      operation = await ai.operations.getVideosOperation({operation: operation});
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

    if (!downloadLink) {
      throw new Error("Video generation completed but no download link was returned.");
    }
    // The response.body contains the MP4 bytes. You must append an API key when fetching from the download link.
    return `${downloadLink}&key=${process.env.API_KEY}`; // Ensure API key is appended for direct download
  } catch (error: any) {
    console.error("Error from Gemini API (generateVeoVideo):", error);
    // Specific handling for "Requested entity was not found." as per guidelines
    if (error.message && error.message.includes("Requested entity was not found.")) {
        // This means the selected key might be invalid/not billed for Veo
        throw new Error("API Key configuration error. Please ensure your selected API Key is from a paid GCP project and enabled for Veo. Requested entity was not found.");
    }
    throw new Error(`Failed to generate video: ${error.message || 'Unknown API error'}`);
  }
};

// --- Creative Prompt Generation (Placeholder/Example) ---
export const generateCreativePrompt = async (concept: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is required. Please set it in the API Key Manager.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Using gemini-2.5-flash for text tasks
      contents: `Generate a highly creative and descriptive prompt for a video generation AI based on the concept: "${concept}". The prompt should be vivid, detailed, and inspire a visually stunning short video.`,
      config: {
        temperature: 0.9,
        maxOutputTokens: 200,
      }
    });
    return response.text || "Could not generate a creative prompt.";
  } catch (error: any) {
    console.error("Error from Gemini API (generateCreativePrompt):", error);
    throw new Error(`Failed to generate creative prompt: ${error.message || 'Unknown API error'}`);
  }
};