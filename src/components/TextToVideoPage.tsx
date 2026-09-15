import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  Video, 
  Play, 
  Pause, 
  Download, 
  Share2, 
  RefreshCw, 
  Film, 
  Sliders 
} from 'lucide-react';
import { AppView, AspectRatio, CreationItem, Language, VideoCamera, VideoDuration, VideoQuality } from '../types';
import { translations } from '../i18n/translations';
import { aiService } from '../services/aiService';
import { storageService } from '../services/storageService';

interface TextToVideoPageProps {
  initialPrompt?: string;
  onNavigate: (view: AppView, prompt?: string, extraData?: any) => void;
  language: Language;
}

export const TextToVideoPage: React.FC<TextToVideoPageProps> = ({
  initialPrompt,
  onNavigate,
  language
}) => {
  const t = translations[language];
  const isBn = language === 'bn';

  const defaultPromptExample = 'বাংলাদেশের একটি সুন্দর গ্রামের দৃশ্য। সবুজ ধানের ক্ষেত, পুকুর, নারকেল গাছ এবং সকালে সূর্যের আলো। ক্যামেরা ধীরে ধীরে গ্রামের রাস্তা দিয়ে এগিয়ে যাচ্ছে।';
  const [prompt, setPrompt] = useState<string>(initialPrompt || defaultPromptExample);

  // Settings
  const [duration, setDuration] = useState<VideoDuration>(5);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [style, setStyle] = useState<string>('Cinematic Realistic');
  const [camera, setCamera] = useState<VideoCamera>('Pan Left');
  const [quality, setQuality] = useState<VideoQuality>('High');

  const [isGenerating, setIsGenerating] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [generatedVideo, setGeneratedVideo] = useState<{
    videoUrl: string;
    thumbnailUrl: string;
    title: string;
  } | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  const durations: VideoDuration[] = [5, 10, 15];
  const aspectRatios: AspectRatio[] = ['16:9', '9:16', '1:1'];
  const styles = ['Cinematic Realistic', 'Anime Style', '3D Animation', 'Vintage Film', 'Cyberpunk'];
  const cameras: VideoCamera[] = ['Zoom In', 'Zoom Out', 'Pan Left', 'Pan Right', 'Static'];
  const qualities: VideoQuality[] = ['Standard', 'High', '4K'];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setErrorMsg(t.errors.emptyPrompt);
      return;
    }

    setErrorMsg(null);
    setIsGenerating(true);
    setProgressPercent(15);

    const interval = setInterval(() => {
      setProgressPercent((p) => {
        if (p >= 90) {
          clearInterval(interval);
          return 90;
        }
        return p + 15;
      });
    }, 450);

    try {
      const res = await aiService.generateVideo({
        prompt,
        duration,
        aspectRatio,
        camera,
        quality,
        style
      });

      clearInterval(interval);
      setProgressPercent(100);

      setTimeout(() => {
        setGeneratedVideo(res);
        setIsGenerating(false);

        // Save to My Creations
        const creation: CreationItem = {
          id: 'cr_t2v_' + Date.now(),
          userId: 'usr_default_01',
          type: 'video',
          title: prompt.slice(0, 30),
          prompt,
          fileUrl: res.videoUrl,
          thumbnailUrl: res.thumbnailUrl,
          createdAt: Date.now(),
          metadata: {
            duration,
            aspectRatio,
            style,
            quality
          }
        };
        storageService.addCreation(creation);
      }, 500);

    } catch (err: any) {
      clearInterval(interval);
      setIsGenerating(false);
      setErrorMsg(err.message || t.errors.videoGenError);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  return (
    <div id="text-to-video-container" className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Title Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20">
            <Video className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-100">
              {t.textToVideo.title}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400">
              {t.textToVideo.subtitle}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Controls */}
        <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5 space-y-5 shadow-xl">
          {/* Prompt */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-300">
                {isBn ? 'ভিডিওর দৃশ্য বর্ণনা (Video Prompt)' : 'Video Prompt'}
              </label>
              <button
                type="button"
                onClick={() => setPrompt(defaultPromptExample)}
                className="text-[11px] text-fuchsia-400 hover:underline"
              >
                {isBn ? 'উদাহরণ দেখুন' : 'Use Example'}
              </button>
            </div>
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t.textToVideo.promptPlaceholder}
              className="w-full rounded-xl bg-neutral-950 border border-neutral-800 p-3.5 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-fuchsia-500/50 resize-none"
            />
          </div>

          {/* 5 Settings as requested */}
          <div className="space-y-3.5 pt-2 border-t border-neutral-850">
            {/* 1. Duration */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-400">
                {t.textToVideo.duration}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {durations.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDuration(d)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition ${
                      duration === d
                        ? 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40'
                        : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    {d} {isBn ? 'সেকেন্ড' : 'sec'}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Aspect Ratio */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-400">
                {t.textToVideo.aspectRatio}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {aspectRatios.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setAspectRatio(r)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition ${
                      aspectRatio === r
                        ? 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40'
                        : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Style, 4. Camera, 5. Quality */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-400">
                  {t.textToVideo.style}
                </label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full h-8 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 px-2 focus:outline-none"
                >
                  {styles.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-400">
                  {t.textToVideo.camera}
                </label>
                <select
                  value={camera}
                  onChange={(e) => setCamera(e.target.value as VideoCamera)}
                  className="w-full h-8 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 px-2 focus:outline-none"
                >
                  {cameras.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-400">
                  {t.textToVideo.quality}
                </label>
                <select
                  value={quality}
                  onChange={(e) => setQuality(e.target.value as VideoQuality)}
                  className="w-full h-8 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 px-2 focus:outline-none"
                >
                  {qualities.map(q => <option key={q} value={q}>{q}</option>)}
                </select>
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Button: AI Video তৈরি করুন */}
          <button
            id="text-to-video-btn"
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-3.5 rounded-xl bg-fuchsia-500 hover:bg-fuchsia-400 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-fuchsia-500/20 active:scale-98 transition"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>{t.textToVideo.statusText}</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>{t.textToVideo.buttonGenerate}</span>
              </>
            )}
          </button>
        </div>

        {/* Video Player Output */}
        <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
              <Film className="h-4 w-4 text-fuchsia-400" />
              <span>{isBn ? 'ভিডিও আউটপুট' : 'Video Output'}</span>
            </h3>

            {/* Status indicator as specified */}
            {isGenerating && (
              <div className="p-4 rounded-xl bg-neutral-950 border border-fuchsia-500/30 space-y-2">
                <div className="flex items-center justify-between text-xs text-fuchsia-300 font-semibold">
                  <span>{t.textToVideo.statusText}</span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
                  <div 
                    className="h-full bg-fuchsia-500 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Video Player as specified */}
            <div className="relative rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 aspect-video flex items-center justify-center">
              {generatedVideo ? (
                <div className="relative w-full h-full">
                  <video
                    ref={videoRef}
                    src={generatedVideo.videoUrl}
                    poster={generatedVideo.thumbnailUrl}
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <button
                      onClick={togglePlay}
                      className="h-12 w-12 rounded-full bg-fuchsia-500 text-white flex items-center justify-center shadow-xl hover:scale-105 transition"
                    >
                      {isPlaying ? <Pause className="h-5 w-5 fill-white" /> : <Play className="h-5 w-5 fill-white ml-0.5" />}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center p-6 space-y-2 text-neutral-500">
                  <Video className="h-10 w-10 mx-auto opacity-30 text-fuchsia-400" />
                  <p className="text-xs">
                    {isBn ? 'দৃশ্য বর্ণনা লিখে AI Video তৈরি করুন।' : 'Describe scene and generate AI video.'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {generatedVideo && (
            <div className="flex items-center gap-2 pt-2">
              <a
                href={generatedVideo.videoUrl}
                download="bangla-ai-text-video.mp4"
                className="flex-1 py-2.5 rounded-xl bg-fuchsia-500 hover:bg-fuchsia-400 text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-sm"
              >
                <Download className="h-4 w-4" />
                <span>{t.download}</span>
              </a>
              <button
                onClick={() => onNavigate('video-editor', prompt, { videoUrl: generatedVideo.videoUrl })}
                className="py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-200 text-xs font-semibold border border-neutral-700 transition"
              >
                {t.edit}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
