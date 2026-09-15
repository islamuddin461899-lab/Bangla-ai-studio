import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  MessageSquare, 
  Image as ImageIcon, 
  Crop, 
  ImagePlus, 
  Clapperboard, 
  Video, 
  Film, 
  Mic2, 
  Layers,
  ArrowRight,
  Zap,
  CheckCircle2,
  FolderKanban
} from 'lucide-react';
import { AppView, CreationItem, Language } from '../types';
import { translations } from '../i18n/translations';

interface HomePageProps {
  onNavigate: (view: AppView, initialPrompt?: string) => void;
  language: Language;
  creations: CreationItem[];
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  language,
  creations
}) => {
  const [promptText, setPromptText] = useState('');
  const [isRouting, setIsRouting] = useState(false);
  const t = translations[language];
  const isBn = language === 'bn';

  // Intelligent Command Routing from Hero Prompt Box
  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim()) return;

    setIsRouting(true);
    const p = promptText.toLowerCase();

    setTimeout(() => {
      setIsRouting(false);
      // Determine tool
      if (
        (p.includes('ভিডিও') || p.includes('video')) && 
        (p.includes('বানাও') || p.includes('ছবি থেকে') || p.includes('from photo') || p.includes('মোশন'))
      ) {
        onNavigate('photo-to-video', promptText);
      } else if (
        (p.includes('ভিডিও') || p.includes('video')) && 
        (p.includes('টেক্সট') || p.includes('লেখা থেকে') || p.includes('scene') || p.includes('দৃশ্য'))
      ) {
        onNavigate('text-to-video', promptText);
      } else if (
        (p.includes('ভিডিও') || p.includes('video')) && 
        (p.includes('এডিট') || p.includes('edit') || p.includes('কাট') || p.includes('ক্যাপশন') || p.includes('trim'))
      ) {
        onNavigate('video-editor', promptText);
      } else if (
        (p.includes('ছবি') || p.includes('image') || p.includes('photo')) && 
        (p.includes('এডিট') || p.includes('edit') || p.includes('ব্যাকগ্রাউন্ড') || p.includes('পোশাক'))
      ) {
        onNavigate('photo-editor', promptText);
      } else if (
        (p.includes('ছবি') || p.includes('image') || p.includes('photo') || p.includes('আঁক')) && 
        (p.includes('বানাও') || p.includes('তৈরি') || p.includes('create') || p.includes('generate'))
      ) {
        onNavigate('text-to-image', promptText);
      } else if (
        p.includes('ভয়েস') || p.includes('voice') || p.includes('কণ্ঠ') || p.includes('কথা বল') || p.includes('speech')
      ) {
        onNavigate('ai-voice', promptText);
      } else {
        // Default to AI Chat (Bangla ChatGPT)
        onNavigate('chat', promptText);
      }
    }, 400);
  };

  // Quick Action Cards configuration
  const quickActions = [
    {
      id: 'ai-chat',
      title: t.quickActions.aiChat,
      desc: t.quickActions.aiChatDesc,
      icon: MessageSquare,
      view: 'chat' as AppView,
      gradient: 'from-emerald-500/10 to-teal-500/10 text-emerald-400 border-emerald-500/20 hover:border-emerald-500/50'
    },
    {
      id: 'text-to-image',
      title: t.quickActions.textToImage,
      desc: t.quickActions.textToImageDesc,
      icon: ImageIcon,
      view: 'text-to-image' as AppView,
      gradient: 'from-amber-500/10 to-orange-500/10 text-amber-400 border-amber-500/20 hover:border-amber-500/50'
    },
    {
      id: 'photo-edit',
      title: t.quickActions.photoEdit,
      desc: t.quickActions.photoEditDesc,
      icon: Crop,
      view: 'photo-editor' as AppView,
      gradient: 'from-cyan-500/10 to-blue-500/10 text-cyan-400 border-cyan-500/20 hover:border-cyan-500/50'
    },
    {
      id: 'image-to-image',
      title: t.quickActions.imageToImage,
      desc: t.quickActions.imageToImageDesc,
      icon: ImagePlus,
      view: 'image-to-image' as AppView,
      gradient: 'from-violet-500/10 to-purple-500/10 text-violet-400 border-violet-500/20 hover:border-violet-500/50'
    },
    {
      id: 'photo-to-video',
      title: t.quickActions.photoToVideo,
      desc: t.quickActions.photoToVideoDesc,
      icon: Clapperboard,
      view: 'photo-to-video' as AppView,
      gradient: 'from-rose-500/10 to-red-500/10 text-rose-400 border-rose-500/20 hover:border-rose-500/50'
    },
    {
      id: 'text-to-video',
      title: t.quickActions.textToVideo,
      desc: t.quickActions.textToVideoDesc,
      icon: Video,
      view: 'text-to-video' as AppView,
      gradient: 'from-fuchsia-500/10 to-pink-500/10 text-fuchsia-400 border-fuchsia-500/20 hover:border-fuchsia-500/50'
    },
    {
      id: 'video-edit',
      title: t.quickActions.videoEdit,
      desc: t.quickActions.videoEditDesc,
      icon: Film,
      view: 'video-editor' as AppView,
      gradient: 'from-sky-500/10 to-indigo-500/10 text-sky-400 border-sky-500/20 hover:border-sky-500/50'
    },
    {
      id: 'ai-voice',
      title: t.quickActions.aiVoice,
      desc: t.quickActions.aiVoiceDesc,
      icon: Mic2,
      view: 'ai-voice' as AppView,
      gradient: 'from-yellow-500/10 to-amber-500/10 text-yellow-400 border-yellow-500/20 hover:border-yellow-500/50'
    },
    {
      id: 'my-creations',
      title: t.quickActions.myCreations,
      desc: t.quickActions.myCreationsDesc,
      icon: Layers,
      view: 'creations' as AppView,
      gradient: 'from-neutral-500/10 to-neutral-600/10 text-neutral-300 border-neutral-700/50 hover:border-neutral-500'
    },
  ];

  // Example Prompt Suggestions
  const samplePrompts = [
    'একটি সুন্দর বাংলাদেশের গ্রামের ছবি বানাও',
    'এই ছবিটাকে সিনেমাটিক মোশন ভিডিও বানাও',
    'ছবির ব্যাকগ্রাউন্ড পরিবর্তন করে স্টুডিও ব্যাকগ্রাউন্ড দাও',
    'বাংলায় একটি শুভেচ্ছা বক্তব্য অডিও তৈরি কর'
  ];

  return (
    <div id="home-page" className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-10">
      {/* 1. HERO SECTION */}
      <section className="text-center space-y-5 pt-2 sm:pt-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5" />
          <span>{isBn ? 'অল-ইন-ওয়ান আধুনিক বাংলা ক্রিয়েটিভ স্টুডিও' : 'All-in-One Creative Studio'}</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-neutral-100 tracking-tight leading-tight max-w-4xl mx-auto">
          {t.appTagline}
        </h1>

        {/* Subheading */}
        <p className="text-sm sm:text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed">
          {t.appSubheading}
        </p>

        {/* 2. BIG AI PROMPT BOX WITH INTELLIGENT COMMAND ROUTING */}
        <div className="max-w-3xl mx-auto pt-2">
          <form 
            onSubmit={handleHeroSubmit}
            className="relative flex flex-col sm:flex-row items-stretch rounded-2xl bg-neutral-900 border border-neutral-800 p-2 shadow-2xl focus-within:border-emerald-500/60 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all"
          >
            <div className="flex-1 flex items-center px-3 min-h-[52px]">
              <Sparkles className="h-5 w-5 text-emerald-400 shrink-0 mr-3" />
              <input
                id="hero-prompt-input"
                type="text"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder={t.promptPlaceholder}
                className="w-full bg-transparent text-sm sm:text-base text-neutral-100 placeholder-neutral-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 p-1">
              <button
                id="hero-prompt-send-button"
                type="submit"
                disabled={!promptText.trim() || isRouting}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-neutral-950 font-semibold text-sm hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all shadow-md shadow-emerald-500/20"
              >
                {isRouting ? (
                  <span className="inline-block animate-spin">⟳</span>
                ) : (
                  <>
                    <span>{t.send}</span>
                    <Send className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick prompt suggestions */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-xs text-neutral-400">
            <span className="text-neutral-500">{isBn ? 'পরামর্শ:' : 'Try:'}</span>
            {samplePrompts.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPromptText(sample)}
                className="px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 hover:border-emerald-500/40 hover:text-neutral-200 transition truncate max-w-[240px] sm:max-w-none"
              >
                {sample}
              </button>
            ))}
          </div>

          {/* ✨ 1000+ AI Prompts Featured Banner */}
          <div className="pt-5">
            <div className="p-1 rounded-2xl bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500 shadow-xl">
              <div className="p-4 sm:p-5 rounded-[14px] bg-neutral-950 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="h-11 w-11 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Sparkles className="h-5 w-5 animate-pulse" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                      <span>{isBn ? '✨ ১০০০+ তৈরি AI ফটো ও ভিডিও প্রম্পট' : '✨ 1000+ Ready AI Prompts'}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">২৫টি ক্যাটাগরি</span>
                    </h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {isBn ? 'গ্রাম, বাজার, স্কুল, শিশু, কৃষক ও সিনেমাটিক গল্পের রেডি প্রম্পট দিয়ে এক ক্লিকে ছবি/ভিডিও বানান' : 'Generate cinematic photos and videos in 1-click with ready prompts'}
                    </p>
                  </div>
                </div>

                <button
                  id="home-1000-prompts-btn"
                  onClick={() => onNavigate('prompt-library')}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-emerald-400 hover:from-amber-300 hover:to-emerald-300 text-neutral-950 font-extrabold text-xs shadow-md shadow-emerald-500/20 hover:scale-105 active:scale-95 transition shrink-0"
                >
                  <Sparkles className="h-3.5 w-3.5 text-neutral-950" />
                  <span>✨ 1000+ AI Prompts</span>
                  <ArrowRight className="h-3.5 w-3.5 text-neutral-950" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. QUICK ACTION CARDS (9 CARDS) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-neutral-200 flex items-center gap-2">
            <Zap className="h-4 w-4 text-emerald-400" />
            <span>{isBn ? 'দ্রুত শুরু করুন (Quick Actions)' : 'Quick Actions'}</span>
          </h2>
          <span className="text-xs text-neutral-500">
            {isBn ? '৯টি আধুনিক ফিচার' : '9 Modern Features'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                id={`quick-action-card-${action.id}`}
                onClick={() => onNavigate(action.view)}
                className="group relative flex items-start gap-4 p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800/90 hover:bg-neutral-850 hover:border-neutral-700 transition-all duration-200 text-left shadow-sm"
              >
                <div className={`p-3 rounded-xl border ${action.gradient} shrink-0 group-hover:scale-105 transition-transform`}>
                  <Icon className="h-5 w-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm sm:text-base text-neutral-200 group-hover:text-emerald-400 transition-colors">
                      {action.title}
                    </span>
                    <ArrowRight className="h-4 w-4 text-neutral-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                    {action.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. RECENT CREATIONS GALLERY STRIP */}
      {creations.length > 0 && (
        <section className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-neutral-200 flex items-center gap-2">
              <Layers className="h-4 w-4 text-emerald-400" />
              <span>{isBn ? 'সাম্প্রতিক ক্রিয়েশনস' : 'Recent Creations'}</span>
            </h2>
            <button
              onClick={() => onNavigate('creations')}
              className="text-xs font-medium text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>{isBn ? 'সবগুলো দেখুন' : 'View All'}</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {creations.slice(0, 4).map((item) => (
              <div
                key={item.id}
                onClick={() => onNavigate('creations')}
                className="group relative rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 cursor-pointer aspect-video"
              >
                <img
                  src={item.thumbnailUrl || item.fileUrl}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5">
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                      {item.type}
                    </span>
                    <span className="text-xs text-white font-medium truncate block">
                      {item.title}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. CAPABILITIES HIGHLIGHTS */}
      <section className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-950/30 via-neutral-900 to-neutral-900 border border-emerald-900/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-sm sm:text-base font-bold text-neutral-100 flex items-center justify-center sm:justify-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{isBn ? 'বাংলায় প্রাকৃতিক বুদ্ধিমত্তা (Bangla AI Experience)' : 'Bangla AI Experience'}</span>
          </h3>
          <p className="text-xs text-neutral-400">
            {isBn 
              ? 'চ্যাট করুন, যে কোনো ক্রিয়েটিভ আর্ট জেনারেট করুন এবং একই ড্যাশবোর্ড থেকে সংরক্ষণ করুন।'
              : 'Chat, generate artwork, and edit media all within a unified platform.'}
          </p>
        </div>
        <button
          onClick={() => onNavigate('chat')}
          className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-xs font-semibold text-neutral-200 border border-neutral-700 transition shrink-0"
        >
          {isBn ? 'চ্যাট শুরু করুন' : 'Start Chat'}
        </button>
      </section>
    </div>
  );
};
