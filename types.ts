

export interface HistoryItem {
  id: string;
  originalPrompt: string;
  finalPrompt: string;
  createdAt: number;
  accountIndex: number;
}

export type AspectRatio = '16:9' | '9:16';

export interface PromptConfig {
  prompt: string;
  aspectRatio: AspectRatio;
  style?: string;
}

export interface AccountUsage {
  [index: number]: number;
}

export interface UserProfile {
  name: string;
  email?: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
}

export interface CustomOption {
  id: string;
  value: string;
  // Link to specific character attribute keys for better organization
  attributeKey: 'gender' | 'ageGroup' | 'skinTone' | 'faceShape' | 'eyeShape' | 'eyeColor' |
                'hairStyle' | 'hairColor' | 'hairTexture' | 'facialFeatures' | 'bodyType' |
                'clothingStyle' | 'clothingColor' | 'clothingDetail' | 'accessories' |
                'weapons' | 'personality' | 'currentMood';
}

// Character Studio Types
export interface CharacterAttributes {
  gender: string;
  ageGroup: string;
  skinTone: string;
  faceShape: string;
  eyeShape: string;
  eyeColor: string;
  hairStyle: string;
  hairColor: string;
  hairTexture: string;
  facialFeatures: string[]; // Scars, freckles, etc.
  bodyType: string;
  clothingStyle: string;
  clothingColor: string;
  clothingDetail: string; // Detailed description
  accessories: string[]; // Glasses, hats, jewelry
  weapons: string[]; // Swords, wands (for fantasy)
  personality: string;
  currentMood: string;
}

export interface Character {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  attributes: CharacterAttributes;
  seed: string;
  visualDescriptionOverride?: string; // New field for detailed visual description
  dialogueExample?: string; // New field for example dialogue lines
  createdAt: number;
}

// Storyboard Types
export interface Scene {
  id: string;
  characterId: string | 'none'; // ID of the character in this scene
  action: string; // What is happening
  setting: string; // Environment
  dialogue?: string; // Optional speaking line
  shotType: string; // Camera angle
  shotAngle?: string; // New field for camera angle
  duration: '5s' | '8s';
  generatedVideoUrl?: string; // URL of the generated video
  generationStatus?: 'idle' | 'generating' | 'completed' | 'error'; 
}

export interface StoryboardProject {
  plot: string;
  genre: string;
  scenes: Scene[];
}

export interface PromptBuilderState {
  concept: string;
}

export interface LoggedInUser {
  username: string;
}

declare global {
  interface Window {
    // Standard window properties
  }
}