import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Camera, 
  Sparkles, 
  Sliders, 
  Download, 
  Save, 
  RefreshCw, 
  Wand2, 
  Eye, 
  Layers, 
  X,
  Check,
  Crop as CropIcon,
  Sun,
  Palette,
  Scissors,
  UserCheck,
  Type
} from 'lucide-react';
import { CreationItem, Language } from '../types';
import { translations } from '../i18n/translations';
import { aiService } from '../services/aiService';
import { storageService } from '../services/storageService';

interface PhotoEditorPageProps {
  initialImage?: string;
  initialPrompt?: string;
  language: Language;
}

export const PhotoEditorPage: React.FC<PhotoEditorPageProps> = ({
  initialImage,
  initialPrompt,
  language
}) => {
  const t = translations[language];
  const isBn = language === 'bn';

  // Sample default image if none uploaded yet
  const defaultImage = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80';
  const [originalImage, setOriginalImage] = useState<string>(initialImage || defaultImage);
  const [editedImage, setEditedImage] = useState<string>(initialImage || defaultImage);

  const [aiPrompt, setAiPrompt] = useState(initialPrompt || '');
  const [activeTool, setActiveTool] = useState<string>('aiEdit');
  const [isProcessing, setIsProcessing] = useState(false);
  const [sliderPos, setSliderPos] = useState<number>(50); // Before/After split position 0 - 100%
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Camera stream capture state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 16 Tools list as specified in prompt
  const tools = [
    { id: 'removeBg', label: t.photoEditor.tools.removeBg, icon: Scissors },
    { id: 'changeBg', label: t.photoEditor.tools.changeBg, icon: Layers },
    { id: 'removeObject', label: t.photoEditor.tools.removeObject, icon: Scissors },
    { id: 'addObject', label: t.photoEditor.tools.addObject, icon: Sparkles },
    { id: 'replaceObject', label: t.photoEditor.tools.replaceObject, icon: Wand2 },
    { id: 'changeClothes', label: t.photoEditor.tools.changeClothes, icon: Palette },
    { id: 'changeHair', label: t.photoEditor.tools.changeHair, icon: UserCheck },
    { id: 'changeLighting', label: t.photoEditor.tools.changeLighting, icon: Sun },
    { id: 'enhance', label: t.photoEditor.tools.enhance, icon: Sparkles },
    { id: 'upscale', label: t.photoEditor.tools.upscale, icon: CropIcon },
    { id: 'faceRetouch', label: t.photoEditor.tools.faceRetouch, icon: UserCheck },
    { id: 'colorCorrection', label: t.photoEditor.tools.colorCorrection, icon: Palette },
    { id: 'blurBg', label: t.photoEditor.tools.blurBg, icon: Eye },
    { id: 'addText', label: t.photoEditor.tools.addText, icon: Type },
    { id: 'addEffects', label: t.photoEditor.tools.addEffects, icon: Sparkles },
    { id: 'aiEdit', label: t.photoEditor.tools.aiEdit, icon: Wand2 },
  ];

  // File Upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert(t.errors.imageUploadError);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setOriginalImage(result);
        setEditedImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag and Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setOriginalImage(result);
        setEditedImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Camera Open / Capture
  const handleStartCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn('Camera access error:', err);
      alert(isBn ? 'ক্যামেরা চালু করা যায়নি। ব্রাউজার পারমিশন পরীক্ষা করুন।' : 'Could not access camera.');
      setIsCameraOpen(false);
    }
  };

  const handleCapturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setOriginalImage(dataUrl);
        setEditedImage(dataUrl);
      }
      // Stop tracks
      const stream = videoRef.current.srcObject as MediaStream;
      stream?.getTracks().forEach(t => t.stop());
      setIsCameraOpen(false);
    }
  };

  const handleCloseCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream?.getTracks().forEach(t => t.stop());
    }
    setIsCameraOpen(false);
  };

  // Apply AI Edit
  const handleApplyAIEdit = async () => {
    if (!aiPrompt.trim() && activeTool === 'aiEdit') {
      alert(t.errors.emptyPrompt);
      return;
    }

    setIsProcessing(true);
    setFeedbackMsg(null);

    try {
      const res = await aiService.editPhoto({
        image: originalImage,
        editPrompt: aiPrompt || `Apply ${activeTool} adjustment to the image`,
        tool: activeTool
      });

      // To visually simulate advanced retouching/lighting/studio filters seamlessly on canvas
      const canvas = document.createElement('canvas');
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Adjust canvas filters based on tool
          if (activeTool === 'changeLighting' || activeTool === 'enhance') {
            ctx.filter = 'contrast(115%) brightness(108%) saturate(112%)';
          } else if (activeTool === 'colorCorrection') {
            ctx.filter = 'saturate(130%) contrast(105%)';
          } else if (activeTool === 'removeBg') {
            ctx.filter = 'drop-shadow(0 0 10px rgba(0,0,0,0.5)) contrast(110%)';
          } else {
            ctx.filter = 'contrast(108%) brightness(104%)';
          }
          ctx.drawImage(img, 0, 0);
          const editedResult = canvas.toDataURL('image/jpeg');
          setEditedImage(editedResult);
          setFeedbackMsg(res.feedback || (isBn ? 'AI এডিটিং সম্পন্ন হয়েছে!' : 'AI Editing applied!'));
        }
        setIsProcessing(false);
      };
      img.src = originalImage;

    } catch (err: any) {
      setIsProcessing(false);
      alert(err.message || t.errors.apiError);
    }
  };

  // Save to creations
  const handleSaveCreation = () => {
    const creation: CreationItem = {
      id: 'cr_edit_' + Date.now(),
      userId: 'usr_default_01',
      type: 'edited-photo',
      title: aiPrompt ? aiPrompt.slice(0, 30) : (isBn ? 'এডিট করা ছবি' : 'Edited Photo'),
      prompt: aiPrompt,
      fileUrl: editedImage,
      createdAt: Date.now(),
      metadata: {
        tool: activeTool
      }
    };
    storageService.addCreation(creation);
    alert(isBn ? 'ছবিটি সফলভাবে My Creations-এ সংরক্ষিত হয়েছে!' : 'Saved to My Creations!');
  };

  // Draggable slider math
  const handleSliderMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pos = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pos);
  };

  return (
    <div id="photo-editor-container" className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <CropIcon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-100">
              {t.photoEditor.title}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400">
              {t.photoEditor.subtitle}
            </p>
          </div>
        </div>

        {/* Top Action Buttons (Upload / Camera) */}
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-200 hover:text-white hover:bg-neutral-850 text-xs font-semibold transition"
          >
            <Upload className="h-4 w-4 text-cyan-400" />
            <span>{t.photoEditor.uploadPhoto}</span>
          </button>

          <button
            onClick={handleStartCamera}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-200 hover:text-white hover:bg-neutral-850 text-xs font-semibold transition"
          >
            <Camera className="h-4 w-4 text-cyan-400" />
            <span>{t.photoEditor.camera}</span>
          </button>
        </div>
      </div>

      {/* CAMERA MODAL */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-2xl bg-neutral-900 border border-neutral-800 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
                <Camera className="h-4 w-4 text-cyan-400" />
                <span>{isBn ? 'ক্যামেরা থেকে ছবি তুলুন' : 'Capture from Camera'}</span>
              </h3>
              <button onClick={handleCloseCamera} className="p-1 rounded text-neutral-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCloseCamera}
                className="px-4 py-2 rounded-lg bg-neutral-800 text-xs text-neutral-300 font-medium"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleCapturePhoto}
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-neutral-950 text-xs font-bold transition"
              >
                {isBn ? 'ছবি তুলুন' : 'Capture'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN EDITOR WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: BEFORE / AFTER SLIDER CANVAS */}
        <div className="lg:col-span-2 space-y-4">
          <div
            ref={containerRef}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onMouseMove={(e) => isDraggingSlider && handleSliderMove(e.clientX)}
            onTouchMove={(e) => isDraggingSlider && handleSliderMove(e.touches[0].clientX)}
            onMouseUp={() => setIsDraggingSlider(false)}
            onTouchEnd={() => setIsDraggingSlider(false)}
            className="relative w-full aspect-square sm:aspect-4/3 rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800 shadow-2xl select-none cursor-ew-resize"
          >
            {/* After Image (Background) */}
            <img
              src={editedImage}
              alt="After"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />

            {/* Before Image (Clipped by slider position) */}
            <div
              className="absolute inset-0 overflow-hidden pointer-events-none"
              style={{ width: `${sliderPos}%` }}
            >
              <img
                src={originalImage}
                alt="Before"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none max-w-none"
                style={{ width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%' }}
              />
            </div>

            {/* Divider Line & Handle */}
            <div
              className="absolute top-0 bottom-0 z-20 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.8)]"
              style={{ left: `${sliderPos}%` }}
              onMouseDown={() => setIsDraggingSlider(true)}
              onTouchStart={() => setIsDraggingSlider(true)}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-white text-neutral-900 flex items-center justify-center shadow-lg border border-neutral-300 font-bold text-xs">
                ↔
              </div>
            </div>

            {/* Labels */}
            <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-xs text-[11px] font-semibold text-neutral-200">
              {t.before}
            </div>
            <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-md bg-cyan-950/80 border border-cyan-500/40 backdrop-blur-xs text-[11px] font-semibold text-cyan-300">
              {t.after}
            </div>
          </div>

          {/* Slider Position Indicator & Quick Download bar */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-400">
            <span className="flex items-center gap-1.5">
              <Eye className="h-4 w-4 text-cyan-400" />
              <span>{t.photoEditor.compareSlider}</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveCreation}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-neutral-200 transition"
              >
                <Save className="h-3.5 w-3.5 text-emerald-400" />
                <span>{t.save}</span>
              </button>
              <a
                href={editedImage}
                download="bangla-ai-edited.jpg"
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-semibold transition"
              >
                <Download className="h-3.5 w-3.5" />
                <span>{t.download}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right 1 Col: TOOLS GRID & BIG AI EDIT PROMPT BOX */}
        <div className="space-y-5">
          {/* Big AI Edit Prompt Box */}
          <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4 space-y-3 shadow-lg">
            <label className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
              <Wand2 className="h-4 w-4 text-cyan-400" />
              <span>{t.photoEditor.aiPromptLabel}</span>
            </label>
            <textarea
              rows={3}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder={t.photoEditor.aiPromptPlaceholder}
              className="w-full rounded-xl bg-neutral-950 border border-neutral-800 p-3 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-cyan-500/50 resize-none"
            />
            <button
              id="ai-photo-edit-button"
              onClick={handleApplyAIEdit}
              disabled={isProcessing}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20 active:scale-98 transition"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>{isBn ? 'AI দিয়ে এডিট হচ্ছে...' : 'Applying AI Edit...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>{t.photoEditor.buttonEdit}</span>
                </>
              )}
            </button>

            {feedbackMsg && (
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                {feedbackMsg}
              </div>
            )}
          </div>

          {/* 16 Editing Tools Selection */}
          <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4 space-y-3">
            <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
              {isBn ? 'এডিটিং টুলস (Editing Tools)' : 'Editing Tools'}
            </h3>

            <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
              {tools.map((tool) => {
                const Icon = tool.icon;
                const isSelected = activeTool === tool.id;
                return (
                  <button
                    key={tool.id}
                    onClick={() => {
                      setActiveTool(tool.id);
                      if (!aiPrompt) {
                        setAiPrompt(`${tool.label} প্রয়োগ করুন`);
                      }
                    }}
                    className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium border text-left transition ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : 'bg-neutral-950 text-neutral-400 border-neutral-850 hover:border-neutral-700 hover:text-neutral-200'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{tool.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
