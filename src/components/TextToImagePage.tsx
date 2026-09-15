import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Download, 
  Crop, 
  Clapperboard, 
  Copy, 
  Share2, 
  RefreshCw, 
  Sliders, 
  Check, 
  Image as ImageIcon,
  FolderPlus
} from 'lucide-react';
import { AppView, AspectRatio, CreationItem, ImageQuality, ImageStyle, Language } from '../types';
import { translations } from '../i18n/translations';
import { aiService } from '../services/aiService';
import { storageService } from '../services/storageService';
import { downloadMediaToGallery } from '../utils/downloadUtils';

interface TextToImagePageProps {
  initialPrompt?: string;
  onNavigate: (view: AppView, prompt?: string, extraData?: any) => void;
  language: Language;
}

export const TextToImagePage: React.FC<TextToImagePageProps> = ({
  initialPrompt,
  onNavigate,
  language
}) => {
  const t = translations[language];
  const isBn = language === 'bn';

  const [prompt, setPrompt] = useState(initialPrompt || '');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [quality, setQuality] = useState<ImageQuality>('High');
  const [style, setStyle] = useState<ImageStyle>('Realistic');
  const [numImages, setNumImages] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<Array<{ url: string; title: string; id: string }>>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Example prompt from spec
  const examplePromptText = 'বাংলাদেশের একটি সুন্দর গ্রাম, সবুজ ধানের ক্ষেত, পাশে পুকুর, নারকেল গাছ, সকালের আলো, cinematic realistic photography';

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim() && generatedImages.length === 0) {
      handleGenerate();
    }
  }, []);

  const aspectRatios: AspectRatio[] = ['1:1', '4:5', '16:9', '9:16'];
  const qualities: ImageQuality[] = ['Standard', 'High', 'Ultra'];
  const styles: ImageStyle[] = [
    'Realistic', 
    'Cinematic', 
    '3D', 
    'Cartoon', 
    'Anime', 
    'Artistic', 
    'Professional Photography'
  ];
  const imageCounts = [1, 2, 4];

  const handleGenerate = async (customPrompt?: string) => {
    const textToUse = customPrompt || prompt;
    if (!textToUse.trim()) {
      setErrorMsg(t.errors.emptyPrompt);
      return;
    }

    setErrorMsg(null);
    setIsGenerating(true);

    try {
      const results = await aiService.generateImage({
        prompt: textToUse,
        style,
        aspectRatio,
        quality,
        numImages
      });

      const formatted = results.map((r, i) => ({
        url: r.url,
        title: r.title,
        id: 'img_' + Date.now() + '_' + i
      }));

      setGeneratedImages(formatted);

      // Save each to My Creations
      formatted.forEach(item => {
        const creation: CreationItem = {
          id: item.id,
          userId: 'usr_default_01',
          type: 'image',
          title: item.title,
          prompt: textToUse,
          fileUrl: item.url,
          createdAt: Date.now(),
          metadata: {
            aspectRatio,
            quality,
            style
          }
        };
        storageService.addCreation(creation);
      });

    } catch (err: any) {
      setErrorMsg(err.message || t.errors.apiError);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate Variations for a specific image
  const handleGenerateVariations = (img: { url: string; title: string }) => {
    const variationPrompt = `${prompt || img.title}, variation with subtle aesthetic modifications, high dynamic range`;
    handleGenerate(variationPrompt);
  };

  // Download image directly to gallery
  const handleDownload = async (url: string, filename: string) => {
    const safeName = `${filename.replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 20)}.jpg`;
    await downloadMediaToGallery(url, safeName);
  };

  // Share image
  const handleShare = (img: { url: string; title: string }) => {
    if (navigator.share) {
      navigator.share({
        title: img.title,
        url: img.url
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(img.url);
      alert(isBn ? 'ছবির লিংক কপি করা হয়েছে!' : 'Image link copied to clipboard!');
    }
  };

  return (
    <div id="text-to-image-container" className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Title Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <ImageIcon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-100">
              {t.textToImage.title}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400">
              {t.textToImage.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Main Generator Form */}
      <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4 sm:p-6 space-y-6 shadow-xl">
        {/* Prompt Input Box */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
            <span>{t.textToImage.promptPlaceholder}</span>
            <button
              type="button"
              onClick={() => setPrompt(examplePromptText)}
              className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
            >
              <Sparkles className="h-3 w-3" />
              <span>{isBn ? 'উদাহরণ প্রম্পট ব্যবহার করুন' : 'Use Example Prompt'}</span>
            </button>
          </label>
          <textarea
            id="image-gen-prompt-input"
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t.textToImage.examplePrompt}
            className="w-full rounded-xl bg-neutral-950 border border-neutral-800 p-3.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/50 transition resize-none"
          />
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-neutral-850">
          {/* 1. Aspect Ratio */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-400">
              {t.textToImage.aspectRatio}
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {aspectRatios.map((ratio) => (
                <button
                  key={ratio}
                  type="button"
                  onClick={() => setAspectRatio(ratio)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition ${
                    aspectRatio === ratio
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Image Quality */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-400">
              {t.textToImage.quality}
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {qualities.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setQuality(q)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition ${
                    quality === q
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Style */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-400">
              {t.textToImage.style}
            </label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value as ImageStyle)}
              className="w-full h-9 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-medium text-neutral-200 px-2.5 focus:outline-none focus:border-amber-500/50"
            >
              {styles.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* 4. Number of Images */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-400">
              {t.textToImage.numImages}
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {imageCounts.map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setNumImages(count)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition ${
                    numImages === count
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Submit Generate Button */}
        <button
          id="generate-image-button"
          type="button"
          onClick={() => handleGenerate()}
          disabled={isGenerating || !prompt.trim()}
          className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-neutral-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>{t.textToImage.generating}</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>{t.textToImage.buttonGenerate}</span>
            </>
          )}
        </button>
      </div>

      {/* Generated Images Gallery */}
      {generatedImages.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-neutral-100 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>{t.textToImage.galleryTitle}</span>
            </h2>
            <span className="text-xs text-neutral-500">
              {generatedImages.length} {isBn ? 'টি ছবি তৈরি সম্পন্ন' : 'images ready'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {generatedImages.map((img, idx) => (
              <div
                key={img.id}
                className="group rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-md flex flex-col"
              >
                {/* Image Container with Aspect Ratio styling */}
                <div className="relative w-full aspect-square overflow-hidden bg-neutral-950">
                  <img
                    src={img.url}
                    alt={img.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[10px] font-semibold text-white">
                    {aspectRatio}
                  </div>
                </div>

                {/* Info & Action Buttons as specified */}
                <div className="p-3.5 space-y-3">
                  <p className="text-xs text-neutral-300 font-medium line-clamp-1">
                    {img.title}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1">
                    {/* 1. Download */}
                    <button
                      onClick={() => handleDownload(img.url, img.title)}
                      className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-neutral-200 text-xs font-medium border border-neutral-700/60 transition"
                    >
                      <Download className="h-3.5 w-3.5 text-emerald-400" />
                      <span>{t.download}</span>
                    </button>

                    {/* 2. Edit (opens in Photo Editor) */}
                    <button
                      onClick={() => onNavigate('photo-editor', prompt, { imageUrl: img.url })}
                      className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-neutral-200 text-xs font-medium border border-neutral-700/60 transition"
                    >
                      <Crop className="h-3.5 w-3.5 text-cyan-400" />
                      <span>{t.edit}</span>
                    </button>

                    {/* 3. Create Video (opens Photo to Video) */}
                    <button
                      onClick={() => onNavigate('photo-to-video', prompt, { sourceImage: img.url })}
                      className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-neutral-200 text-xs font-medium border border-neutral-700/60 transition"
                    >
                      <Clapperboard className="h-3.5 w-3.5 text-rose-400" />
                      <span>{t.createVideo}</span>
                    </button>

                    {/* 4. Variations */}
                    <button
                      onClick={() => handleGenerateVariations(img)}
                      className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-neutral-200 text-xs font-medium border border-neutral-700/60 transition col-span-2 sm:col-span-2"
                    >
                      <RefreshCw className="h-3.5 w-3.5 text-amber-400" />
                      <span>{t.variations}</span>
                    </button>

                    {/* 5. Share */}
                    <button
                      onClick={() => handleShare(img)}
                      className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-neutral-200 text-xs font-medium border border-neutral-700/60 transition"
                    >
                      <Share2 className="h-3.5 w-3.5 text-neutral-400" />
                      <span>{t.share}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
