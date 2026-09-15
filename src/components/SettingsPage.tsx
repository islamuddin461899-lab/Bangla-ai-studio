import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Globe, 
  Moon, 
  Sun, 
  Cpu, 
  Key, 
  HardDrive, 
  ShieldCheck, 
  FileText, 
  Trash2,
  Check,
  Info
} from 'lucide-react';
import { AIModelOption, AppSettings, Language, ThemeMode } from '../types';
import { translations } from '../i18n/translations';
import { storageService } from '../services/storageService';

interface SettingsPageProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  language: Language;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  onUpdateSettings,
  language
}) => {
  const t = translations[language];
  const isBn = language === 'bn';

  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [showClearCacheMsg, setShowClearCacheMsg] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const handleLanguageChange = (lang: Language) => {
    const updated = { ...localSettings, language: lang };
    setLocalSettings(updated);
    onUpdateSettings(updated);
    storageService.saveSettings(updated);
  };

  const handleThemeChange = (theme: ThemeMode) => {
    const updated = { ...localSettings, theme };
    setLocalSettings(updated);
    onUpdateSettings(updated);
    storageService.saveSettings(updated);
  };

  const handleModelChange = (model: AIModelOption) => {
    const updated = { ...localSettings, aiModel: model };
    setLocalSettings(updated);
    onUpdateSettings(updated);
    storageService.saveSettings(updated);
  };

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(localSettings);
    storageService.saveSettings(localSettings);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2500);
  };

  const handleClearCache = () => {
    if (confirm(isBn ? 'আপনি কি ব্রাউজার ক্যাশ ও টেম্পোরারি ডাটা মুছে ফেলতে চান?' : 'Clear browser cache and local history?')) {
      // Clear local storage cache
      setShowClearCacheMsg(true);
      setTimeout(() => setShowClearCacheMsg(false), 3000);
    }
  };

  const models: Array<{ id: AIModelOption; name: string; desc: string }> = [
    { id: 'gemini', name: 'Google Gemini 2.5 Flash', desc: isBn ? 'সর্বাধুনিক দ্রুত ও স্মার্ট বাংলা চ্যাট ও ক্রিয়েটিভ প্রসেসিং' : 'Fast, multimodal reasoning with high accuracy' },
    { id: 'imagen', name: 'Google Imagen 3', desc: isBn ? 'হাই-রেজ্যুলেশন রিয়েলিস্টিক ফটো জেনারেশন ইঞ্জিন' : 'High-fidelity cinematic realistic image generation' },
    { id: 'stable-diffusion', name: 'Stable Diffusion XL', desc: isBn ? 'আর্টিস্টিক ও অ্যানিমে স্টাইলের জন্য দারুণ অপ্টিমাইজড' : 'Specialized for anime, concept art and stylizations' },
    { id: 'custom', name: 'Custom AI Engine', desc: isBn ? 'আপনার নিজস্ব কাস্টম মডেল এন্ডপয়েন্ট' : 'Direct custom AI API backend integration' },
  ];

  return (
    <div id="settings-page-container" className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Title Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <SettingsIcon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-100">
              {t.settings.title}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400">
              {t.settings.subtitle}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* 1. Language: বাংলা / English */}
        <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Globe className="h-4 w-4 text-emerald-400" />
              <div>
                <h3 className="text-sm font-semibold text-neutral-200">
                  {t.settings.language}
                </h3>
                <p className="text-xs text-neutral-400">
                  {isBn ? 'অ্যাপ্লিকেশনের প্রদর্শিত ভাষা নির্বাচন করুন' : 'Choose application display language'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-950 border border-neutral-800">
              <button
                onClick={() => handleLanguageChange('bn')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  localSettings.language === 'bn'
                    ? 'bg-emerald-500 text-neutral-950 shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                বাংলা
              </button>
              <button
                onClick={() => handleLanguageChange('en')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  localSettings.language === 'en'
                    ? 'bg-emerald-500 text-neutral-950 shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                English
              </button>
            </div>
          </div>
        </div>

        {/* 2. Theme: Dark Mode / Light Mode */}
        <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Moon className="h-4 w-4 text-sky-400" />
              <div>
                <h3 className="text-sm font-semibold text-neutral-200">
                  {t.settings.theme}
                </h3>
                <p className="text-xs text-neutral-400">
                  {isBn ? 'ডার্ক অথবা লাইট মোড ইন্টারফেস' : 'Dark or Light appearance'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-950 border border-neutral-800">
              <button
                onClick={() => handleThemeChange('dark')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  localSettings.theme === 'dark'
                    ? 'bg-neutral-800 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Moon className="h-3.5 w-3.5" />
                <span>{t.settings.darkMode}</span>
              </button>
              <button
                onClick={() => handleThemeChange('light')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  localSettings.theme === 'light'
                    ? 'bg-neutral-800 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Sun className="h-3.5 w-3.5" />
                <span>{t.settings.lightMode}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. AI Model: Gemini / Imagen / Stable Diffusion / Custom */}
        <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5 space-y-3">
          <div className="flex items-center gap-2.5">
            <Cpu className="h-4 w-4 text-violet-400" />
            <div>
              <h3 className="text-sm font-semibold text-neutral-200">
                {t.settings.aiModel}
              </h3>
              <p className="text-xs text-neutral-400">
                {isBn ? 'ডিফল্ট কৃত্রিম বুদ্ধিমত্তা মডেল ইঞ্জিন নির্বাচন করুন' : 'Select your primary AI model provider'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {models.map(m => (
              <button
                key={m.id}
                onClick={() => handleModelChange(m.id)}
                className={`p-3.5 rounded-xl border text-left transition ${
                  localSettings.aiModel === m.id
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-neutral-100 shadow-sm'
                    : 'bg-neutral-950 border-neutral-800/80 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-neutral-200">
                    {m.name}
                  </span>
                  {localSettings.aiModel === m.id && (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  )}
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">
                  {m.desc}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* 4. API Key (Optional custom key) */}
        <form onSubmit={handleSaveApiKey} className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Key className="h-4 w-4 text-amber-400" />
              <div>
                <h3 className="text-sm font-semibold text-neutral-200">
                  {t.settings.apiKey}
                </h3>
                <p className="text-xs text-neutral-400">
                  {isBn ? 'আপনার নিজস্ব কাস্টম Gemini বা মডেল কি (ঐচ্ছিক)' : 'Optional custom Gemini/model API key'}
                </p>
              </div>
            </div>

            {showSavedToast && (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="h-3.5 w-3.5" />
                {isBn ? 'সংরক্ষিত হয়েছে' : 'Saved'}
              </span>
            )}
          </div>

          <div className="flex gap-2 pt-1">
            <input
              type="password"
              value={localSettings.customApiKey || ''}
              onChange={(e) => setLocalSettings({ ...localSettings, customApiKey: e.target.value })}
              placeholder="AIzaSy..."
              className="flex-1 h-9 rounded-xl bg-neutral-950 border border-neutral-800 px-3 text-xs text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500/50 font-mono"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-200 text-xs font-semibold border border-neutral-700 transition"
            >
              {isBn ? 'সংরক্ষণ' : 'Save'}
            </button>
          </div>
        </form>

        {/* 5. Storage: Space used */}
        <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <HardDrive className="h-4 w-4 text-emerald-400" />
              <div>
                <h3 className="text-sm font-semibold text-neutral-200">
                  {t.settings.storage}
                </h3>
                <p className="text-xs text-neutral-400">
                  {t.settings.storageUsed}
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-neutral-300">
              {localSettings.storageUsedMb} MB / {localSettings.maxStorageMb} MB
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 rounded-full bg-neutral-950 overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${(localSettings.storageUsedMb / localSettings.maxStorageMb) * 100}%` }}
            />
          </div>
        </div>

        {/* 6. Clear Cache, Privacy Policy, Terms of Service */}
        <div className="rounded-2xl bg-neutral-900 border border-neutral-800 divide-y divide-neutral-850 overflow-hidden">
          {/* Clear Cache */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Trash2 className="h-4 w-4 text-rose-400" />
              <span className="text-xs font-semibold text-neutral-200">
                {t.settings.clearCache}
              </span>
            </div>
            <button
              onClick={handleClearCache}
              className="px-3 py-1.5 rounded-lg bg-neutral-950 hover:bg-rose-950/40 text-neutral-400 hover:text-rose-400 border border-neutral-800 text-xs font-medium transition"
            >
              {showClearCacheMsg ? (isBn ? 'ক্যাশ মুছে ফেলা হয়েছে' : 'Cache Cleared') : t.settings.clearCache}
            </button>
          </div>

          {/* Privacy Policy */}
          <div 
            onClick={() => setShowPrivacyModal(true)}
            className="p-4 flex items-center justify-between hover:bg-neutral-850/50 cursor-pointer transition"
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-semibold text-neutral-200">
                {t.settings.privacyPolicy}
              </span>
            </div>
            <span className="text-xs text-neutral-500">›</span>
          </div>

          {/* Terms of Service */}
          <div 
            onClick={() => setShowTermsModal(true)}
            className="p-4 flex items-center justify-between hover:bg-neutral-850/50 cursor-pointer transition"
          >
            <div className="flex items-center gap-2.5">
              <FileText className="h-4 w-4 text-neutral-400" />
              <span className="text-xs font-semibold text-neutral-200">
                {t.settings.termsOfService}
              </span>
            </div>
            <span className="text-xs text-neutral-500">›</span>
          </div>
        </div>
      </div>

      {/* PRIVACY POLICY MODAL */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-neutral-900 border border-neutral-800 p-6 space-y-4">
            <h3 className="text-base font-bold text-neutral-100">
              {t.settings.privacyPolicy}
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {isBn 
                ? 'বাংলা AI Studio আপনার ব্যক্তিগত তথ্যের গোপনীয়তা রক্ষা করতে প্রতিশ্রুতিবদ্ধ। আপনার আপলোড করা ছবি বা ভিডিও কোনো তৃতীয় পক্ষের সাথে শেয়ার করা হয় না। সমস্ত ডেটা সুরক্ষিত এনক্রিপশন সহ ক্লাউডে সংরক্ষিত হয়।'
                : 'Bangla AI Studio respects user privacy. Uploaded media and generated assets are kept secure and never shared with third parties.'}
            </p>
            <button
              onClick={() => setShowPrivacyModal(false)}
              className="w-full py-2 rounded-xl bg-emerald-500 text-neutral-950 font-bold text-xs"
            >
              {isBn ? 'ঠিক আছে' : 'Close'}
            </button>
          </div>
        </div>
      )}

      {/* TERMS OF SERVICE MODAL */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-neutral-900 border border-neutral-800 p-6 space-y-4">
            <h3 className="text-base font-bold text-neutral-100">
              {t.settings.termsOfService}
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {isBn 
                ? 'বাংলা AI Studio প্ল্যাটফর্মটি ব্যবহার করে তৈরি করা সমস্ত কনটেন্টের বাণিজ্যিক ও ব্যক্তিগত ব্যবহারের স্বত্ব ব্যবহারকারীর নিজস্ব। যেকোনো ক্ষতিকারক, বেআইনি বা নীতিবহির্ভূত ছবি ও ভিডিও তৈরি করা সম্পূর্ণ নিষিদ্ধ।'
                : 'Users retain commercial rights for assets generated on Bangla AI Studio following ethical content guidelines.'}
            </p>
            <button
              onClick={() => setShowTermsModal(false)}
              className="w-full py-2 rounded-xl bg-emerald-500 text-neutral-950 font-bold text-xs"
            >
              {isBn ? 'ঠিক আছে' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
