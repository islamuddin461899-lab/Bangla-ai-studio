import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Sparkles, 
  Play, 
  Pause, 
  Download, 
  Share2, 
  Film, 
  RefreshCw, 
  Clapperboard, 
  Check, 
  Video as VideoIcon 
} from 'lucide-react';
import { AppView, AspectRatio, CreationItem, Language, VideoCamera, VideoDuration, VideoMotion } from '../types';
import { translations } from '../i18n/translations';
import { aiService } from '../services/aiService';
import { storageService } from '../services/storageService';

interface PhotoToVideoPageProps {
  initialPrompt?: string;
  initialImage?: string;
  onNavigate: (view: AppView, prompt?: string, extraData?: any) => void;
  language: Language;
}

export const PhotoToVideoPage: React.FC<PhotoToVideoPageProps> = ({
  initialPrompt,
  initialImage,
  onNavigate,
  language
}) => {
  const t = translations[language];
  const isBn = language === 'bn';

  const defaultPhoto = initialImage || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1000&q=80';
  const [sourcePhoto, setSourcePhoto] = useState<string>(defaultPhoto);
  const [prompt, setPrompt] = useState<string>(
    initialPrompt || 'ক্যামেরার দিকে ধীরে তাকাবে, হালকা হাসবে এবং ব্যাকগ্রাউন্ডে বাতাসে গাছের পাতা নড়বে।'
  );

  // Settings
  const [duration, setDuration] = useState<VideoDuration>(5);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [motion, setMotion] = useState<VideoMotion>('Cinematic');
  const [camera, setCamera] = useState<VideoCamera>('Zoom In');

  // Generation & progress state
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [generatedVideo, setGeneratedVideo] = useState<{
    videoUrl: string;
    thumbnailUrl: string;
    title: string;
  } | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const durations: VideoDuration[] = [5, 10, 15];
  const aspectRatios: AspectRatio[] = ['9:16', '16:9', '1:1'];
  const motions: VideoMotion[] = ['Slow', 'Natural', 'Cinematic', 'Dynamic'];
  const cameras: VideoCamera[] = ['Zoom In', 'Zoom Out', 'Pan Left', 'Pan Right', 'Static'];

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert(t.errors.imageUploadError);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setSourcePhoto(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateVideo = async () => {
    if (!sourcePhoto) {
      setErrorMsg(t.errors.imageUploadError);
      return;
    }

    setErrorMsg(null);
    setIsGenerating(true);
    setProgressPercent(10);

    // Progress simulation while server processes
    const timer = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 90) {
          clearInterval(timer);
          return 90;
        }
        return prev + 15;
      });
    }, 400);

    try {
      const result = await aiService.generateVideo({
        prompt,
        sourceImage: sourcePhoto,
        duration,
        aspectRatio,
        motion,
        camera
      });

      clearInterval(timer);
      setProgressPercent(100);

      setTimeout(() => {
        setGeneratedVideo(result);
        setIsGenerating(false);

        // Save to My Creations
        const creation: CreationItem = {
          id: 'cr_vid_' + Date.now(),
          userId: 'usr_default_01',
          type: 'video',
          title: prompt.slice(0, 30) || 'Photo to Video',
          prompt,
          fileUrl: result.videoUrl,
          thumbnailUrl: sourcePhoto,
          createdAt: Date.now(),
          metadata: {
            duration,
            aspectRatio,
            motion,
            camera
          }
        };
        storageService.addCreation(creation);
      }, 500);

    } catch (err: any) {
      clearInterval(timer);
      setIsGenerating(false);
      setErrorMsg(err.message || t.errors.videoGenError);
    }
  };

  const handlePlayToggle = () => {
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

  const handleShare = () => {
    if (!generatedVideo) return;
    if (navigator.share) {
      navigator.share({
        title: generatedVideo.title,
        url: generatedVideo.videoUrl
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(generatedVideo.videoUrl);
      alert(isBn ? 'ভিডিও লিংক কপি করা হয়েছে!' : 'Video link copied!');
    }
  };

  return (
    <div id="photo-to-video-container" className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Title Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Clapperboard className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-100">
              {t.photoToVideo.title}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400">
              {t.photoToVideo.subtitle}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Form Controls */}
        <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5 space-y-5 shadow-xl">
          {/* Upload Image Button & Preview */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-300">
              {t.photoToVideo.uploadBtn}
            </label>
            <div className="relative rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 h-48 flex items-center justify-center group">
              <img
                src={sourcePhoto}
                alt="Source preview"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:opacity-85 transition-opacity"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 m-auto h-10 w-44 rounded-xl bg-black/80 hover:bg-black/95 border border-neutral-600 text-neutral-200 text-xs font-semibold flex items-center justify-center gap-2 transition shadow-lg"
              >
                <Upload className="h-4 w-4 text-rose-400" />
                <span>{isBn ? 'অন্য ছবি দিন' : 'Change Image'}</span>
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
              {t.photoToVideo.motionPromptLabel}
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t.photoToVideo.motionPromptPlaceholder}
              className="w-full rounded-xl bg-neutral-950 border border-neutral-800 p-3 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-rose-500/50 resize-none"
            />
          </div>

          {/* Settings Grid */}
          <div className="space-y-4 pt-2 border-t border-neutral-850">
            {/* Duration */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-400">
                {t.photoToVideo.duration}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {durations.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDuration(d)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition ${
                      duration === d
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    {d} {isBn ? 'সেকেন্ড' : 'sec'}
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-400">
                {t.photoToVideo.aspectRatio}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {aspectRatios.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setAspectRatio(r)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition ${
                      aspectRatio === r
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Motion & Camera */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-400">
                  {t.photoToVideo.motion}
                </label>
                <select
                  value={motion}
                  onChange={(e) => setMotion(e.target.value as VideoMotion)}
                  className="w-full h-9 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-medium text-neutral-200 px-2.5 focus:outline-none focus:border-rose-500/50"
                >
                  {motions.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-400">
                  {t.photoToVideo.camera}
                </label>
                <select
                  value={camera}
                  onChange={(e) => setCamera(e.target.value as VideoCamera)}
                  className="w-full h-9 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-medium text-neutral-200 px-2.5 focus:outline-none focus:border-rose-500/50"
                >
                  {cameras.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Button: ভিডিও তৈরি করুন */}
          <button
            id="photo-to-video-generate-btn"
            type="button"
            onClick={handleGenerateVideo}
            disabled={isGenerating}
            className="w-full py-3.5 rounded-xl bg-rose-500 hover:bg-rose-400 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 active:scale-98 transition"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>{t.photoToVideo.progressTitle}</span>
              </>
            ) : (
              <>
                <Clapperboard className="h-4 w-4" />
                <span>{t.photoToVideo.buttonGenerate}</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Progress Indicator / Video Player */}
        <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
              <VideoIcon className="h-4 w-4 text-rose-400" />
              <span>{isBn ? 'ভিডিও প্রিভিউ ও প্লেয়ার' : 'Video Preview & Player'}</span>
            </h3>

            {/* Generation Progress Indicator as specified */}
            {isGenerating && (
              <div className="p-5 rounded-xl bg-neutral-950 border border-rose-500/30 space-y-3 animate-pulse">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-rose-300">{t.photoToVideo.progressTitle}</span>
                  <span className="text-neutral-400">{progressPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
                  <div 
                    className="h-full bg-rose-500 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-[11px] text-neutral-400">
                  {t.photoToVideo.progressSubtitle}
                </p>
              </div>
            )}

            {/* Video Player Display */}
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
                    onEnded={() => setIsPlaying(false)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={handlePlayToggle}
                      className="h-12 w-12 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-xl hover:scale-110 transition"
                    >
                      {isPlaying ? <Pause className="h-5 w-5 fill-white" /> : <Play className="h-5 w-5 fill-white ml-0.5" />}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center p-6 space-y-2 text-neutral-500">
                  <Clapperboard className="h-10 w-10 mx-auto opacity-30 text-rose-400" />
                  <p className="text-xs">
                    {isBn ? 'ছবি নির্বাচন করে "ভিডিও তৈরি করুন" বাটনে চাপুন।' : 'Select photo and generate video.'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action controls when video is generated as specified:
              Play, Download, Share, Edit Video, Generate Again */}
          {generatedVideo && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
              <button
                onClick={handlePlayToggle}
                className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-200 text-xs font-semibold border border-neutral-700 transition"
              >
                {isPlaying ? <Pause className="h-3.5 w-3.5 text-rose-400" /> : <Play className="h-3.5 w-3.5 text-rose-400" />}
                <span>{isPlaying ? t.aiVoice.pause : t.aiVoice.play}</span>
              </button>

              <a
                href={generatedVideo.videoUrl}
                download="bangla-ai-video.mp4"
                className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold transition shadow-sm"
              >
                <Download className="h-3.5 w-3.5" />
                <span>{t.download}</span>
              </a>

              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-200 text-xs font-semibold border border-neutral-700 transition"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>{t.share}</span>
              </button>

              <button
                onClick={() => onNavigate('video-editor', prompt, { videoUrl: generatedVideo.videoUrl })}
                className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-200 text-xs font-semibold border border-neutral-700 transition"
              >
                <Film className="h-3.5 w-3.5 text-indigo-400" />
                <span>{isBn ? 'Edit Video' : 'Edit Video'}</span>
              </button>

              <button
                onClick={handleGenerateVideo}
                className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-200 text-xs font-semibold border border-neutral-700 transition col-span-2 sm:col-span-1"
              >
                <RefreshCw className="h-3.5 w-3.5 text-amber-400" />
                <span>{isBn ? 'Again' : 'Again'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
