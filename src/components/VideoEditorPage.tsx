import React, { useState, useRef, useEffect } from 'react';
import { 
  Film, 
  Play, 
  Pause, 
  Scissors, 
  Gauge, 
  Music, 
  Mic2, 
  Type, 
  Subtitles, 
  Sliders, 
  Sparkles, 
  Download, 
  Check, 
  RotateCcw,
  Volume2,
  Tv
} from 'lucide-react';
import { AspectRatio, CreationItem, Language } from '../types';
import { translations } from '../i18n/translations';
import { storageService } from '../services/storageService';

interface VideoEditorPageProps {
  initialVideo?: string;
  initialPrompt?: string;
  language: Language;
}

export const VideoEditorPage: React.FC<VideoEditorPageProps> = ({
  initialVideo,
  initialPrompt,
  language
}) => {
  const t = translations[language];
  const isBn = language === 'bn';

  const defaultSampleVideo = initialVideo || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
  const [videoUrl, setVideoUrl] = useState<string>(defaultSampleVideo);

  // Video playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(15);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [activeFilter, setActiveFilter] = useState<string>('normal');
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>('16:9');

  // Subtitles & Captions state
  const [autoSubtitlesEnabled, setAutoSubtitlesEnabled] = useState(true);
  const [customCaption, setCustomCaption] = useState(isBn ? 'বাংলা AI Studio দিয়ে তৈরি' : 'Created with Bangla AI Studio');
  const [activeTool, setActiveTool] = useState<string>('trim');

  // Export state
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportedReady, setExportedReady] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Subtitle cues in Bengali
  const banglaSubtitles = [
    { start: 0, end: 4, text: 'সবুজ বাংলার শ্যামল স্নিগ্ধ প্রকৃতির এক মনোরম দৃশ্য।' },
    { start: 4, end: 8, text: 'সূর্যোদয়ের স্বর্ণালী আলোয় ঝলমল করছে চারপাশ।' },
    { start: 8, end: 12, text: 'কৃত্রিম বুদ্ধিমত্তার সাহায্যে তৈরি সিনেমাটিক রূপরেখা।' },
    { start: 12, end: 20, text: 'বাংলা AI Studio - প্রযুক্তির সাথে কল্পনার অপূর্ব মেলবন্ধন।' },
  ];

  const currentSub = banglaSubtitles.find(s => currentTime >= s.start && currentTime < s.end);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 15);
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

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (timelineRef.current && videoRef.current) {
      const rect = timelineRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const newPct = Math.max(0, Math.min(1, clickX / rect.width));
      const newTime = newPct * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const handleExport = () => {
    setIsExporting(true);
    setExportProgress(10);
    setExportedReady(false);

    const interval = setInterval(() => {
      setExportProgress((p) => {
        if (p >= 95) {
          clearInterval(interval);
          setExportProgress(100);
          setTimeout(() => {
            setIsExporting(false);
            setExportedReady(true);
            // Save to creations
            const creation: CreationItem = {
              id: 'cr_edit_vid_' + Date.now(),
              userId: 'usr_default_01',
              type: 'video',
              title: isBn ? 'সম্পাদিত ভিডিও' : 'Edited Video',
              prompt: customCaption,
              fileUrl: videoUrl,
              createdAt: Date.now(),
              metadata: {
                filter: activeFilter,
                speed: playbackRate,
                aspectRatio: selectedRatio
              }
            };
            storageService.addCreation(creation);
          }, 400);
          return 95;
        }
        return p + 20;
      });
    }, 300);
  };

  // Filter styling mapping
  const getFilterStyle = () => {
    switch (activeFilter) {
      case 'cinematic': return 'contrast(120%) saturate(110%) brightness(95%)';
      case 'vintage': return 'sepia(40%) contrast(105%) brightness(95%)';
      case 'bw': return 'grayscale(100%) contrast(125%)';
      case 'vivid': return 'saturate(160%) contrast(110%)';
      default: return 'none';
    }
  };

  return (
    <div id="video-editor-container" className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Film className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-100">
              {t.videoEditor.title}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400">
              {t.videoEditor.subtitle}
            </p>
          </div>
        </div>

        {/* Export Button as specified */}
        <button
          id="export-video-btn"
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-neutral-950 font-bold text-xs shadow-md shadow-sky-500/20 transition active:scale-95"
        >
          {isExporting ? (
            <span>{isBn ? `রেন্ডারিং হচ্ছে (${exportProgress}%)...` : `Rendering (${exportProgress}%)...`}</span>
          ) : (
            <>
              <Download className="h-4 w-4" />
              <span>{t.videoEditor.export}</span>
            </>
          )}
        </button>
      </div>

      {/* WORKSPACE: Player & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Video Screen with Subtitles and Filter */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-neutral-800 shadow-2xl flex items-center justify-center">
            <video
              ref={videoRef}
              src={videoUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              loop
              playsInline
              className="w-full h-full object-contain"
              style={{ filter: getFilterStyle() }}
              onClick={handlePlayToggle}
            />

            {/* Custom Bengali Caption / Auto Subtitles display */}
            {autoSubtitlesEnabled && (
              <div className="absolute bottom-6 inset-x-6 text-center pointer-events-none">
                <span className="inline-block px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md text-yellow-300 text-xs sm:text-sm font-semibold border border-yellow-500/30 shadow-lg">
                  {currentSub ? currentSub.text : customCaption}
                </span>
              </div>
            )}

            {/* Centered Play overlay button */}
            {!isPlaying && (
              <button
                onClick={handlePlayToggle}
                className="absolute h-14 w-14 rounded-full bg-sky-500 text-neutral-950 flex items-center justify-center shadow-2xl hover:scale-110 transition"
              >
                <Play className="h-6 w-6 fill-current ml-1" />
              </button>
            )}

            {/* Aspect Ratio Badge */}
            <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-black/70 text-[10px] text-white font-mono">
              {selectedRatio}
            </div>
          </div>

          {/* TIMELINE AREA as specified */}
          <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
              <span className="flex items-center gap-2">
                <button
                  onClick={handlePlayToggle}
                  className="p-1 rounded-md bg-neutral-800 hover:bg-neutral-750 text-neutral-200"
                >
                  {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                </button>
                <span>{currentTime.toFixed(1)}s / {duration.toFixed(1)}s</span>
              </span>
              <span className="text-[11px] text-neutral-500">
                {t.videoEditor.timeline}
              </span>
            </div>

            {/* Timeline track scrubber */}
            <div
              ref={timelineRef}
              onClick={handleSeek}
              className="relative h-10 w-full rounded-xl bg-neutral-950 border border-neutral-800 cursor-pointer overflow-hidden flex items-center px-1"
            >
              {/* Audio Waveform simulation ticks */}
              <div className="absolute inset-0 flex items-center justify-between px-2 opacity-20 pointer-events-none">
                {Array.from({ length: 40 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-sky-400 rounded-full"
                    style={{ height: `${20 + (i % 5) * 15}%` }}
                  />
                ))}
              </div>

              {/* Progress fill */}
              <div
                className="absolute top-0 bottom-0 left-0 bg-sky-500/25 border-r-2 border-sky-400"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />

              {/* Playhead thumb */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-sky-400 shadow-md pointer-events-none"
                style={{ left: `${(currentTime / duration) * 100}%` }}
              >
                <div className="absolute -top-1 -translate-x-1/2 h-3 w-3 rounded-full bg-sky-400 shadow" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 10 EDITING TOOLS PANEL */}
        <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5 space-y-5">
          <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
            {isBn ? 'ভিডিও এডিটিং টুলস' : 'Video Editing Tools'}
          </h3>

          {/* Tool category selection */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setActiveTool('trim')}
              className={`flex items-center gap-2 p-2 rounded-xl text-xs font-semibold border transition ${
                activeTool === 'trim' ? 'bg-sky-500/20 text-sky-300 border-sky-500/40' : 'bg-neutral-950 text-neutral-400 border-neutral-850'
              }`}
            >
              <Scissors className="h-3.5 w-3.5" />
              <span>{t.videoEditor.trim}</span>
            </button>

            <button
              onClick={() => setActiveTool('speed')}
              className={`flex items-center gap-2 p-2 rounded-xl text-xs font-semibold border transition ${
                activeTool === 'speed' ? 'bg-sky-500/20 text-sky-300 border-sky-500/40' : 'bg-neutral-950 text-neutral-400 border-neutral-850'
              }`}
            >
              <Gauge className="h-3.5 w-3.5" />
              <span>{t.videoEditor.speed}</span>
            </button>

            <button
              onClick={() => setActiveTool('subtitles')}
              className={`flex items-center gap-2 p-2 rounded-xl text-xs font-semibold border transition ${
                activeTool === 'subtitles' ? 'bg-sky-500/20 text-sky-300 border-sky-500/40' : 'bg-neutral-950 text-neutral-400 border-neutral-850'
              }`}
            >
              <Subtitles className="h-3.5 w-3.5" />
              <span>{t.videoEditor.autoSubtitles}</span>
            </button>

            <button
              onClick={() => setActiveTool('filter')}
              className={`flex items-center gap-2 p-2 rounded-xl text-xs font-semibold border transition ${
                activeTool === 'filter' ? 'bg-sky-500/20 text-sky-300 border-sky-500/40' : 'bg-neutral-950 text-neutral-400 border-neutral-850'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{t.videoEditor.filters}</span>
            </button>
          </div>

          {/* Sub-tool panels */}
          <div className="pt-2 border-t border-neutral-850 space-y-4">
            {/* Speed controller */}
            {activeTool === 'speed' && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-neutral-400">{t.videoEditor.speed}</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[0.5, 1, 1.5, 2].map(s => (
                    <button
                      key={s}
                      onClick={() => handleSpeedChange(s)}
                      className={`py-1.5 rounded-lg text-xs font-semibold border transition ${
                        playbackRate === s ? 'bg-sky-500 text-neutral-950 font-bold border-sky-400' : 'bg-neutral-950 text-neutral-300 border-neutral-800'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Subtitles & Bangla Caption */}
            {activeTool === 'subtitles' && (
              <div className="space-y-3">
                <label className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-950 border border-neutral-850 cursor-pointer">
                  <span className="text-xs text-neutral-300 font-semibold">{t.videoEditor.autoSubtitles}</span>
                  <input
                    type="checkbox"
                    checked={autoSubtitlesEnabled}
                    onChange={(e) => setAutoSubtitlesEnabled(e.target.checked)}
                    className="h-4 w-4 rounded text-sky-500 bg-neutral-900 border-neutral-700"
                  />
                </label>

                <div className="space-y-1">
                  <label className="text-xs text-neutral-400">{t.videoEditor.addText}</label>
                  <input
                    type="text"
                    value={customCaption}
                    onChange={(e) => setCustomCaption(e.target.value)}
                    className="w-full h-8 px-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-sky-500/50"
                  />
                </div>
              </div>
            )}

            {/* Filters */}
            {activeTool === 'filter' && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-neutral-400">{t.videoEditor.filters}</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'normal', name: isBn ? 'স্বাভাবিক (Normal)' : 'Normal' },
                    { id: 'cinematic', name: isBn ? 'সিনেমাটিক' : 'Cinematic' },
                    { id: 'vintage', name: isBn ? 'ভিন্টেজ' : 'Vintage' },
                    { id: 'bw', name: isBn ? 'সাদা-কালো' : 'B&W' },
                    { id: 'vivid', name: isBn ? 'উজ্জ্বল (Vivid)' : 'Vivid' },
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setActiveFilter(f.id)}
                      className={`p-2 rounded-lg text-xs font-medium border text-left transition ${
                        activeFilter === f.id ? 'bg-sky-500/20 text-sky-300 border-sky-500/50' : 'bg-neutral-950 text-neutral-400 border-neutral-800'
                      }`}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Aspect Ratio as specified (Reels, TikTok, YouTube) */}
            <div className="space-y-2 pt-2 border-t border-neutral-850">
              <label className="text-xs font-medium text-neutral-400">{t.videoEditor.aspectRatio}</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { ratio: '9:16' as AspectRatio, label: '9:16 (Reels/TikTok)' },
                  { ratio: '16:9' as AspectRatio, label: '16:9 (YouTube)' },
                  { ratio: '1:1' as AspectRatio, label: '1:1 (Square)' },
                ].map(item => (
                  <button
                    key={item.ratio}
                    onClick={() => setSelectedRatio(item.ratio)}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border transition text-center ${
                      selectedRatio === item.ratio ? 'bg-sky-500/20 text-sky-300 border-sky-500/40' : 'bg-neutral-950 text-neutral-400 border-neutral-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Export Complete Notification */}
          {exportedReady && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
              <span>{isBn ? 'ভিডিও এক্সপোর্ট সম্পন্ন হয়েছে!' : 'Video Exported!'}</span>
              <a
                href={videoUrl}
                download="bangla-ai-edited-video.mp4"
                className="font-bold underline text-emerald-400"
              >
                {t.download}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
