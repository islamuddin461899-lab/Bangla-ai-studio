export type Language = 'bn' | 'en';
export type ThemeMode = 'dark' | 'light' | 'system';

export type AppView = 
  | 'home'
  | 'prompt-library'
  | 'generator'
  | 'chat'
  | 'text-to-image'
  | 'photo-editor'
  | 'image-to-image'
  | 'photo-to-video'
  | 'text-to-video'
  | 'video-editor'
  | 'ai-voice'
  | 'creations'
  | 'projects'
  | 'profile'
  | 'settings';

export type CharacterAgeBracket = 
  | 'child'       // 5–12
  | 'teen'        // 13–17
  | 'young-adult' // 18–25
  | 'adult'       // 26–40
  | 'middle-aged' // 41–60
  | 'senior';     // 60+

export type GeneratorStyle = 
  | 'Photorealistic' 
  | 'Cinematic' 
  | '3D Animation' 
  | 'Cartoon' 
  | 'Realistic' 
  | 'Studio' 
  | 'Village' 
  | 'Social Media';

export type GeneratorGender = 'Male' | 'Female' | 'Group';

export type PromptCategory = 
  | 'bangladeshi-village'
  | 'bangladeshi-city'
  | 'bazaar'
  | 'school'
  | 'college'
  | 'family'
  | 'friendship'
  | 'children-story'
  | 'boy-girl-tale'
  | 'islamic'
  | 'funny'
  | 'emotional'
  | 'family-relationship'
  | 'farmer'
  | 'shop'
  | 'restaurant'
  | 'travel'
  | 'nature'
  | 'eid'
  | 'wedding'
  | 'village-life'
  | 'cinematic-story'
  | '3d-cartoon'
  | 'realistic-photo'
  | 'ai-short-film';

export interface AIPromptItem {
  id: string;
  title: string;
  titleBn: string;
  category: PromptCategory;
  categoryName: string;
  categoryNameBn: string;
  age: CharacterAgeBracket;
  ageLabel: string;
  gender: GeneratorGender;
  imagePrompt: string;
  videoPrompt: string;
  voicePrompt: string;
  thumbnail: string;
  tags: string[];
  popularity: number;
  isNew?: boolean;
}

export type AspectRatio = '1:1' | '4:5' | '16:9' | '9:16';
export type ImageQuality = 'Standard' | 'High' | 'Ultra';
export type ImageStyle = 
  | 'Realistic' 
  | 'Cinematic' 
  | '3D' 
  | 'Cartoon' 
  | 'Anime' 
  | 'Artistic' 
  | 'Professional Photography';

export type VideoDuration = 5 | 10 | 15;
export type VideoMotion = 'Slow' | 'Natural' | 'Cinematic' | 'Dynamic';
export type VideoCamera = 'Zoom In' | 'Zoom Out' | 'Pan Left' | 'Pan Right' | 'Static';
export type VideoQuality = 'Standard' | 'High' | '4K';

export type VoiceOption = 'male' | 'female' | 'child' | 'radio' | 'story' | 'news';
export type VoiceTone = 'calm' | 'happy' | 'serious' | 'professional';
export type VoiceGender = 'Male' | 'Female';
export type VoiceStyle = 'Male' | 'Female' | 'Natural' | 'Storytelling' | 'News' | 'Friendly';

export type AIModelOption = 'gemini' | 'imagen' | 'stable-diffusion' | 'custom';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
  suggestedAction?: {
    type: 'generate_image' | 'photo_to_video' | 'video_editor' | 'photo_editor' | 'voice';
    label: string;
    prompt: string;
    view: AppView;
  };
  generatedContent?: {
    type: 'image' | 'video' | 'audio';
    url: string;
    title?: string;
  };
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  isSaved?: boolean;
}

export type CreationType = 'image' | 'video' | 'audio' | 'voice' | 'edited-photo';

export interface CreationItem {
  id: string;
  userId: string;
  type: CreationType;
  title: string;
  prompt: string;
  fileUrl: string;
  thumbnailUrl?: string;
  createdAt: number;
  projectId?: string;
  folderId?: string;
  metadata?: {
    aspectRatio?: string;
    quality?: string;
    style?: string;
    duration?: number;
    voiceStyle?: string;
    voice?: string;
    tone?: string;
    speed?: number;
    pitch?: number;
    tool?: string;
    filter?: string;
    camera?: string;
    motion?: string;
    preserveFace?: boolean;
    preservePose?: boolean;
    sourceImage?: string;
    [key: string]: unknown;
  };
}

export interface ProjectFolder {
  id: string;
  name: string;
  itemCount: number;
  createdAt: number;
}

export interface ProjectItem {
  id: string;
  userId: string;
  projectName: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  itemCount: number;
}

export interface UserProfile {
  id?: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  avatar: string;
  profileImage?: string;
  plan: 'Free' | 'Pro';
  remainingCredits: number;
  totalCreations: number;
  joinedDate: number;
  createdAt: number;
  stats: {
    totalImages: number;
    totalVideos: number;
    totalAudios: number;
    totalProjects: number;
  };
}

export interface AppSettings {
  theme: ThemeMode;
  language: Language;
  defaultImageQuality: ImageQuality;
  defaultVideoQuality: VideoQuality;
  defaultLanguage: Language;
  aiModel: AIModelOption;
  customApiKey?: string;
  storageUsedMb: number;
  maxStorageMb: number;
}
