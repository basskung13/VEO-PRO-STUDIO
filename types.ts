
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
  attributeKey: 'gender' | 'ageGroup' | 'skinTone' | 'faceShape' | 'eyeShape' | 'eyeColor' |
                'hairStyle' | 'hairColor' | 'hairTexture' | 'facialFeatures' | 'bodyType' |
                'clothingStyle' | 'clothingColor' | 'clothingDetail' | 'accessories' |
                'weapons' | 'personality' | 'currentMood' | 'species' | 'environmentElement' |
                'storyDialect' | 'storyTone' | 'storyStyle' | 'storyCategory' | 'storyDetail'; 
}

// Character Studio Types
export interface CharacterAttributes {
  species: string;
  gender: string;
  ageGroup: string;
  skinTone: string;
  faceShape: string;
  eyeShape: string;
  eyeColor: string;
  hairStyle: string;
  hairColor: string;
  hairTexture: string;
  facialFeatures: string[];
  bodyType: string;
  clothingStyle: string;
  clothingColor: string;
  clothingDetail: string;
  accessories: string[];
  weapons: string[];
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
  visualDescriptionOverride?: string;
  dialogueExample?: string;
  imageUrl?: string;
  createdAt: number;
}

// Storyboard Types
export interface Scene {
  id: string;
  characterId: string | 'none';
  action: string;
  setting: string;
  dialogue?: string;
  environmentElements?: string[];
  shotType: string;
  shotAngle?: string;
  duration: '5s' | '8s';
  generatedVideoUrl?: string;
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

export interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

// Production / Metadata Types
export interface VideoMetadata {
  title: string;
  description: string;
  hashtags: string[];
}

export type SocialPlatform = 'tiktok' | 'youtube' | 'instagram' | 'facebook';

export interface SocialUploadConfig {
  platform: SocialPlatform;
  enabled: boolean;
  privacy: 'public' | 'private' | 'unlisted';
}

// --- PROJECT MANAGEMENT TYPES ---

export interface ProjectSettings {
  aspectRatio: AspectRatio;
  weather: string;
  atmosphere: string;
  lighting: string;
  intensity: number;
  dialect: string;
  tone: string;
  style: string;
}

export interface Project {
  id: string;
  name: string;
  category: string; // e.g. 'Short Film', 'Music Video', 'Vlog'
  createdAt: number;
  updatedAt: number;
  
  // Content State
  plot: string;
  scenes: Scene[];
  
  // Settings & Style
  settings: ProjectSettings;
  
  // Assets
  selectedCharacterIds: string[];
  maxCharactersPerScene: number;
  numberOfScenes: number;

  // Output
  metadata: VideoMetadata | null;
}

interface Window {
  aistudio?: AIStudio;
}
