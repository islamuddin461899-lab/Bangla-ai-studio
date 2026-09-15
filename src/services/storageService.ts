import { ChatSession, CreationItem, ProjectFolder, ProjectItem, UserProfile, AppSettings } from '../types';

const STORAGE_KEYS = {
  SESSIONS: 'bangla_ai_chat_sessions',
  ACTIVE_SESSION: 'bangla_ai_active_session_id',
  CREATIONS: 'bangla_ai_creations',
  PROJECTS: 'bangla_ai_projects',
  FOLDERS: 'bangla_ai_folders',
  PROFILE: 'bangla_ai_user_profile',
  PERSISTENT_AVATAR: 'bangla_ai_user_persistent_avatar',
  SETTINGS: 'bangla_ai_settings',
  SAVED_PROMPTS: 'bangla_ai_saved_prompts',
};

// Initial Seed Data
const INITIAL_PROFILE: UserProfile = {
  id: 'usr_default_01',
  userId: 'usr_default_01',
  name: 'ইসলাম উদ্দিন (Islam Uddin)',
  email: 'islamuddin461899@gmail.com',
  phone: '+880 1712-345678',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  plan: 'Pro',
  remainingCredits: 150,
  totalCreations: 14,
  joinedDate: Date.now() - 1000 * 60 * 60 * 24 * 30,
  createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
  stats: {
    totalImages: 8,
    totalVideos: 4,
    totalAudios: 2,
    totalProjects: 3
  }
};

const INITIAL_FOLDERS: ProjectFolder[] = [
  { id: 'fld_yt', name: 'YouTube Videos', itemCount: 4, createdAt: Date.now() - 1000 * 60 * 60 * 48 },
  { id: 'fld_fb', name: 'Facebook Posts', itemCount: 6, createdAt: Date.now() - 1000 * 60 * 60 * 36 },
  { id: 'fld_photo', name: 'Photography', itemCount: 4, createdAt: Date.now() - 1000 * 60 * 60 * 24 },
];

const INITIAL_PROJECTS: ProjectItem[] = [
  {
    id: 'proj_01',
    userId: 'usr_default_01',
    projectName: 'আমার নতুন Project',
    description: 'বাংলাদেশি ঐতিহ্য এবং আধুনিক ডিজিটাল আর্টের সমন্বয়',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
    updatedAt: Date.now() - 1000 * 60 * 60 * 2,
    itemCount: 4
  }
];

const INITIAL_CREATIONS: CreationItem[] = [
  {
    id: 'cr_01',
    userId: 'usr_default_01',
    type: 'image',
    title: 'বাংলাদেশের সবুজ গ্রাম ও সকালের আলো',
    prompt: 'বাংলাদেশের একটি সুন্দর গ্রাম, সবুজ ধানের ক্ষেত, পাশে পুকুর, নারকেল গাছ, সকালের আলো, cinematic realistic photography',
    fileUrl: 'https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?auto=format&fit=crop&w=1200&q=80',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    folderId: 'fld_photo',
    metadata: {
      aspectRatio: '16:9',
      quality: 'High',
      style: 'Cinematic'
    }
  },
  {
    id: 'cr_02',
    userId: 'usr_default_01',
    type: 'video',
    title: 'প্রাকৃতিক নদীর ঢেউ ও সূর্যাস্ত মোশন',
    prompt: 'ক্যামেরা ধীরে ধীরে নদীর ওপর দিয়ে এগিয়ে যাবে, সূর্যাস্তের সোনালী আভা পানিতে প্রতিফলিত হবে',
    fileUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
    folderId: 'fld_yt',
    metadata: {
      duration: 10,
      aspectRatio: '16:9',
      motion: 'Cinematic'
    }
  },
  {
    id: 'cr_03',
    userId: 'usr_default_01',
    type: 'edited-photo',
    title: 'স্টুডিও লাইটিং ও রিটাচ পোর্ট্রেট',
    prompt: 'ব্যক্তির পোশাক নীল রঙের করে দিন এবং পেছনে সুন্দর স্টুডিও ব্যাকগ্রাউন্ড দিন',
    fileUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    createdAt: Date.now() - 1000 * 60 * 60 * 12,
    folderId: 'fld_fb',
    metadata: {
      style: 'Professional Photography'
    }
  },
  {
    id: 'cr_04',
    userId: 'usr_default_01',
    type: 'audio',
    title: 'বাংলা AI শুভেচ্ছা ভয়েস',
    prompt: 'শুভ সকাল! বাংলা AI Studio-তে আপনাকে স্বাগতম।',
    fileUrl: 'https://actions.google.com/sounds/v1/water/waves_crashing_on_rock_beach.ogg',
    createdAt: Date.now() - 1000 * 60 * 60 * 4,
    metadata: {
      voiceStyle: 'Natural'
    }
  }
];

const INITIAL_SETTINGS: AppSettings = {
  theme: 'dark',
  language: 'bn',
  defaultImageQuality: 'High',
  defaultVideoQuality: 'High',
  defaultLanguage: 'bn',
  aiModel: 'gemini',
  storageUsedMb: 18.4,
  maxStorageMb: 100
};

export const storageService = {
  // Profile
  getProfile(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      const profile: UserProfile = data ? JSON.parse(data) : { ...INITIAL_PROFILE };
      
      // Check if user has set a persistent custom avatar from gallery
      const persistentAvatar = localStorage.getItem(STORAGE_KEYS.PERSISTENT_AVATAR);
      if (persistentAvatar) {
        profile.avatar = persistentAvatar;
        profile.profileImage = persistentAvatar;
      }

      return profile;
    } catch {
      const fallback = { ...INITIAL_PROFILE };
      try {
        const persistentAvatar = localStorage.getItem(STORAGE_KEYS.PERSISTENT_AVATAR);
        if (persistentAvatar) {
          fallback.avatar = persistentAvatar;
          fallback.profileImage = persistentAvatar;
        }
      } catch {
        // ignore
      }
      return fallback;
    }
  },
  getUserProfile(): UserProfile {
    return this.getProfile();
  },
  saveProfile(profile: UserProfile): void {
    try {
      // If profile has an avatar, ensure it is locked into persistent storage
      if (profile.avatar) {
        localStorage.setItem(STORAGE_KEYS.PERSISTENT_AVATAR, profile.avatar);
      }
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.warn('Storage error in saveProfile:', e);
    }
  },
  saveUserProfile(profile: UserProfile): void {
    this.saveProfile(profile);
  },
  updateUserAvatar(avatarDataUrl: string): UserProfile {
    try {
      localStorage.setItem(STORAGE_KEYS.PERSISTENT_AVATAR, avatarDataUrl);
      const current = this.getProfile();
      current.avatar = avatarDataUrl;
      current.profileImage = avatarDataUrl;
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(current));
      return current;
    } catch (e) {
      console.warn('Error updating avatar:', e);
      const current = this.getProfile();
      current.avatar = avatarDataUrl;
      return current;
    }
  },

  // Settings
  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  },
  saveSettings(settings: AppSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  // Sessions
  getSessions(): ChatSession[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      if (!data) {
        const defaultSession: ChatSession = {
          id: 'session_welcome',
          userId: 'usr_default_01',
          title: 'স্বাগতম ও সাধারণ সহায়তা',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          messages: [
            {
              id: 'm_welcome',
              sender: 'assistant',
              text: 'নমস্কার! আমি "বাংলা AI Studio" এর বুদ্ধিমান সহকারী। আপনি বাংলায় যে কোনো প্রশ্ন করতে পারেন, ছবি তৈরি করতে পারেন, অথবা ভিডিও তৈরির নির্দেশ দিতে পারেন। আজ আপনি কী তৈরি করতে চান?',
              timestamp: Date.now(),
              suggestedAction: {
                type: 'generate_image',
                label: 'একটি ছবি তৈরি করুন',
                prompt: 'বাংলাদেশের একটি সুন্দর গ্রাম, সবুজ ধানের ক্ষেত, পাশে পুকুর, নারকেল গাছ',
                view: 'text-to-image'
              }
            }
          ]
        };
        localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify([defaultSession]));
        return [defaultSession];
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },
  saveSessions(sessions: ChatSession[]): void {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  },

  // Creations
  getCreations(): CreationItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CREATIONS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.CREATIONS, JSON.stringify(INITIAL_CREATIONS));
        return INITIAL_CREATIONS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_CREATIONS;
    }
  },
  saveCreations(creations: CreationItem[]): void {
    localStorage.setItem(STORAGE_KEYS.CREATIONS, JSON.stringify(creations));
  },
  addCreation(item: CreationItem): void {
    const all = storageService.getCreations();
    all.unshift(item);
    storageService.saveCreations(all);

    // Update profile stats
    const profile = storageService.getProfile();
    profile.totalCreations += 1;
    if (item.type === 'image' || item.type === 'edited-photo') {
      profile.stats.totalImages += 1;
    } else if (item.type === 'video') {
      profile.stats.totalVideos += 1;
    } else if (item.type === 'audio' || item.type === 'voice') {
      profile.stats.totalAudios += 1;
    }
    storageService.saveProfile(profile);
  },
  deleteCreation(id: string): void {
    const all = storageService.getCreations().filter(c => c.id !== id);
    storageService.saveCreations(all);
  },

  // Folders & Projects
  getFolders(): ProjectFolder[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FOLDERS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(INITIAL_FOLDERS));
        return INITIAL_FOLDERS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_FOLDERS;
    }
  },
  saveFolders(folders: ProjectFolder[]): void {
    localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(folders));
  },
  getProjects(): ProjectItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(INITIAL_PROJECTS));
        return INITIAL_PROJECTS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_PROJECTS;
    }
  },
  saveProjects(projects: ProjectItem[]): void {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  },

  // Saved Prompts
  getSavedPrompts(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SAVED_PROMPTS);
      return data ? JSON.parse(data) : ['pr_bangladeshi-village_0001', 'pr_farmer_0001', 'pr_eid_0001'];
    } catch {
      return ['pr_bangladeshi-village_0001', 'pr_farmer_0001', 'pr_eid_0001'];
    }
  },
  saveSavedPrompts(ids: string[]): void {
    localStorage.setItem(STORAGE_KEYS.SAVED_PROMPTS, JSON.stringify(ids));
  },
  toggleSavePrompt(id: string): boolean {
    const list = storageService.getSavedPrompts();
    const exists = list.includes(id);
    const updated = exists ? list.filter(item => item !== id) : [...list, id];
    storageService.saveSavedPrompts(updated);
    return !exists;
  },
  isPromptSaved(id: string): boolean {
    return storageService.getSavedPrompts().includes(id);
  },

  // Clear all data
  clearAll(): void {
    localStorage.removeItem(STORAGE_KEYS.SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.CREATIONS);
    localStorage.removeItem(STORAGE_KEYS.PROJECTS);
    localStorage.removeItem(STORAGE_KEYS.FOLDERS);
  }
};
