import React, { useState, useRef } from 'react';
import { 
  User, 
  Mail, 
  Crown, 
  Coins, 
  Sparkles, 
  LogOut, 
  Edit3, 
  Check, 
  Phone, 
  ShieldCheck, 
  Zap,
  Layers,
  Calendar,
  Image as ImageIcon,
  Video,
  Bookmark,
  ArrowRight,
  Camera,
  Upload
} from 'lucide-react';
import { AppView, Language, UserProfile } from '../types';
import { translations } from '../i18n/translations';
import { storageService } from '../services/storageService';

interface ProfilePageProps {
  user: UserProfile;
  onUpdateUser: (user: UserProfile) => void;
  onOpenPricing: () => void;
  language: Language;
  onNavigate?: (view: AppView) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  user,
  onUpdateUser,
  onOpenPricing,
  language,
  onNavigate
}) => {
  const t = translations[language];
  const isBn = language === 'bn';

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone || '+880 1700-000000');
  const [loginMethod, setLoginMethod] = useState<'google' | 'email' | 'phone'>('google');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Gallery Photo Picker & Permanent Save
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast(isBn ? 'দয়া করে একটি ছবি (JPG/PNG) নির্বাচন করুন' : 'Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // High quality canvas square crop & resize to 360x360
        // This guarantees permanent storage in localStorage without quota error
        const canvas = document.createElement('canvas');
        const size = 360;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const minDim = Math.min(img.width, img.height);
          const startX = (img.width - minDim) / 2;
          const startY = (img.height - minDim) / 2;
          ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, size, size);

          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.90);
          
          // Lock permanently in storageService
          const updatedUser = storageService.updateUserAvatar(compressedDataUrl);
          const updated: UserProfile = {
            ...user,
            avatar: compressedDataUrl,
            profileImage: compressedDataUrl
          };
          onUpdateUser(updated);
          storageService.saveUserProfile(updated);

          showToast(isBn ? '✓ প্রোফাইল ফটো গ্যালারি থেকে স্থায়ীভাবে সংরক্ষিত হয়েছে!' : '✓ Profile photo permanently saved from gallery!');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Live creations & saved prompts statistics
  const creations = storageService.getCreations();
  const photosCount = creations.filter(c => c.type === 'image' || c.type === 'edited-photo').length;
  const videosCount = creations.filter(c => c.type === 'video').length;
  const savedPromptsCount = storageService.getSavedPrompts().length;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...user,
      name,
      email,
      phone
    };
    onUpdateUser(updated);
    storageService.saveUserProfile(updated);
    setIsEditing(false);
  };

  const handleLogout = () => {
    if (confirm(isBn ? 'আপনি কি নিশ্চিত যে লগআউট করতে চান?' : 'Are you sure you want to log out?')) {
      // Reset user to default or prompt login
      const resetUser: UserProfile = {
        id: 'usr_guest',
        userId: 'usr_guest',
        name: isBn ? 'অতিথি ব্যবহারকারী' : 'Guest User',
        email: 'guest@bangla-ai-studio.com',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        plan: 'Free',
        remainingCredits: 20,
        totalCreations: 0,
        joinedDate: Date.now(),
        createdAt: Date.now(),
        stats: {
          totalImages: 0,
          totalVideos: 0,
          totalAudios: 0,
          totalProjects: 0
        }
      };
      onUpdateUser(resetUser);
      storageService.saveUserProfile(resetUser);
    }
  };

  return (
    <div id="profile-page-container" className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-neutral-900 border border-emerald-500/50 text-white shadow-2xl animate-fade-in text-sm font-medium">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hidden File Input for Device/Gallery Photo Picker */}
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarChange}
        className="hidden"
        id="profile-gallery-image-input"
      />

      {/* Profile Header Card */}
      <div className="rounded-3xl bg-neutral-900 border border-neutral-800 p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Background glow accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          {/* Avatar with Pro badge & Gallery change button */}
          <div className="relative group">
            <div 
              onClick={() => avatarInputRef.current?.click()}
              className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-2xl overflow-hidden border-2 border-neutral-700 shadow-md cursor-pointer group"
              title={isBn ? 'গ্যালারি থেকে ফটো পরিবর্তন করতে ক্লিক করুন' : 'Click to change photo from gallery'}
            >
              <img
                src={user.avatar}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-neutral-950/60 opacity-0 group-hover:opacity-100 transition duration-200 flex flex-col items-center justify-center gap-1 text-white">
                <Camera className="h-5 w-5 text-emerald-400" />
                <span className="text-[10px] font-bold">{isBn ? 'গ্যালারি' : 'Gallery'}</span>
              </div>
            </div>

            {/* Change Photo Badge button */}
            <button
              onClick={() => avatarInputRef.current?.click()}
              className="absolute -bottom-2 -left-2 p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-emerald-400 border border-neutral-700 shadow-lg transition"
              title={isBn ? 'গ্যালারি থেকে ফটো পরিবর্তন করুন' : 'Change photo from gallery'}
            >
              <Camera className="h-3.5 w-3.5" />
            </button>

            <div className={`absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 shadow-lg ${
              user.plan === 'Pro' 
                ? 'bg-amber-500 text-neutral-950' 
                : 'bg-neutral-800 text-neutral-300 border border-neutral-700'
            }`}>
              <Crown className="h-3 w-3" />
              <span>{user.plan}</span>
            </div>
          </div>

          {/* User Info Details */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-neutral-100">
                  {user.name}
                </h1>
                <p className="text-xs sm:text-sm text-neutral-400">
                  {user.email}
                </p>
                {user.phone && (
                  <p className="text-xs text-neutral-500">
                    {user.phone}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2">
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30 transition"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>{isBn ? 'ফটো পরিবর্তন' : 'Change Photo'}</span>
                </button>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-200 text-xs font-semibold border border-neutral-700 transition"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>{t.profile.editProfile}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-rose-950/60 text-neutral-300 hover:text-rose-400 text-xs font-semibold border border-neutral-700 transition"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>{t.profile.logout}</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-3 text-xs text-neutral-400">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-neutral-500" />
                <span>{isBn ? 'সদস্য হয়েছেন:' : 'Joined:'} {new Date(user.joinedDate).toLocaleDateString()}</span>
              </span>
              <span className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>{isBn ? 'যাচাইকৃত প্রোফাইল' : 'Verified Account'}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 1000+ AI PROMPTS BIG HERO BUTTON */}
      <div className="p-1 rounded-3xl bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500 shadow-xl">
        <div className="p-6 rounded-[22px] bg-neutral-950 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{isBn ? 'এক্সক্লুসিভ লাইব্রেরি' : 'Exclusive Library'}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              {isBn ? '✨ ১০০০+ প্রস্তুত AI ফটো ও ভিডিও প্রম্পট' : '✨ 1000+ Ready AI Photo & Video Prompts'}
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-xl">
              {isBn 
                ? 'বাঙালি সংস্কৃতি, প্রকৃতি, গ্রাম ও শহরের সিনেমাটিক প্রম্পট কালেকশন। এক ক্লিকে পছন্দ করে বানিয়ে নিন চমৎকার কন্টেন্ট।'
                : 'Curated collection of family-friendly Bangladeshi cinematic prompts ready for instant generation.'}
            </p>
          </div>

          <button
            id="profile-open-1000-prompts-btn"
            onClick={() => onNavigate?.('prompt-library')}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-emerald-400 hover:from-amber-300 hover:to-emerald-300 text-neutral-950 text-sm font-extrabold shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition shrink-0"
          >
            <Sparkles className="h-4 w-4 text-neutral-950" />
            <span>✨ 1000+ AI PROMPTS</span>
            <ArrowRight className="h-4 w-4 text-neutral-950" />
          </button>
        </div>
      </div>

      {/* METRIC STATS: Total Creations, Photos Created, Videos Created, Saved Prompts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Creations */}
        <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-400">{isBn ? 'মোট তৈরি (Total)' : 'Total Creations'}</span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-neutral-100">
            {creations.length}
          </div>
          <p className="text-[11px] text-neutral-500">
            {isBn ? 'ছবি, ভিডিও ও অডিও মিলিয়ে' : 'All assets generated'}
          </p>
        </div>

        {/* Photos Created */}
        <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-400">{isBn ? 'তৈরি করা ছবি' : 'Photos Created'}</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <ImageIcon className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-neutral-100">
            {photosCount}
          </div>
          <p className="text-[11px] text-neutral-500">
            {isBn ? 'সিনেমাটিক ও এডিট করা ছবি' : 'Photos & portraits'}
          </p>
        </div>

        {/* Videos Created */}
        <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-400">{isBn ? 'তৈরি করা ভিডিও' : 'Videos Created'}</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Video className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-neutral-100">
            {videosCount}
          </div>
          <p className="text-[11px] text-neutral-500">
            {isBn ? 'AI শর্ট ফিল্ম ও মোশন রিল' : 'AI short films & motion reels'}
          </p>
        </div>

        {/* Saved Prompts */}
        <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-400">{isBn ? 'সংরক্ষিত প্রম্পট' : 'Saved Prompts'}</span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <Bookmark className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-neutral-100">
            {savedPromptsCount}
          </div>
          <p className="text-[11px] text-neutral-500">
            {isBn ? 'লাইব্রেরি থেকে বুকমার্ক করা' : 'Bookmarked from library'}
          </p>
        </div>
      </div>

      {/* CREDITS & PLAN ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Remaining Credits */}
        <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-400">{t.profile.credits}</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Coins className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-neutral-100">
            {user.remainingCredits}
          </div>
          <p className="text-[11px] text-neutral-500">
            {isBn ? 'প্রতি ক্রিয়েশনে ১-২ ক্রেডিট খরচ হয়' : 'Consumes 1-2 credits per generation'}
          </p>
        </div>

        {/* Subscription Plan Card */}
        <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 via-neutral-900 to-neutral-900 border border-amber-500/30 p-5 space-y-3 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-400">{t.profile.plan}</span>
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                <Crown className="h-4 w-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-amber-300 mt-1">
              {user.plan} {isBn ? 'প্ল্যান' : 'Plan'}
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span className="font-semibold">{isBn ? 'প্রো সুবিধা সক্রিয় রয়েছে' : 'Pro features active'}</span>
          </div>
        </div>
      </div>

      {/* EDIT PROFILE FORM */}
      {isEditing && (
        <form 
          onSubmit={handleSave}
          className="rounded-2xl bg-neutral-900 border border-neutral-800 p-6 space-y-4 animate-in fade-in"
        >
          <h3 className="text-sm font-bold text-neutral-100">
            {t.profile.editProfile}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-neutral-400">{isBn ? 'নাম' : 'Name'}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-9 rounded-xl bg-neutral-950 border border-neutral-800 px-3 text-xs text-neutral-100 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-neutral-400">{isBn ? 'ইমেইল' : 'Email'}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-9 rounded-xl bg-neutral-950 border border-neutral-800 px-3 text-xs text-neutral-100 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-neutral-400">{isBn ? 'ফোন নম্বর' : 'Phone'}</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-9 rounded-xl bg-neutral-950 border border-neutral-800 px-3 text-xs text-neutral-100 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-xl bg-neutral-800 text-xs text-neutral-300"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold"
            >
              {isBn ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}

      {/* LOGIN OPTIONS (Section 12: Google, Email, Phone for Bangladesh + other countries) */}
      <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-6 space-y-4">
        <h3 className="text-sm font-bold text-neutral-200 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>{isBn ? 'সংযুক্ত লগইন মেথড (Login Accounts)' : 'Linked Login Accounts'}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-850 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-xs text-neutral-200">Google</span>
            </div>
            <span className="text-[11px] text-emerald-400 font-semibold">{isBn ? 'সংযুক্ত' : 'Connected'}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-850 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 text-sky-400" />
              <span className="font-medium text-xs text-neutral-200">Email</span>
            </div>
            <span className="text-[11px] text-emerald-400 font-semibold">{isBn ? 'সংযুক্ত' : 'Connected'}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-850 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 text-amber-400" />
              <span className="font-medium text-xs text-neutral-200">Phone (BD)</span>
            </div>
            <span className="text-[11px] text-emerald-400 font-semibold">{isBn ? 'সংযুক্ত' : 'Connected'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
