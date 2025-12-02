
import { PromptConfig, Scene, Character, AspectRatio } from "../types";
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai"; // Import GenerateContentResponse for type safety

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


/**
 * Handles common API key error logic for AISTUDIO models, specifically for models requiring paid billing.
 * This function will only interact with window.aistudio if it's available.
 * @param modelName The name of the model being used.
 * @returns A boolean indicating if the key selection was prompted (true) or if aistudio is not available (false).
 */
export const handleAistudioApiKeySelection = async (modelName: string): Promise<boolean> => {
  // Check if window.aistudio is available and has the necessary methods
  if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
    alert(`สำหรับ '${modelName}' คุณต้องเลือก API Key ที่ผูกกับการเรียกเก็บเงินแล้ว ผ่านหน้าต่าง 'ตั้งค่า API Key' ที่จะเปิดขึ้นมา`);
    await window.aistudio.openSelectKey();
    // Assuming success after openSelectKey() as per guidelines, no delay needed for race condition.
    return true;
  } else {
    // AISTUDIO environment is not detected. The caller should handle fallback (e.g., using a locally provided API key).
    return false;
  }
};

// --- Character Image Generation ---
export const generateCharacterImage = async (prompt: string, characterApiKey: string): Promise<string> => {
  const modelName = 'gemini-3-pro-image-preview';
  
  if (!characterApiKey) {
    throw new Error("API Key จำเป็นต้องมี. โปรดตั้งค่าในตัวจัดการ API Key.");
  }

  // No longer checking window.aistudio.hasSelectedApiKey here, as it's handled by the caller (CharacterStudio)
  // and handleAistudioApiKeySelection is now a separate, exposed function.

  const ai = new GoogleGenAI({ apiKey: characterApiKey });

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

    // Use optional chaining for safer access and type assertion for data
    const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

    if (imagePart?.inlineData?.data && imagePart.inlineData.mimeType) {
      // Ensure data is string, TS2322 fix
      const base64EncodeString: string = imagePart.inlineData.data as string; 
      return `data:${imagePart.inlineData.mimeType};base64,${base64EncodeString}`;
    } else {
      const textOutput = response.text;
      console.warn("No image data found in response. Text output:", textOutput);
      throw new Error(`AI ส่งคืนข้อความแทนรูปภาพหรือไม่มีข้อมูลรูปภาพ: ${textOutput?.substring(0, 100) || 'ไม่มีเนื้อหาข้อความ'}`);
    }
  } catch (error: any) {
    console.error("Error from Gemini API (generateCharacterImage):", error);
    // Specific handling for "Requested entity was not found." as per guidelines
    if (error.message && error.message.includes("Requested entity was not found.")) {
        // This means the selected key might be invalid/not billed for Veo
        throw new Error("ข้อผิดพลาดในการกำหนดค่า API Key. โปรดตรวจสอบว่า API Key ที่เลือกมาจากโปรเจกต์ GCP ที่มีการเรียกเก็บเงินและเปิดใช้งานสำหรับโมเดลนี้แล้ว. เอนทิตีที่ร้องขอไม่พบ.");
    }
    throw new Error(`ไม่สามารถสร้างรูปภาพได้: ${error.message || 'ข้อผิดพลาด API ไม่ทราบสาเหตุ'}`);
  }
};


// --- Storyboard Generation ---
export const generateStoryboardFromPlot = async (
  plot: string,
  selectedCharacters: Character[], // Changed to selectedCharacters
  maxCharactersPerScene: number, // New parameter
  numberOfScenes: number, // New parameter
  moodContext: { weather: string; atmosphere: string; lighting: string; intensity: number },
  storyApiKey: string
): Promise<Scene[]> => {
  if (!storyApiKey) {
    throw new Error("API Key จำเป็นต้องมี. โปรดตั้งค่าในตัวจัดการ API Key.");
  }

  const ai = new GoogleGenAI({ apiKey: storyApiKey });
  const characterDescriptions = selectedCharacters.map(c => `${c.name} (${c.nameEn}): ${c.description} (Personality: ${c.attributes.personality})`).join('\n');

  const fullPrompt = `Based on the following plot, selected character descriptions, and global mood settings, generate exactly ${numberOfScenes} distinct video scenes for a short film. Each scene should have a characterId (or 'none' for generic characters if no specific character is needed or available), action, setting, a detailed dialogue for the character (if a specific character is present and it makes sense for them to speak, keep it concise), specific environmentElements (e.g., objects, people, animals in the scene), shotType (e.g., Wide Angle, Close Up, Drone Shot, Tracking Shot, Over the Shoulder, Low Angle), and duration ('5s' or '8s'). Ensure no more than ${maxCharactersPerScene} characters appear in any single scene from the provided list.

Plot: ${plot}

Selected Characters for consideration:
${selectedCharacters.length > 0 ? characterDescriptions : "No specific characters selected, use generic ones if needed."}

Global Mood: Weather: ${moodContext.weather}, Atmosphere: ${moodContext.atmosphere}, Lighting: ${moodContext.lighting}, Intensity: ${moodContext.intensity}%.

Output in JSON format as an array of Scene objects:
[
  {
    "characterId": "character_id_here_or_none",
    "action": "Character doing something",
    "setting": "Location",
    "dialogue": "Optional dialogue line",
    "environmentElements": ["object1", "person2", "animal3"],
    "shotType": "Shot Type",
    "duration": "5s"
  }
]`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3-pro-preview", // Using a more capable model for complex text tasks and JSON generation
      contents: fullPrompt,
      config: {
        temperature: 1,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY, // Expecting an array of scenes directly
          items: {
            type: Type.OBJECT,
            properties: {
              characterId: { type: Type.STRING },
              action: { type: Type.STRING },
              setting: { type: Type.STRING },
              dialogue: { type: Type.STRING }, // New property
              environmentElements: { // New property
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              shotType: { type: Type.STRING },
              duration: { type: Type.STRING },
            },
            required: ["characterId", "action", "setting", "dialogue", "environmentElements", "shotType", "duration"],
          },
        },
      },
    });

    let jsonStr = response.text?.trim(); // Use optional chaining for response.text
    if (!jsonStr) {
      throw new Error("AI ไม่ได้ส่งคืนเนื้อหา JSON ใดๆ.");
    }

    // Try to parse JSON, sometimes AI might add comments or extra text.
    // Ensure we handle cases where the output is directly an array string.
    let parsedResponse;
    try {
        parsedResponse = JSON.parse(jsonStr);
    } catch (parseError) {
        // If direct parse fails, try to extract array from a potentially malformed string
        const firstBracket = jsonStr.indexOf('[');
        const lastBracket = jsonStr.lastIndexOf(']');
        if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
            jsonStr = jsonStr.substring(firstBracket, lastBracket + 1);
            parsedResponse = JSON.parse(jsonStr);
        } else {
            throw parseError; // Re-throw if extraction fails
        }
    }

    if (!Array.isArray(parsedResponse)) {
      console.warn("AI ส่งคืน JSON ที่ไม่ใช่ Array โดยตรง:", parsedResponse);
      throw new Error("AI ส่งคืนข้อมูล JSON ในรูปแบบที่ไม่ถูกต้อง (คาดหวัง Array ของฉาก).");
    }
    
    const scenes: Scene[] = parsedResponse.map((s: any) => ({
      ...s,
      duration: s.duration === '8s' ? '8s' : '5s', // Ensure duration is valid type
      characterId: selectedCharacters.some(c => c.id === s.characterId) ? s.characterId : 'none', // Validate characterId
      dialogue: s.dialogue || '', // Ensure dialogue is string
      environmentElements: Array.isArray(s.environmentElements) ? s.environmentElements : [], // Ensure elements is array
      generationStatus: 'idle'
    }));

    return scenes;

  } catch (error: any) {
    console.error("Error from Gemini API (generateStoryboardFromPlot):", error);
    throw new Error(`ไม่สามารถสร้างสตอรี่บอร์ดได้: ${error.message || 'ข้อผิดพลาด API ไม่ทราบสาเหตุ'}`);
  }
};


// --- Creative Prompt Generation (Placeholder/Example) ---
export const generateCreativePrompt = async (concept: string, storyApiKey: string): Promise<string> => {
  if (!storyApiKey) {
    throw new Error("API Key จำเป็นต้องมี. โปรดตั้งค่าในตัวจัดการ API Key.");
  }
  const ai = new GoogleGenAI({ apiKey: storyApiKey });
  
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Using gemini-2.5-flash for text tasks
      contents: `Generate a highly creative and descriptive prompt for a video generation AI based on the concept: "${concept}". The prompt should be vivid, detailed, and inspire a visually stunning short video.`,
      config: {
        temperature: 0.9,
        maxOutputTokens: 200,
      }
    });
    return response.text || "ไม่สามารถสร้างพรอมต์เชิงสร้างสรรค์ได้.";
  } catch (error: any) {
    console.error("Error from Gemini API (generateCreativePrompt):", error);
    throw new Error(`ไม่สามารถสร้างพรอมต์เชิงสร้างสรรค์ได้: ${error.message || 'ข้อผิดพลาด API ไม่ทราบสาเหตุ'}`);
  }
};

// Removed generateVeoVideo as per user's request for automatic account switching and no direct API video generation.
