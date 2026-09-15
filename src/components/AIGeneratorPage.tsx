import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Upload, 
  Image as ImageIcon, 
  Video, 
  Download, 
  RefreshCw, 
  Edit3, 
  X, 
  Check, 
  Eye, 
  Layers, 
  Sliders, 
  BookOpen, 
  Play, 
  Pause, 
  Film, 
  Wand2,
  Copy,
  Clipboard,
  CheckCircle2,
  Info
} from 'lucide-react';
import { 
  AppView, 
  AspectRatio, 
  CharacterAgeBracket, 
  CreationItem, 
  GeneratorGender, 
  GeneratorStyle, 
  Language 
} from '../types';
import { storageService } from '../services/storageService';
import { downloadMediaToGallery } from '../utils/downloadUtils';
import { AGE_BRACKETS } from '../data/promptLibraryData';

interface AIGeneratorPageProps {
  initialPrompt?: string;
  initialAge?: CharacterAgeBracket;
  initialMode?: 'photo' | 'video';
  language: Language;
  onNavigate: (view: AppView, prompt?: string) => void;
  onCreationAdded: (item: CreationItem) => void;
}

const STYLES: { id: GeneratorStyle; nameBn: string; nameEn: string; icon: string }[] = [
  { id: 'Photorealistic', nameBn: 'ফটোরিয়ালিস্টিক', nameEn: 'Photorealistic', icon: '📸' },
  { id: 'Cinematic', nameBn: 'সিনেমাটিক', nameEn: 'Cinematic', icon: '🎬' },
  { id: '3D Animation', nameBn: '3D অ্যানিমেশন', nameEn: '3D Animation', icon: '🎨' },
  { id: 'Cartoon', nameBn: 'কার্টুন', nameEn: 'Cartoon', icon: '🧸' },
  { id: 'Realistic', nameBn: 'রিয়েলিস্টিক', nameEn: 'Realistic', icon: '✨' },
  { id: 'Studio', nameBn: 'স্টুডিও কোয়ালিটি', nameEn: 'Studio', icon: '💡' },
  { id: 'Village', nameBn: 'গ্রামের আবহ', nameEn: 'Village Life', icon: '🏡' },
  { id: 'Social Media', nameBn: 'সোশ্যাল মিডিয়া রিল', nameEn: 'Social Media', icon: '📱' },
];

const ASPECT_RATIOS: { id: AspectRatio; label: string; desc: string; iconRatio: string }[] = [
  { id: '9:16', label: '9:16', desc: 'TikTok, Reels, Shorts', iconRatio: 'h-6 w-3.5' },
  { id: '16:9', label: '16:9', desc: 'YouTube, Landscape', iconRatio: 'h-3.5 w-6' },
  { id: '1:1', label: '1:1', desc: 'Square, Instagram', iconRatio: 'h-5 w-5' }
];

const SAMPLE_PHOTO_OUTPUTS = [
  'https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1506863530036-1efeddceb993?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1200&q=80'
];

const SAMPLE_VIDEO_OUTPUTS = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
];

export const AIGeneratorPage: React.FC<AIGeneratorPageProps> = ({
  initialPrompt = '',
  initialAge = 'young-adult',
  initialMode = 'photo',
  language,
  onNavigate,
  onCreationAdded
}) => {
  const isBn = language === 'bn';

  // Form states
  const [prompt, setPrompt] = useState(initialPrompt);
  const [selectedAge, setSelectedAge] = useState<CharacterAgeBracket>(initialAge);
  const [selectedGender, setSelectedGender] = useState<GeneratorGender>('Male');
  const [selectedStyle, setSelectedStyle] = useState<GeneratorStyle>('Cinematic');
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>('9:16');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // Generation states
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeGenType, setActiveGenType] = useState<'photo' | 'video' | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState('');

  // Result states
  const [lastResult, setLastResult] = useState<{
    id: string;
    type: 'photo' | 'video';
    url: string;
    prompt: string;
    title: string;
    aspectRatio: AspectRatio;
    style: GeneratorStyle;
    age: CharacterAgeBracket;
  } | null>(null);

  const [isPlayingVideo, setIsPlayingVideo] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  const promptInputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Synchronize when initialPrompt or initialAge changes
  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
    }
    if (initialAge) {
      setSelectedAge(initialAge);
    }
  }, [initialPrompt, initialAge]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showToast(isBn ? 'ছবির সাইজ ১০MB এর চেয়ে কম হতে হবে' : 'File size must be under 10MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImage(reader.result as string);
        showToast(isBn ? 'ছবি আপলোড সম্পন্ন হয়েছে' : 'Reference photo uploaded');
      };
      reader.readAsDataURL(file);
    }
  };

  // Generate Handler
  const handleGenerate = (type: 'photo' | 'video') => {
    if (!prompt.trim()) {
      showToast(isBn ? 'দয়া করে একটি প্রম্পট লিখুন অথবা Prompt Library থেকে বেছে নিন' : 'Please enter a prompt or choose from Library');
      promptInputRef.current?.focus();
      return;
    }

    setIsGenerating(true);
    setActiveGenType(type);
    setProgress(0);

    const steps = type === 'photo' 
      ? [
          { p: 20, status: isBn ? 'প্রম্পট ও ক্যারেক্টার বিশ্লেষণ করা হচ্ছে...' : 'Analyzing prompt and character...' },
          { p: 50, status: isBn ? 'সিনেমাটিক আলো ও আবহ তৈরি হচ্ছে...' : 'Rendering cinematic lighting...' },
          { p: 80, status: isBn ? '৮কে হাইপার-ডিটেইলিং ও ফেস রেন্ডারিং...' : 'Applying 8k hyper-detailing...' },
          { p: 100, status: isBn ? 'ছবি তৈরি সম্পন্ন হয়েছে!' : 'Photo generated successfully!' }
        ]
      : [
          { p: 15, status: isBn ? 'ভিডিও মোশন ট্রাজেক্টরি গণনা হচ্ছে...' : 'Calculating motion trajectory...' },
          { p: 40, status: isBn ? 'সিনেমাটিক ফ্রেম ও ক্যামেরা ড্রোন রেন্ডারিং...' : 'Rendering cinematic drone frames...' },
          { p: 75, status: isBn ? 'ফ্লুইড ৬০fps মোশন ও সাউন্ড সিঙ্ক হচ্ছে...' : 'Synthesizing fluid 60fps motion...' },
          { p: 100, status: isBn ? 'ভিডিও তৈরি সম্পন্ন হয়েছে!' : 'Video generated successfully!' }
        ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setProgress(steps[currentStep].p);
        setProgressStatus(steps[currentStep].status);
        currentStep++;
      } else {
        clearInterval(interval);
        finishGeneration(type);
      }
    }, 550);
  };

  const finishGeneration = (type: 'photo' | 'video') => {
    setIsGenerating(false);

    const randomPhoto = uploadedImage || SAMPLE_PHOTO_OUTPUTS[Math.floor(Math.random() * SAMPLE_PHOTO_OUTPUTS.length)];
    const randomVideo = SAMPLE_VIDEO_OUTPUTS[Math.floor(Math.random() * SAMPLE_VIDEO_OUTPUTS.length)];

    const titlePrefix = type === 'photo' 
      ? (isBn ? 'AI সিনেমাটিক ছবি' : 'AI Cinematic Photo')
      : (isBn ? 'AI সিনেমাটিক ভিডিও' : 'AI Cinematic Video');
    const generatedTitle = `${titlePrefix}: ${prompt.slice(0, 32)}...`;

    const newResult = {
      id: `gen_${Date.now()}`,
      type,
      url: type === 'photo' ? randomPhoto : randomVideo,
      prompt,
      title: generatedTitle,
      aspectRatio: selectedRatio,
      style: selectedStyle,
      age: selectedAge
    };

    setLastResult(newResult);

    // Persist into My Creations via storageService
    const creationItem: CreationItem = {
      id: newResult.id,
      userId: 'usr_default_01',
      type: type === 'photo' ? 'image' : 'video',
      title: generatedTitle,
      prompt,
      fileUrl: newResult.url,
      thumbnailUrl: randomPhoto,
      createdAt: Date.now(),
      metadata: {
        aspectRatio: selectedRatio,
        style: selectedStyle,
        gender: selectedGender,
        age: selectedAge
      }
    };

    storageService.addCreation(creationItem);
    onCreationAdded(creationItem);

    showToast(isBn ? `${type === 'photo' ? 'ছবি' : 'ভিডিও'} সফলভাবে তৈরি ও সংরক্ষিত হয়েছে!` : `${type === 'photo' ? 'Photo' : 'Video'} generated & saved to My Creations!`);
  };

  // Download Output Handler - Saves directly to mobile gallery or downloads folder
  const handleDownload = async (url: string, filename: string) => {
    showToast(isBn ? 'গ্যালারিতে ডাউনলোড ও সেভ হচ্ছে...' : 'Saving to gallery...');
    const res = await downloadMediaToGallery(url, filename);
    if (res.success) {
      showToast(isBn ? '✓ ইমেজ/ভিডিও সফলভাবে গ্যালারিতে সংরক্ষিত হয়েছে!' : '✓ Media saved to your device gallery!');
    } else {
      showToast(isBn ? 'ডাউনলোড ফাইল প্রস্তুত হয়েছে' : 'Download initiated');
    }
  };

  // Copy current active prompt
  const handleCopyPrompt = async () => {
    if (!prompt.trim()) {
      showToast(isBn ? 'কপি করার মতো কোনো প্রম্পট নেই' : 'No prompt to copy');
      return;
    }
    try {
      await navigator.clipboard.writeText(prompt);
      showToast(isBn ? '✓ প্রম্পট ক্লিপবোর্ডে কপি করা হয়েছে!' : '✓ Prompt copied to clipboard!');
    } catch {
      showToast(isBn ? 'কপি করা যায়নি' : 'Failed to copy prompt');
    }
  };

  // Paste prompt from clipboard
  const handlePastePrompt = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        setPrompt(text.trim());
        showToast(isBn ? '✓ প্রম্পট পেস্ট করা হয়েছে!' : '✓ Prompt pasted from clipboard!');
      } else {
        showToast(isBn ? 'ক্লিপবোর্ড খালি' : 'Clipboard is empty');
      }
    } catch {
      // If browser blocks clipboard.readText, give prompt to user
      showToast(isBn ? 'দয়া করে সরাসরি বক্সে পেস্ট (Ctrl+V) করুন' : 'Please press Ctrl+V to paste');
    }
  };

  // Quick Prompt Enhancer
  const handleEnhancePrompt = () => {
    if (!prompt.trim()) return;
    const enhanced = `${prompt.trim()}, 8k resolution, cinematic golden hour lighting, authentic Bangladeshi cultural richness, photorealistic textures, masterwork 35mm lens shot, award-winning aesthetics`;
    setPrompt(enhanced);
    showToast(isBn ? 'প্রম্পট সিনেমাটিক স্টাইলে উন্নত করা হয়েছে!' : 'Prompt enhanced with cinematic keywords!');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-neutral-900 border border-emerald-500/50 text-white shadow-2xl animate-fade-in text-sm font-medium">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-emerald-950/40 border border-neutral-800 shadow-lg">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            <span>{isBn ? 'AI Photo & Video Generator' : 'AI Photo & Video Generator'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {isBn ? 'নতুন ফটো ও ভিডিও ক্রিয়েশন স্টুডিও' : 'AI Creative Generation Studio'}
          </h1>
          <p className="text-sm text-neutral-400 max-w-xl leading-relaxed">
            {isBn
              ? 'আপনার নিজের প্রম্পট লিখুন অথবা ১০০০+ রেডি প্রম্পট লাইব্রেরি থেকে বাছাই করে আল্ট্রা-সিনেমাটিক ছবি ও ভিডিও তৈরি করুন।'
              : 'Write your custom prompt or select from our 1000+ ready prompt library to generate cinematic photos & videos.'}
          </p>
        </div>

        {/* 1000+ AI Prompts Shortcut Button */}
        <button
          id="generator-browse-library-btn"
          onClick={() => onNavigate('prompt-library')}
          className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-neutral-950 font-bold text-sm shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition shrink-0"
        >
          <Sparkles className="h-4 w-4 text-neutral-950" />
          <span>✨ 1000+ AI Prompts</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: AI Generator Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl bg-neutral-900/90 border border-neutral-800 p-6 space-y-6 shadow-sm">
            
            {/* 1. Upload Photo (Optional Reference) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
                  <Upload className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{isBn ? '১. রেফারেন্স ছবি আপলোড (ঐচ্ছিক)' : '1. Upload Photo (Optional Reference)'}</span>
                </label>
                {uploadedImage && (
                  <button
                    onClick={() => setUploadedImage(null)}
                    className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                  >
                    <X className="h-3 w-3" />
                    <span>{isBn ? 'মুছে ফেলুন' : 'Remove'}</span>
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="generator-file-input"
              />

              {!uploadedImage ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-neutral-800 hover:border-emerald-500/50 bg-neutral-950/60 cursor-pointer transition group"
                >
                  <div className="h-10 w-10 rounded-xl bg-neutral-900 flex items-center justify-center text-neutral-400 group-hover:text-emerald-400 group-hover:scale-110 transition">
                    <Upload className="h-5 w-5" />
                  </div>
                  <p className="mt-2 text-xs font-semibold text-neutral-300">
                    {isBn ? 'এখানে ক্লিক করে ছবি নির্বাচন করুন বা টেনে আনুন' : 'Click to upload or drag & drop reference photo'}
                  </p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    {isBn ? 'JPG, PNG বা WebP (সর্বোচ্চ ১০MB)' : 'JPG, PNG or WebP (Max 10MB)'}
                  </p>
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border border-neutral-700 bg-neutral-950 p-2 flex items-center gap-4">
                  <img
                    src={uploadedImage}
                    alt="Uploaded Reference"
                    className="h-16 w-16 object-cover rounded-xl border border-neutral-800"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-neutral-200">
                      {isBn ? 'রেফারেন্স ছবি যুক্ত হয়েছে' : 'Reference Image Attached'}
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      {isBn ? 'AI এই ছবির চেহারা ও পোজ বজায় রেখে নতুন সিন বানাবে' : 'AI will preserve face/style characteristics'}
                    </p>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-neutral-800 text-xs text-neutral-300 hover:bg-neutral-700 font-medium"
                  >
                    {isBn ? 'পরিবর্তন' : 'Change'}
                  </button>
                </div>
              )}
            </div>

            {/* 2. Write Your Own Prompt */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
                  <Edit3 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{isBn ? '২. প্রম্পট লিখুন (Write Your Prompt)' : '2. Write Your Own Prompt'}</span>
                </label>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={handlePastePrompt}
                    type="button"
                    className="flex items-center gap-1 text-[11px] text-teal-400 hover:text-teal-300 font-semibold px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/20 transition"
                    title={isBn ? 'ক্লিপবোর্ড থেকে প্রম্পট পেস্ট করুন' : 'Paste prompt'}
                  >
                    <Clipboard className="h-3 w-3" />
                    <span>{isBn ? 'পেস্ট' : 'Paste'}</span>
                  </button>
                  {prompt && (
                    <button
                      onClick={handleCopyPrompt}
                      type="button"
                      className="flex items-center gap-1 text-[11px] text-neutral-300 hover:text-white font-semibold px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700 transition"
                      title={isBn ? 'প্রম্পট কপি করুন' : 'Copy prompt'}
                    >
                      <Copy className="h-3 w-3" />
                      <span>{isBn ? 'কপি' : 'Copy'}</span>
                    </button>
                  )}
                  <button
                    onClick={handleEnhancePrompt}
                    type="button"
                    className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-semibold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 transition"
                  >
                    <Wand2 className="h-3 w-3" />
                    <span>{isBn ? 'AI প্রম্পট উন্নত করুন' : 'Enhance'}</span>
                  </button>
                  <button
                    onClick={() => setPrompt('')}
                    type="button"
                    className="text-[11px] text-neutral-500 hover:text-neutral-300"
                  >
                    {isBn ? 'ক্লিয়ার' : 'Clear'}
                  </button>
                </div>
              </div>

              <div className="relative">
                <textarea
                  ref={promptInputRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={
                    isBn
                      ? 'যেমন: একটি ৮ বছর বয়সী মিষ্টি হাসিখুশি বাংলাদেশি শিশু, বাঁশের সাঁকো দিয়ে হেঁটে যাচ্ছে, পেছনে সবুজ গ্রাম ও সকালের সোনালী রোদ, cinematic realistic photography...'
                      : 'E.g., A Bangladeshi young adult walking across a serene riverbank, golden hour lighting, cinematic 8k photorealistic...'
                  }
                  rows={4}
                  className="w-full rounded-2xl bg-neutral-950 border border-neutral-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 p-4 text-sm text-neutral-100 placeholder-neutral-500 resize-none transition outline-none"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span className="flex items-center gap-1 text-[11px] text-neutral-500">
                  <Info className="h-3 w-3" />
                  {isBn ? 'বাংলা বা ইংরেজিতে যে কোনো প্রম্পট লিখতে পারেন' : 'You can write prompts in Bengali or English'}
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate('prompt-library')}
                  className="text-emerald-400 hover:text-emerald-300 text-xs font-semibold flex items-center gap-1"
                >
                  <BookOpen className="h-3 w-3" />
                  <span>{isBn ? 'লাইব্রেরি থেকে প্রম্পট আনুন' : 'Pick from Library'}</span>
                </button>
              </div>
            </div>

            {/* 3. Select Age */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                {isBn ? '৩. চরিত্রের বয়স নির্বাচন (Select Character Age)' : '3. Select Age'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {AGE_BRACKETS.map((age) => {
                  const isSelected = selectedAge === age.id;
                  return (
                    <button
                      key={age.id}
                      type="button"
                      onClick={() => setSelectedAge(age.id)}
                      className={`flex flex-col items-start p-3 rounded-xl border text-left transition ${
                        isSelected
                          ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-sm'
                          : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                      }`}
                    >
                      <span className="text-xs font-bold">{isBn ? age.labelBn : age.labelEn}</span>
                      <span className="text-[10px] text-neutral-500 mt-0.5 line-clamp-1">{age.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Select Gender & Style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Gender */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                  {isBn ? '৪. জেন্ডার (Select Gender)' : '4. Select Gender'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Male', 'Female', 'Group'] as GeneratorGender[]).map((gender) => {
                    const isSelected = selectedGender === gender;
                    const label = gender === 'Male' 
                      ? (isBn ? 'পুরুষ' : 'Male') 
                      : gender === 'Female' 
                        ? (isBn ? 'মহিলা' : 'Female') 
                        : (isBn ? 'দলীয়' : 'Group');
                    return (
                      <button
                        key={gender}
                        type="button"
                        onClick={() => setSelectedGender(gender)}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold text-center transition ${
                          isSelected
                            ? 'bg-emerald-500 text-neutral-950 border-emerald-400'
                            : 'bg-neutral-950/60 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Aspect Ratio */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                  {isBn ? '৫. অ্যাসপেক্ট রেশিও (Aspect Ratio)' : '5. Select Aspect Ratio'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {ASPECT_RATIOS.map((ratio) => {
                    const isSelected = selectedRatio === ratio.id;
                    return (
                      <button
                        key={ratio.id}
                        type="button"
                        onClick={() => setSelectedRatio(ratio.id)}
                        className={`py-2 px-2.5 rounded-xl border text-center flex flex-col items-center justify-center transition ${
                          isSelected
                            ? 'bg-emerald-950/50 border-emerald-500 text-emerald-300'
                            : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                        }`}
                      >
                        <span className="text-xs font-bold">{ratio.label}</span>
                        <span className="text-[9px] text-neutral-500 mt-0.5">{ratio.id === '9:16' ? 'Reels' : ratio.id === '16:9' ? 'Video' : 'Square'}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 6. Select Style */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                {isBn ? '৬. ভিজ্যুয়াল স্টাইল (Select Style)' : '6. Select Style'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {STYLES.map((style) => {
                  const isSelected = selectedStyle === style.id;
                  return (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setSelectedStyle(style.id)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition ${
                        isSelected
                          ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                          : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                      }`}
                    >
                      <span className="text-base">{style.icon}</span>
                      <span className="text-xs font-medium truncate">{isBn ? style.nameBn : style.nameEn}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Generation Actions: [Generate Photo] & [Generate Video] */}
            <div className="pt-2 border-t border-neutral-800/80">
              {isGenerating ? (
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-emerald-400 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 animate-spin text-emerald-400" />
                      <span>{progressStatus}</span>
                    </span>
                    <span className="font-mono text-neutral-400 font-bold">{progress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-neutral-500 text-center">
                    {activeGenType === 'photo' 
                      ? (isBn ? '৮কে আল্ট্রা-ডিটেইলড সিনেমাটিক ফটো রেন্ডার হচ্ছে...' : 'Rendering 8k ultra-detailed photo...')
                      : (isBn ? '৬০fps ফ্লুইড ভিডিও ফ্রেম ও সাউন্ড তৈরি হচ্ছে...' : 'Synthesizing 60fps video frames and motion...')}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Generate Photo Button */}
                  <button
                    id="generator-generate-photo-btn"
                    onClick={() => handleGenerate('photo')}
                    className="flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-sm shadow-lg shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.99] transition"
                  >
                    <ImageIcon className="h-4 w-4" />
                    <span>{isBn ? 'Generate Photo (ছবি বানান)' : 'Generate Photo'}</span>
                  </button>

                  {/* Generate Video Button */}
                  <button
                    id="generator-generate-video-btn"
                    onClick={() => handleGenerate('video')}
                    className="flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-neutral-950 font-bold text-sm shadow-lg shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99] transition"
                  >
                    <Video className="h-4 w-4" />
                    <span>{isBn ? 'Generate Video (ভিডিও বানান)' : 'Generate Video'}</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Right Column: Output Preview & Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl bg-neutral-900/90 border border-neutral-800 p-6 space-y-5 shadow-sm sticky top-20">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h2 className="text-sm font-bold text-neutral-200 flex items-center gap-2">
                <Layers className="h-4 w-4 text-emerald-400" />
                <span>{isBn ? 'আউটপুট প্রিভিউ ও ডাউনলোড' : 'Output Preview & Download'}</span>
              </h2>
              {lastResult && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium">
                  {lastResult.type === 'photo' ? 'Photo' : 'Video'} • {lastResult.aspectRatio}
                </span>
              )}
            </div>

            {lastResult ? (
              <div className="space-y-4">
                {/* Visual Preview Box */}
                <div className="relative rounded-2xl overflow-hidden bg-black border border-neutral-800 flex items-center justify-center group">
                  {lastResult.type === 'photo' ? (
                    <div className="relative w-full aspect-[9/16] max-h-[460px] overflow-hidden flex items-center justify-center bg-neutral-950">
                      <img
                        src={lastResult.url}
                        alt="Generated Result"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <button
                        onClick={() => setPreviewModalOpen(true)}
                        className="absolute bottom-3 right-3 p-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-900 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition"
                        title="Fullscreen Preview"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative w-full aspect-[9/16] max-h-[460px] overflow-hidden bg-neutral-950 flex items-center justify-center">
                      <video
                        ref={videoRef}
                        src={lastResult.url}
                        className="w-full h-full object-cover"
                        loop
                        autoPlay
                        muted
                        playsInline
                      />
                      <button
                        onClick={() => {
                          if (videoRef.current) {
                            if (videoRef.current.paused) {
                              videoRef.current.play();
                              setIsPlayingVideo(true);
                            } else {
                              videoRef.current.pause();
                              setIsPlayingVideo(false);
                            }
                          }
                        }}
                        className="absolute inset-0 m-auto h-12 w-12 rounded-full bg-neutral-900/70 hover:bg-neutral-900 text-white flex items-center justify-center backdrop-blur-md transition"
                      >
                        {isPlayingVideo ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                      </button>
                    </div>
                  )}
                </div>

                {/* Prompt Info */}
                <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1.5">
                  <p className="text-xs font-semibold text-neutral-300 line-clamp-2">
                    {lastResult.prompt}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-500">
                    <span>স্টাইল: <strong className="text-neutral-300">{lastResult.style}</strong></span>
                    <span>•</span>
                    <span>রেশিও: <strong className="text-neutral-300">{lastResult.aspectRatio}</strong></span>
                  </div>
                </div>

                {/* Output Actions as requested:
                    Photo তৈরি হলে: Preview, Regenerate, Edit Prompt, Download Photo
                    Video তৈরি হলে: Video Preview, Regenerate, Edit Prompt, Download Video */}
                <div className="grid grid-cols-2 gap-2.5">
                  {/* Regenerate */}
                  <button
                    onClick={() => handleGenerate(lastResult.type)}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-200 text-xs font-semibold border border-neutral-700 transition"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>{isBn ? 'Regenerate' : 'Regenerate'}</span>
                  </button>

                  {/* Edit Prompt */}
                  <button
                    onClick={() => {
                      promptInputRef.current?.focus();
                      showToast(isBn ? 'প্রম্পট বক্সে কার্সর নেওয়া হয়েছে' : 'Ready to edit prompt');
                    }}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-200 text-xs font-semibold border border-neutral-700 transition"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>{isBn ? 'Edit Prompt' : 'Edit Prompt'}</span>
                  </button>

                  {/* Copy Prompt Used */}
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(lastResult.prompt);
                      showToast(isBn ? '✓ ব্যবহৃত প্রম্পটটি কপি হয়েছে!' : '✓ Used prompt copied!');
                    }}
                    className="col-span-2 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-medium border border-neutral-800 transition"
                  >
                    <Copy className="h-3.5 w-3.5 text-neutral-400" />
                    <span>{isBn ? 'ব্যবহৃত প্রম্পট কপি করুন' : 'Copy Used Prompt'}</span>
                  </button>

                  {/* Download to Gallery Button */}
                  <button
                    onClick={() => handleDownload(lastResult.url, `${lastResult.type}_${lastResult.id}.${lastResult.type === 'photo' ? 'jpg' : 'mp4'}`)}
                    className="col-span-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 text-xs font-black transition shadow-lg shadow-emerald-500/20 active:scale-[0.99]"
                    title={isBn ? 'সরাসরি মোবাইল বা ডিভাইসের গ্যালারিতে ডাউনলোড হবে' : 'Saves directly to your device gallery'}
                  >
                    <Download className="h-4 w-4 stroke-[2.5]" />
                    <span>
                      {lastResult.type === 'photo'
                        ? (isBn ? '📥 গ্যালারিতে ডাউনলোড ও সেভ করুন' : '📥 Download & Save to Gallery')
                        : (isBn ? '📥 ভিডিও গ্যালারিতে সেভ করুন' : '📥 Save Video to Gallery')}
                    </span>
                  </button>
                </div>

                <div className="pt-2 text-center">
                  <button
                    onClick={() => onNavigate('creations')}
                    className="text-xs text-neutral-400 hover:text-emerald-400 transition"
                  >
                    {isBn ? 'সব ক্রিয়েশন দেখতে "My Creations"-এ যান →' : 'View in "My Creations" →'}
                  </button>
                </div>
              </div>
            ) : (
              /* Empty Placeholder State */
              <div className="flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-neutral-800 bg-neutral-950/40 text-center space-y-3">
                <div className="h-14 w-14 rounded-2xl bg-neutral-900 flex items-center justify-center text-neutral-500">
                  <Wand2 className="h-7 w-7 text-emerald-400/80" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-neutral-300">
                    {isBn ? 'কোনো আউটপুট এখনো তৈরি হয়নি' : 'No Output Generated Yet'}
                  </p>
                  <p className="text-xs text-neutral-500 max-w-xs">
                    {isBn
                      ? 'বাম পাশের ফর্মে প্রম্পট লিখুন অথবা নিচের বোতাম চেপে ১০০০+ প্রম্পট লাইব্রেরি থেকে একটি আকর্ষণীয় প্রম্পট পছন্দ করুন।'
                      : 'Write a prompt on the left or select from 1000+ AI Prompts to generate photorealistic images or videos.'}
                  </p>
                </div>

                <button
                  onClick={() => onNavigate('prompt-library')}
                  className="mt-2 flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-emerald-400 text-xs font-semibold border border-neutral-700 transition"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>{isBn ? '✨ ১০০০+ প্রম্পট ব্রাউজ করুন' : '✨ Browse 1000+ Prompts'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Preview Modal */}
      {previewModalOpen && lastResult && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setPreviewModalOpen(false)}
              className="absolute -top-10 right-0 text-white hover:text-neutral-300 p-1"
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={lastResult.url}
              alt="Fullscreen Preview"
              className="max-h-[80vh] w-auto object-contain rounded-2xl shadow-2xl border border-neutral-800"
            />
            <div className="mt-4 flex items-center gap-4">
              <button
                onClick={() => handleDownload(lastResult.url, `photo_${lastResult.id}.jpg`)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-neutral-950 font-bold text-xs"
              >
                <Download className="h-4 w-4" />
                <span>{isBn ? 'ডাউনলোড' : 'Download'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
