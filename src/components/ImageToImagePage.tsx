import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Sparkles, 
  Download, 
  ImagePlus, 
  Check, 
  RefreshCw, 
  Sliders,
  ShieldCheck
} from 'lucide-react';
import { AppView, CreationItem, ImageStyle, Language } from '../types';
import { translations } from '../i18n/translations';
import { aiService } from '../services/aiService';
import { storageService } from '../services/storageService';

interface ImageToImagePageProps {
  onNavigate: (view: AppView, prompt?: string) => void;
  language: Language;
}

export const ImageToImagePage: React.FC<ImageToImagePageProps> = ({
  onNavigate,
  language
}) => {
  const t = translations[language];
  const isBn = language === 'bn';

  const defaultSample = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80';
  const [sourceImage, setSourceImage] = useState<string>(defaultSample);
  const [prompt, setPrompt] = useState<string>(
    'এই ছবির ব্যক্তিকে একটি সুন্দর Professional Studio-তে বসিয়ে দিন। মুখের স্বাভাবিক বৈশিষ্ট্য যতটা সম্ভব একই রাখুন।'
  );

  // Options
  const [preserveFace, setPreserveFace] = useState(true);
  const [preservePose, setPreservePose] = useState(true);
  const [preserveClothes, setPreserveClothes] = useState(false);
  const [backgroundChange, setBackgroundChange] = useState(true);
  const [style, setStyle] = useState<ImageStyle>('Professional Photography');

  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert(t.errors.imageUploadError);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setSourceImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setErrorMsg(t.errors.emptyPrompt);
      return;
    }

    setErrorMsg(null);
    setIsGenerating(true);

    try {
      const results = await aiService.generateImage({
        prompt: `${prompt}, style: ${style}`,
        style,
        sourceImage,
        preserveFace,
        preservePose,
        preserveClothes
      });

      if (results && results.length > 0) {
        setResultImage(results[0].url);

        // Save to My Creations
        const creation: CreationItem = {
          id: 'cr_img2img_' + Date.now(),
          userId: 'usr_default_01',
          type: 'image',
          title: prompt.slice(0, 30),
          prompt,
          fileUrl: results[0].url,
          createdAt: Date.now(),
          metadata: {
            style,
            preserveFace,
            preservePose
          }
        };
        storageService.addCreation(creation);
      }
    } catch (err: any) {
      setErrorMsg(err.message || t.errors.apiError);
    } finally {
      setIsGenerating(false);
    }
  };

  const styles: ImageStyle[] = [
    'Professional Photography',
    'Cinematic',
    'Realistic',
    '3D',
    'Artistic',
    'Anime',
    'Cartoon'
  ];

  return (
    <div id="image-to-image-container" className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Title Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <ImagePlus className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-100">
              {t.imageToImage.title}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400">
              {t.imageToImage.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Main Form & Compare Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Col: Upload & Settings */}
        <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5 space-y-5 shadow-xl">
          {/* Source Image Upload */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-300">
              {t.imageToImage.uploadLabel}
            </label>

            <div className="relative rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 h-48 sm:h-56 flex items-center justify-center group">
              <img
                src={sourceImage}
                alt="Source"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 m-auto h-10 w-44 rounded-xl bg-black/75 hover:bg-black/90 border border-neutral-600 text-neutral-200 text-xs font-semibold flex items-center justify-center gap-2 shadow-lg transition"
              >
                <Upload className="h-4 w-4 text-violet-400" />
                <span>{isBn ? 'অন্য ছবি আপলোড করুন' : 'Upload New Image'}</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
              />
            </div>
          </div>

          {/* Prompt */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-300">
              {isBn ? 'রূপান্তরের বর্ণনা (Prompt)' : 'Prompt'}
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t.imageToImage.promptPlaceholder}
              className="w-full rounded-xl bg-neutral-950 border border-neutral-800 p-3 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-violet-500/50 resize-none"
            />
          </div>

          {/* 5 Options specified */}
          <div className="space-y-2.5 pt-2 border-t border-neutral-850">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
              {isBn ? 'সংরক্ষণ ও রূপান্তর অপশনস' : 'Preservation & Options'}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* 1. Preserve Face */}
              <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-neutral-950 border border-neutral-850 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preserveFace}
                  onChange={(e) => setPreserveFace(e.target.checked)}
                  className="rounded text-violet-500 focus:ring-violet-500/30 h-4 w-4 bg-neutral-900 border-neutral-700"
                />
                <span className="text-xs text-neutral-300 font-medium">
                  {t.imageToImage.preserveFace}
                </span>
              </label>

              {/* 2. Preserve Pose */}
              <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-neutral-950 border border-neutral-850 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preservePose}
                  onChange={(e) => setPreservePose(e.target.checked)}
                  className="rounded text-violet-500 focus:ring-violet-500/30 h-4 w-4 bg-neutral-900 border-neutral-700"
                />
                <span className="text-xs text-neutral-300 font-medium">
                  {t.imageToImage.preservePose}
                </span>
              </label>

              {/* 3. Preserve Clothes */}
              <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-neutral-950 border border-neutral-850 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preserveClothes}
                  onChange={(e) => setPreserveClothes(e.target.checked)}
                  className="rounded text-violet-500 focus:ring-violet-500/30 h-4 w-4 bg-neutral-900 border-neutral-700"
                />
                <span className="text-xs text-neutral-300 font-medium">
                  {t.imageToImage.preserveClothes}
                </span>
              </label>

              {/* 4. Background Change */}
              <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-neutral-950 border border-neutral-850 cursor-pointer">
                <input
                  type="checkbox"
                  checked={backgroundChange}
                  onChange={(e) => setBackgroundChange(e.target.checked)}
                  className="rounded text-violet-500 focus:ring-violet-500/30 h-4 w-4 bg-neutral-900 border-neutral-700"
                />
                <span className="text-xs text-neutral-300 font-medium">
                  {t.imageToImage.bgChange}
                </span>
              </label>
            </div>

            {/* 5. Style Selection */}
            <div className="pt-2">
              <label className="text-xs font-medium text-neutral-400 mb-1 block">
                {t.imageToImage.style}
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value as ImageStyle)}
                className="w-full h-9 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-medium text-neutral-200 px-3 focus:outline-none focus:border-violet-500/50"
              >
                {styles.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Button: নতুন ছবি তৈরি করুন */}
          <button
            id="img2img-generate-btn"
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-3 rounded-xl bg-violet-500 hover:bg-violet-400 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20 active:scale-98 transition"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>{isBn ? 'AI নতুন ছবি তৈরি করছে...' : 'Generating Image...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>{t.imageToImage.buttonGenerate}</span>
              </>
            )}
          </button>
        </div>

        {/* Right Col: RESULT PREVIEW & ACTIONS */}
        <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-violet-400" />
              <span>{isBn ? 'ফলাফল প্রিভিউ (Result Preview)' : 'Result Preview'}</span>
            </h3>

            <div className="relative rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 aspect-square flex items-center justify-center">
              {resultImage ? (
                <img
                  src={resultImage}
                  alt="Result"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-6 space-y-2 text-neutral-500">
                  <ImagePlus className="h-10 w-10 mx-auto opacity-30 text-violet-400" />
                  <p className="text-xs">
                    {isBn ? 'প্রম্পট লিখে "নতুন ছবি তৈরি করুন" বাটনে চাপুন।' : 'Write prompt and click Generate.'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {resultImage && (
            <div className="flex items-center gap-2 pt-2">
              <a
                href={resultImage}
                download="bangla-ai-studio-img2img.jpg"
                className="flex-1 py-2 rounded-xl bg-violet-500 hover:bg-violet-400 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm"
              >
                <Download className="h-4 w-4" />
                <span>{t.download}</span>
              </a>
              <button
                onClick={() => onNavigate('photo-to-video', prompt, { sourceImage: resultImage })}
                className="py-2 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-200 text-xs font-semibold border border-neutral-700 transition"
              >
                {t.createVideo}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
