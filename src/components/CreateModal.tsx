import React from 'react';
import { 
  X, 
  Image as ImageIcon, 
  Crop, 
  ImagePlus, 
  Clapperboard, 
  Video, 
  Film, 
  Mic2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { AppView, Language } from '../types';
import { translations } from '../i18n/translations';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (view: AppView) => void;
  language: Language;
}

export const CreateModal: React.FC<CreateModalProps> = ({
  isOpen,
  onClose,
  onSelectTool,
  language
}) => {
  if (!isOpen) return null;

  const t = translations[language];
  const isBn = language === 'bn';

  const menuItems = [
    {
      id: 'text-to-image',
      title: isBn ? 'Create Image' : 'Create Image',
      sub: isBn ? 'টেক্সট বর্ণনা থেকে হাই-রেজ্যুলেশন ছবি তৈরি করুন' : 'Generate high-res artwork from detailed text prompts',
      icon: ImageIcon,
      view: 'text-to-image' as AppView,
      gradient: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30'
    },
    {
      id: 'photo-editor',
      title: isBn ? 'Edit Photo' : 'Edit Photo',
      sub: isBn ? 'ব্যাকগ্রাউন্ড অপসারণ, পোশাক বদল ও AI রিটাচিং' : 'Remove BG, change clothes, object removal and AI retouch',
      icon: Crop,
      view: 'photo-editor' as AppView,
      gradient: 'from-blue-500/20 to-cyan-500/20 text-cyan-400 border-cyan-500/30'
    },
    {
      id: 'image-to-image',
      title: isBn ? 'Image to Image' : 'Image to Image',
      sub: isBn ? 'ছবি আপলোড করে নতুন পরিবেশ বা স্টাইলে পুনর্নির্মাণ' : 'Recreate portraits in new studio lighting and styles',
      icon: ImagePlus,
      view: 'image-to-image' as AppView,
      gradient: 'from-violet-500/20 to-purple-500/20 text-violet-400 border-violet-500/30'
    },
    {
      id: 'photo-to-video',
      title: isBn ? 'Photo to Video' : 'Photo to Video',
      sub: isBn ? 'স্থির ছবিতে সিনেমাটিক মোশন ও ক্যামেরা মুভমেন্ট যোগ করুন' : 'Animate still photos into lifelike video moments',
      icon: Clapperboard,
      view: 'photo-to-video' as AppView,
      gradient: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30'
    },
    {
      id: 'text-to-video',
      title: isBn ? 'Text to Video' : 'Text to Video',
      sub: isBn ? 'শুধু বিবরণ লিখে সম্পূর্ণ নতুন মোশন ক্লিপ বানান' : 'Create video footage purely from scene descriptions',
      icon: Video,
      view: 'text-to-video' as AppView,
      gradient: 'from-rose-500/20 to-pink-500/20 text-rose-400 border-rose-500/30'
    },
    {
      id: 'video-editor',
      title: isBn ? 'Edit Video' : 'Edit Video',
      sub: isBn ? 'টাইমলাইন ট্রিমার, স্পিড, অডিও ও স্বয়ংক্রিয় বাংলা ক্যাপশন' : 'Timeline cut, speed ramp, filters & AI subtitles',
      icon: Film,
      view: 'video-editor' as AppView,
      gradient: 'from-indigo-500/20 to-sky-500/20 text-indigo-400 border-indigo-500/30'
    },
    {
      id: 'ai-voice',
      title: isBn ? 'Create Voice' : 'Create Voice',
      sub: isBn ? 'যেকোনো স্ক্রিপ্টকে প্রফেশনাল বাংলা/ইংরেজি কণ্ঠে রূপান্তর' : 'Convert text to voiceover with natural tones',
      icon: Mic2,
      view: 'ai-voice' as AppView,
      gradient: 'from-yellow-500/20 to-amber-500/20 text-yellow-400 border-yellow-500/30'
    },
  ];

  return (
    <div 
      id="create-menu-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-100">
                {isBn ? 'নতুন কিছু তৈরি করুন' : 'Create New Asset'}
              </h2>
              <p className="text-xs text-neutral-400">
                {isBn ? 'আপনার পছন্দের AI টুল বা প্রম্পট নির্বাচন করুন' : 'Select your desired AI creative tool or prompt'}
              </p>
            </div>
          </div>
          <button
            id="close-create-modal"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Featured Prompt Library Banner */}
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-teal-500/15 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>{isBn ? '✨ ১০০০+ AI প্রম্পট লাইব্রেরি' : '✨ 1000+ AI Prompts Library'}</span>
            </div>
            <p className="text-xs text-neutral-300">
              {isBn 
                ? 'রেডিমেড সিনেমাটিক ও ভাইরাল ফটো/ভিডিও প্রম্পট ব্রাউজ করুন এবং ১ ক্লিকে তৈরি করুন।' 
                : 'Browse curated viral and cinematic prompts ready for 1-click photo & video creation.'}
            </p>
          </div>
          <button
            onClick={() => {
              onSelectTool('prompt-library');
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-bold whitespace-nowrap shadow-sm transition"
          >
            {isBn ? 'প্রম্পট দেখুন →' : 'Explore Prompts →'}
          </button>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                id={`create-tool-${item.id}`}
                onClick={() => {
                  onSelectTool(item.view);
                  onClose();
                }}
                className="group flex items-start gap-3.5 p-3.5 rounded-xl bg-neutral-850/60 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/80 transition-all text-left"
              >
                <div className={`p-2.5 rounded-xl border ${item.gradient} shrink-0 group-hover:scale-105 transition-transform`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-neutral-200 group-hover:text-emerald-400 transition-colors">
                      {item.title}
                    </h3>
                    <ArrowRight className="h-3.5 w-3.5 text-neutral-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-xs text-neutral-400 line-clamp-2 mt-0.5">
                    {item.sub}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
