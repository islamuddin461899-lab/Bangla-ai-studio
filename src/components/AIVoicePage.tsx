import React, { useState, useRef } from 'react';
import { 
  Mic2, 
  Play, 
  Pause, 
  Download, 
  Sparkles, 
  Volume2, 
  RefreshCw, 
  RotateCcw,
  Sliders,
  Check
} from 'lucide-react';
import { CreationItem, Language, VoiceOption, VoiceTone } from '../types';
import { translations } from '../i18n/translations';
import { aiService } from '../services/aiService';
import { storageService } from '../services/storageService';

interface AIVoicePageProps {
  initialPrompt?: string;
  language: Language;
}

export const AIVoicePage: React.FC<AIVoicePageProps> = ({
  initialPrompt,
  language
}) => {
  const t = translations[language];
  const isBn = language === 'bn';

  const defaultTextExample = 'বাংলা AI Studio-তে আপনাকে স্বাগতম। এখানে আপনি সহজে ছবি ও ভিডিও তৈরি করতে পারবেন।';
  const [text, setText] = useState<string>(initialPrompt || defaultTextExample);

  // Settings
  const [voice, setVoice] = useState<VoiceOption>('female');
  const [tone, setTone] = useState<VoiceTone>('professional');
  const [speed, setSpeed] = useState<number>(1.0);
  const [pitch, setPitch] = useState<number>(1.0);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState<{
    audioUrl: string;
    duration: number;
    title: string;
  } | null>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Voice options specified in spec
  const voiceOptions = [
    { id: 'male' as VoiceOption, label: t.aiVoice?.voices?.male || (language === 'bn' ? 'পুরুষ কণ্ঠ (Male)' : 'Male Voice') },
    { id: 'female' as VoiceOption, label: t.aiVoice?.voices?.female || (language === 'bn' ? 'নারী কণ্ঠ (Female)' : 'Female Voice') },
    { id: 'child' as VoiceOption, label: t.aiVoice?.voices?.child || (language === 'bn' ? 'শিশু কণ্ঠ (Child)' : 'Child Voice') },
    { id: 'radio' as VoiceOption, label: t.aiVoice?.voices?.radio || (language === 'bn' ? 'রেডিও জকি (Radio Host)' : 'Radio Host') },
    { id: 'story' as VoiceOption, label: t.aiVoice?.voices?.story || (language === 'bn' ? 'গল্প পাঠ (Storytelling)' : 'Storytelling') },
    { id: 'news' as VoiceOption, label: t.aiVoice?.voices?.news || (language === 'bn' ? 'সংবাদ পাঠক (News Anchor)' : 'News Anchor') },
  ];

  // Tone options specified in spec
  const toneOptions = [
    { id: 'calm' as VoiceTone, label: t.aiVoice?.tones?.calm || (language === 'bn' ? 'শান্ত ও ধীর (Calm)' : 'Calm & Gentle') },
    { id: 'happy' as VoiceTone, label: t.aiVoice?.tones?.happy || (language === 'bn' ? 'আনন্দিত (Happy)' : 'Upbeat & Happy') },
    { id: 'serious' as VoiceTone, label: t.aiVoice?.tones?.serious || (language === 'bn' ? 'গম্ভীর (Serious)' : 'Serious') },
    { id: 'professional' as VoiceTone, label: t.aiVoice?.tones?.professional || (language === 'bn' ? 'পেশাদার (Professional)' : 'Professional') },
  ];

  // Browser Web Speech Synthesis fallback/live preview
  const playNativeSpeech = (textToSpeak: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = speed;
      utterance.pitch = pitch;

      // Find Bengali voice if available
      const voices = window.speechSynthesis.getVoices();
      const bnVoice = voices.find(v => v.lang.includes('bn') || v.lang.includes('ben'));
      if (bnVoice) {
        utterance.voice = bnVoice;
      }
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      setIsPlaying(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleGenerateVoice = async () => {
    if (!text.trim()) {
      setErrorMsg(t.errors.emptyPrompt);
      return;
    }

    setErrorMsg(null);
    setIsGenerating(true);

    try {
      const res = await aiService.generateVoice({
        text,
        voice,
        tone,
        speed,
        pitch
      });

      setGeneratedAudio(res);
      setIsGenerating(false);

      // Save to My Creations
      const creation: CreationItem = {
        id: 'cr_voice_' + Date.now(),
        userId: 'usr_default_01',
        type: 'voice',
        title: text.slice(0, 30),
        prompt: text,
        fileUrl: res.audioUrl,
        createdAt: Date.now(),
        metadata: {
          voice,
          tone,
          speed,
          pitch
        }
      };
      storageService.addCreation(creation);

      // Play audio automatically or via native speech
      playNativeSpeech(text);

    } catch (err: any) {
      setIsGenerating(false);
      // Fallback to local speech synthesis
      playNativeSpeech(text);
      setGeneratedAudio({
        audioUrl: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=',
        duration: 5,
        title: text.slice(0, 30)
      });
    }
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    } else {
      if (generatedAudio && audioRef.current && audioRef.current.src) {
        audioRef.current.play().catch(() => {
          playNativeSpeech(text);
        });
        setIsPlaying(true);
      } else {
        playNativeSpeech(text);
      }
    }
  };

  return (
    <div id="ai-voice-container" className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Title Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
            <Mic2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-100">
              {t.aiVoice.title}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400">
              {t.aiVoice.subtitle}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Controls */}
        <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5 space-y-5 shadow-xl">
          {/* Text Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-300">
                {t.aiVoice.promptLabel}
              </label>
              <button
                type="button"
                onClick={() => setText(defaultTextExample)}
                className="text-[11px] text-yellow-400 hover:underline"
              >
                {isBn ? 'উদাহরণ দেখুন' : 'Use Example'}
              </button>
            </div>
            <textarea
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t.aiVoice.promptPlaceholder}
              className="w-full rounded-xl bg-neutral-950 border border-neutral-800 p-3 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-yellow-500/50 resize-none"
            />
          </div>

          {/* Voice Options (6 Options as specified) */}
          <div className="space-y-2 pt-2 border-t border-neutral-850">
            <label className="text-xs font-medium text-neutral-400">
              {t.aiVoice.voiceLabel}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {voiceOptions.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVoice(v.id)}
                  className={`p-2 rounded-xl text-xs font-semibold border text-left transition ${
                    voice === v.id
                      ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
                      : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tone Options (4 Options as specified) */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-neutral-400">
              {t.aiVoice.toneLabel}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {toneOptions.map((toneItem) => (
                <button
                  key={toneItem.id}
                  type="button"
                  onClick={() => setTone(toneItem.id)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-semibold border text-center transition ${
                    tone === toneItem.id
                      ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
                      : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  {toneItem.label}
                </button>
              ))}
            </div>
          </div>

          {/* Speed & Pitch Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-neutral-850">
            {/* Speed Control */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-neutral-400">
                <span>{t.aiVoice.speed}</span>
                <span className="font-mono text-yellow-400">{speed}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full accent-yellow-400 cursor-pointer"
              />
            </div>

            {/* Pitch Control */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-neutral-400">
                <span>{t.aiVoice.pitch}</span>
                <span className="font-mono text-yellow-400">{pitch}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={pitch}
                onChange={(e) => setPitch(parseFloat(e.target.value))}
                className="w-full accent-yellow-400 cursor-pointer"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Button: কণ্ঠ তৈরি করুন */}
          <button
            id="generate-voice-btn"
            type="button"
            onClick={handleGenerateVoice}
            disabled={isGenerating}
            className="w-full py-3.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/20 active:scale-98 transition"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>{isBn ? 'কণ্ঠ তৈরি হচ্ছে...' : 'Generating Voice...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>{t.aiVoice.buttonGenerate}</span>
              </>
            )}
          </button>
        </div>

        {/* Audio Player & Waveform Visualizer */}
        <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-yellow-400" />
              <span>{isBn ? 'অডিও প্লেয়ার' : 'Audio Player'}</span>
            </h3>

            {/* Audio Waveform visualization */}
            <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-8 flex flex-col items-center justify-center space-y-4 min-h-[220px]">
              <div className="flex items-center gap-1.5 h-16 w-full justify-center">
                {Array.from({ length: 30 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 rounded-full transition-all duration-200 ${
                      isPlaying 
                        ? 'bg-yellow-400 animate-pulse' 
                        : 'bg-neutral-800'
                    }`}
                    style={{
                      height: isPlaying ? `${20 + Math.sin(i + Date.now() / 200) * 50 + 20}%` : '25%'
                    }}
                  />
                ))}
              </div>

              <p className="text-xs text-neutral-400 text-center max-w-sm line-clamp-2">
                "{text}"
              </p>
            </div>

            <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />
          </div>

          {/* Player controls: Play, Pause, Download MP3 as specified */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <button
                onClick={handleTogglePlay}
                className="flex-1 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-yellow-500/20 active:scale-95 transition"
              >
                {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
                <span>{isPlaying ? t.aiVoice.pause : t.aiVoice.play}</span>
              </button>

              <a
                href={generatedAudio?.audioUrl || '#'}
                download="bangla-ai-voice.mp3"
                onClick={(e) => {
                  if (!generatedAudio) {
                    e.preventDefault();
                    alert(isBn ? 'প্রথমে "কণ্ঠ তৈরি করুন" চাপুন' : 'Please generate voice first');
                  }
                }}
                className="flex items-center gap-1.5 py-3 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-200 text-xs font-semibold border border-neutral-700 transition"
              >
                <Download className="h-4 w-4 text-yellow-400" />
                <span>{t.aiVoice.downloadMp3}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
