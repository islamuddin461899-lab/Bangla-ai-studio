import { translations } from '../i18n/translations';
import { AspectRatio, ImageQuality, ImageStyle, VideoCamera, VideoDuration, VideoMotion, VideoQuality } from '../types';

export interface ChatResponse {
  text: string;
  intent: 'image' | 'photo_to_video' | 'video_editor' | 'photo_editor' | 'voice' | 'chat';
  extractedPrompt?: string;
  suggestedAction?: {
    type: 'generate_image' | 'photo_to_video' | 'video_editor' | 'photo_editor' | 'voice';
    label: string;
    prompt: string;
    view: string;
  };
}

export const aiService = {
  // 1. Send Chat Message
  async sendChatMessage(prompt: string, history: Array<{ sender: 'user' | 'assistant'; text: string }>, language: 'bn' | 'en' = 'bn'): Promise<ChatResponse> {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, messages: history, language })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Chat error:', error);
      throw new Error(translations.bn.errors.apiError);
    }
  },

  // 2. Generate Image (Text to Image & Image to Image)
  async generateImage(params: {
    prompt: string;
    style?: ImageStyle;
    aspectRatio?: AspectRatio;
    quality?: ImageQuality;
    numImages?: number;
    sourceImage?: string;
    preserveFace?: boolean;
    preservePose?: boolean;
    preserveClothes?: boolean;
  }): Promise<Array<{ url: string; title: string }>> {
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        throw new Error('Image generation failed');
      }

      const data = await response.json();
      return data.images || [];
    } catch (error) {
      console.error('Generate image error:', error);
      throw new Error(translations.bn.errors.apiError);
    }
  },

  // 3. Generate Video (Photo to Video & Text to Video)
  async generateVideo(params: {
    prompt: string;
    sourceImage?: string;
    duration?: VideoDuration;
    aspectRatio?: AspectRatio;
    motion?: VideoMotion;
    camera?: VideoCamera;
    quality?: VideoQuality;
    style?: string;
  }): Promise<{ videoUrl: string; thumbnailUrl: string; title: string }> {
    try {
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        throw new Error('Video generation failed');
      }

      const data = await response.json();
      return {
        videoUrl: data.videoUrl,
        thumbnailUrl: data.thumbnailUrl,
        title: data.title
      };
    } catch (error) {
      console.error('Video generation error:', error);
      throw new Error(translations.bn.errors.videoGenError);
    }
  },

  // 4. Edit Photo with AI
  async editPhoto(params: {
    image: string;
    editPrompt: string;
    tool?: string;
  }): Promise<{ editedImageUrl: string; feedback: string }> {
    try {
      const response = await fetch('/api/edit-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        throw new Error('Photo edit failed');
      }

      const data = await response.json();
      return {
        editedImageUrl: data.editedImageUrl,
        feedback: data.feedback
      };
    } catch (error) {
      console.error('Edit photo error:', error);
      throw new Error(translations.bn.errors.apiError);
    }
  },

  // 5. Synthesize Voice with Web Speech API and backend
  speakVoice(text: string, language: 'বাংলা' | 'English', onEnd?: () => void, onError?: () => void) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onError) onError();
      return;
    }

    window.speechSynthesis.cancel(); // cancel prior speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'বাংলা' ? 'bn-BD' : 'en-US';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    // Pick best available voice matching language
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(v => 
      language === 'বাংলা' ? (v.lang.startsWith('bn') || v.name.includes('Bangla') || v.name.includes('Bengali')) : v.lang.startsWith('en')
    );
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onend = () => {
      if (onEnd) onEnd();
    };
    utterance.onerror = (e) => {
      console.warn('Speech synthesis notice:', e);
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  },

  stopVoice() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  },

  // 6. Generate Voice via API
  async generateVoice(params: {
    text: string;
    voice?: string;
    tone?: string;
    speed?: number;
    pitch?: number;
  }): Promise<{ audioUrl: string; duration: number; title: string }> {
    try {
      const response = await fetch('/api/generate-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        throw new Error('Voice generation failed');
      }

      const data = await response.json();
      return {
        audioUrl: data.audioUrl || 'https://actions.google.com/sounds/v1/speech/hello_there.ogg',
        duration: data.duration || 5,
        title: params.text.slice(0, 30)
      };
    } catch {
      return {
        audioUrl: 'https://actions.google.com/sounds/v1/speech/hello_there.ogg',
        duration: 5,
        title: params.text.slice(0, 30)
      };
    }
  }
};
