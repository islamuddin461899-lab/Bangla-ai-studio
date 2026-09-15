import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Search, 
  Filter, 
  Copy, 
  Check, 
  Wand2, 
  ImageIcon, 
  Video, 
  Mic2, 
  Bookmark, 
  BookmarkCheck, 
  ChevronRight, 
  ArrowUpRight, 
  Play, 
  User, 
  Layers, 
  Tag, 
  Flame, 
  Clock, 
  X,
  Volume2,
  Share2
} from 'lucide-react';
import { 
  AIPromptItem, 
  AppView, 
  CharacterAgeBracket, 
  Language, 
  PromptCategory 
} from '../types';
import { 
  CATEGORIES_LIST, 
  AGE_BRACKETS, 
  getPromptLibrary, 
  adjustPromptForAge 
} from '../data/promptLibraryData';
import { storageService } from '../services/storageService';

interface PromptLibraryPageProps {
  language: Language;
  onNavigate: (view: AppView, prompt?: string) => void;
  onUsePrompt: (promptText: string, age?: CharacterAgeBracket, mode?: 'photo' | 'video') => void;
}

type MediaFilter = 'all' | 'photo' | 'video' | 'voice';
type SortFilter = 'popular' | 'new';

export const PromptLibraryPage: React.FC<PromptLibraryPageProps> = ({
  language,
  onNavigate,
  onUsePrompt
}) => {
  const isBn = language === 'bn';
  const allPrompts = useMemo(() => getPromptLibrary(), []);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PromptCategory | 'all'>('all');
  const [selectedAgeFilter, setSelectedAgeFilter] = useState<CharacterAgeBracket | 'all'>('all');
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>('all');
  const [sortFilter, setSortFilter] = useState<SortFilter>('popular');
  const [onlySaved, setOnlySaved] = useState(false);

  // Pagination
  const [visibleCount, setVisibleCount] = useState(24);

  // Local card state overrides (when user changes character age on a specific card)
  const [cardAgeOverrides, setCardAgeOverrides] = useState<Record<string, CharacterAgeBracket>>({});
  const [activeTabPerCard, setActiveTabPerCard] = useState<Record<string, 'image' | 'video' | 'voice'>>({});

  // Saved Prompts
  const [savedPromptIds, setSavedPromptIds] = useState<string[]>(() => storageService.getSavedPrompts());

  // Toast / Copy notification
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Toggle Bookmark
  const handleToggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isNowSaved = storageService.toggleSavePrompt(id);
    setSavedPromptIds(storageService.getSavedPrompts());
    showToast(
      isNowSaved
        ? (isBn ? 'প্রম্পট ফেভারিট তালিকায় সংরক্ষিত হয়েছে' : 'Prompt saved to favorites')
        : (isBn ? 'সংরক্ষিত তালিকা থেকে সরানো হয়েছে' : 'Removed from saved prompts')
    );
  };

  // Copy Prompt
  const handleCopy = (text: string, id: string, label: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast(isBn ? `${label} সফলভাবে কপি হয়েছে!` : `${label} copied to clipboard!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Change age for a specific card
  const handleCardAgeChange = (promptId: string, newAge: CharacterAgeBracket) => {
    setCardAgeOverrides(prev => ({ ...prev, [promptId]: newAge }));
  };

  // Set card active prompt sub-tab
  const handleCardTabChange = (promptId: string, tab: 'image' | 'video' | 'voice') => {
    setActiveTabPerCard(prev => ({ ...prev, [promptId]: tab }));
  };

  // Filter & Search Logic
  const filteredPrompts = useMemo(() => {
    return allPrompts.filter(item => {
      // Saved filter
      if (onlySaved && !savedPromptIds.includes(item.id)) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Age filter
      if (selectedAgeFilter !== 'all' && item.age !== selectedAgeFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(q) || item.titleBn.includes(q);
        const matchesCategory = item.categoryName.toLowerCase().includes(q) || item.categoryNameBn.includes(q);
        const matchesTags = item.tags.some(t => t.toLowerCase().includes(q));
        const matchesImagePrompt = item.imagePrompt.toLowerCase().includes(q);
        const matchesVideoPrompt = item.videoPrompt.toLowerCase().includes(q);
        const matchesVoicePrompt = item.voicePrompt.toLowerCase().includes(q);

        if (!matchesTitle && !matchesCategory && !matchesTags && !matchesImagePrompt && !matchesVideoPrompt && !matchesVoicePrompt) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortFilter === 'new') {
        return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      }
      return b.popularity - a.popularity;
    });
  }, [allPrompts, onlySaved, savedPromptIds, selectedCategory, selectedAgeFilter, searchQuery, sortFilter]);

  const displayedPrompts = useMemo(() => {
    return filteredPrompts.slice(0, visibleCount);
  }, [filteredPrompts, visibleCount]);

  const quickSearchTags = [
    { labelBn: 'গ্রাম', labelEn: 'Village', query: 'গ্রাম' },
    { labelBn: 'বাজার', labelEn: 'Bazaar', query: 'বাজার' },
    { labelBn: 'স্কুল', labelEn: 'School', query: 'স্কুল' },
    { labelBn: 'শিশু', labelEn: 'Child', query: 'শিশু' },
    { labelBn: 'কৃষক', labelEn: 'Farmer', query: 'কৃষক' },
    { labelBn: 'মজার গল্প', labelEn: 'Funny', query: 'মজার' },
    { labelBn: 'ঈদ উৎসব', labelEn: 'Eid', query: 'ঈদ' },
    { labelBn: 'নদী', labelEn: 'River', query: 'নদী' },
    { labelBn: 'বৃষ্টি', labelEn: 'Rain', query: 'বৃষ্টি' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-neutral-900 border border-emerald-500/50 text-white shadow-2xl animate-fade-in text-sm font-medium">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-900/90 to-emerald-950/40 border border-neutral-800 p-6 sm:p-10 shadow-xl">
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wide">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            <span>✨ 1000+ AI PROMPTS LIBRARY</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            {isBn ? '১০০০+ প্রস্তুত AI ফটো ও ভিডিও প্রম্পট লাইব্রেরি' : '1000+ Ready AI Photo & Video Prompt Library'}
          </h1>

          <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
            {isBn
              ? 'বাঙালি সংস্কৃতি, প্রকৃতি, গ্রাম ও শহরের জীবন, সিনেমাটিক গল্প এবং পারিবারিক আবহের জন্য বিশেষভাবে তৈরিকৃত উচ্চমানের প্রম্পট। এক ক্লিকে বয়স পরিবর্তন করে সহজেই Photo ও Video বানিয়ে নিন।'
              : 'Curated high-fidelity prompts optimized for Bangladeshi heritage, rural & urban life, cinematic narratives, and family-friendly stories. Adjust character age on the fly and generate in one click.'}
          </p>

          {/* Quick Stats Badges */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="px-3 py-1.5 rounded-xl bg-neutral-800/80 border border-neutral-700/80 text-neutral-200 text-xs font-semibold flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>{allPrompts.length}+ {isBn ? 'প্রস্তুত প্রম্পট' : 'Ready Prompts'}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-neutral-800/80 border border-neutral-700/80 text-neutral-200 text-xs font-semibold flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              <span>২৫টি {isBn ? 'ক্যাটাগরি' : 'Categories'}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-neutral-800/80 border border-neutral-700/80 text-neutral-200 text-xs font-semibold flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              <span>৬টি {isBn ? 'বয়স বিভাগ' : 'Age Brackets'}</span>
            </div>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-4 rounded-3xl bg-neutral-900/90 border border-neutral-800 p-5 sm:p-6 shadow-sm">
        
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
          <input
            id="prompt-library-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isBn
                ? 'প্রম্পট খুঁজুন... যেমন: "গ্রাম", "বাজার", "স্কুল", "শিশু", "কৃষক", "মজার গল্প"'
                : 'Search prompts... e.g. "village", "bazaar", "school", "farmer", "rain"'
            }
            className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-neutral-100 placeholder-neutral-500 transition outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Quick Search Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-neutral-400 font-semibold shrink-0">
            {isBn ? 'জনপ্রিয় সার্চ:' : 'Quick search:'}
          </span>
          {quickSearchTags.map((tag, idx) => (
            <button
              key={idx}
              onClick={() => setSearchQuery(tag.query)}
              className="px-3 py-1 rounded-full bg-neutral-800/80 hover:bg-neutral-750 text-neutral-300 hover:text-emerald-400 border border-neutral-700/60 transition whitespace-nowrap"
            >
              #{isBn ? tag.labelBn : tag.labelEn}
            </button>
          ))}
        </div>

        {/* Filters Grid */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-neutral-800/80">
          
          {/* Media Filter Tabs: All, Photo, Video, Voice */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-neutral-950 border border-neutral-800">
            <button
              onClick={() => setMediaFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                mediaFilter === 'all'
                  ? 'bg-emerald-500 text-neutral-950'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {isBn ? 'সবগুলো' : 'All'}
            </button>
            <button
              onClick={() => setMediaFilter('photo')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                mediaFilter === 'photo'
                  ? 'bg-emerald-500 text-neutral-950'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <ImageIcon className="h-3.5 w-3.5" />
              <span>Photo</span>
            </button>
            <button
              onClick={() => setMediaFilter('video')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                mediaFilter === 'video'
                  ? 'bg-emerald-500 text-neutral-950'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Video className="h-3.5 w-3.5" />
              <span>Video</span>
            </button>
            <button
              onClick={() => setMediaFilter('voice')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                mediaFilter === 'voice'
                  ? 'bg-emerald-500 text-neutral-950'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Volume2 className="h-3.5 w-3.5" />
              <span>Voice</span>
            </button>
          </div>

          {/* Sort & Bookmarks */}
          <div className="flex items-center gap-3">
            {/* Sort: Popular / New */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-neutral-950 border border-neutral-800 text-xs">
              <button
                onClick={() => setSortFilter('popular')}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg font-semibold transition ${
                  sortFilter === 'popular'
                    ? 'bg-neutral-800 text-amber-400'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Flame className="h-3 w-3" />
                <span>{isBn ? 'জনপ্রিয়' : 'Popular'}</span>
              </button>
              <button
                onClick={() => setSortFilter('new')}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg font-semibold transition ${
                  sortFilter === 'new'
                    ? 'bg-neutral-800 text-emerald-400'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Clock className="h-3 w-3" />
                <span>{isBn ? 'নতুন' : 'New'}</span>
              </button>
            </div>

            {/* Saved Bookmarks Toggle */}
            <button
              onClick={() => setOnlySaved(!onlySaved)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition ${
                onlySaved
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Bookmark className="h-3.5 w-3.5 text-amber-400" />
              <span>{isBn ? 'সংরক্ষিত প্রম্পট' : 'Saved'} ({savedPromptIds.length})</span>
            </button>
          </div>

        </div>

        {/* Category Pills Carousel */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs text-neutral-400 font-semibold">
            <span>{isBn ? 'ক্যাটাগরি সমূহ (২৫টি):' : 'Categories (25):'}</span>
            {selectedCategory !== 'all' && (
              <button
                onClick={() => setSelectedCategory('all')}
                className="text-emerald-400 hover:text-emerald-300"
              >
                {isBn ? 'সবগুলো দেখুন' : 'Show All'}
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-neutral-800">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold shrink-0 transition ${
                selectedCategory === 'all'
                  ? 'bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/20'
                  : 'bg-neutral-950 border border-neutral-800 text-neutral-300 hover:border-neutral-700'
              }`}
            >
              🌐 {isBn ? 'সব ক্যাটাগরি' : 'All Categories'}
            </button>
            {CATEGORIES_LIST.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold shrink-0 transition ${
                    isSelected
                      ? 'bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/20 font-bold'
                      : 'bg-neutral-950 border border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:text-white'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{isBn ? cat.nameBn : cat.nameEn}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Age Group Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-neutral-400 font-semibold shrink-0">
            {isBn ? 'চরিত্রের বয়স:' : 'Character Age:'}
          </span>
          <button
            onClick={() => setSelectedAgeFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition ${
              selectedAgeFilter === 'all'
                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/50'
                : 'bg-neutral-950 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
            }`}
          >
            {isBn ? 'সকল বয়স' : 'All Ages'}
          </button>
          {AGE_BRACKETS.map((age) => {
            const isSelected = selectedAgeFilter === age.id;
            return (
              <button
                key={age.id}
                onClick={() => setSelectedAgeFilter(age.id)}
                className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition ${
                  isSelected
                    ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/50'
                    : 'bg-neutral-950 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
                }`}
              >
                {isBn ? age.labelBn : age.labelEn}
              </button>
            );
          })}
        </div>

      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1">
        <p className="text-sm font-semibold text-neutral-400">
          {isBn
            ? `মোট ${filteredPrompts.length}টি প্রম্পট পাওয়া গেছে (প্রদর্শিত হচ্ছে ${displayedPrompts.length}টি)`
            : `Found ${filteredPrompts.length} prompts (showing ${displayedPrompts.length})`}
        </p>
        {filteredPrompts.length > 0 && (
          <button
            onClick={() => onNavigate('generator')}
            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
          >
            <span>{isBn ? 'নিজের প্রম্পট লিখতে Generator খুলুন' : 'Open Custom Generator'}</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Grid of Prompt Cards */}
      {displayedPrompts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedPrompts.map((basePrompt) => {
            // Apply card-specific age override if user toggled character age on this card
            const currentCardAge = cardAgeOverrides[basePrompt.id] || basePrompt.age;
            const prompt = currentCardAge !== basePrompt.age 
              ? adjustPromptForAge(basePrompt, currentCardAge) 
              : basePrompt;

            const isSaved = savedPromptIds.includes(prompt.id);
            const activeSubTab = activeTabPerCard[prompt.id] || (mediaFilter === 'video' ? 'video' : mediaFilter === 'voice' ? 'voice' : 'image');

            // Which prompt text to use/copy based on active sub tab
            const activePromptText = activeSubTab === 'image' 
              ? prompt.imagePrompt 
              : activeSubTab === 'video' 
                ? prompt.videoPrompt 
                : prompt.voicePrompt;

            return (
              <div
                key={prompt.id}
                className="group flex flex-col rounded-3xl bg-neutral-900 border border-neutral-800 hover:border-emerald-500/50 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Card Header & Thumbnail Banner */}
                <div className="relative h-44 w-full overflow-hidden bg-neutral-950">
                  <img
                    src={prompt.thumbnail}
                    alt={prompt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />

                  {/* Badges: Category & Popularity */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-xl bg-neutral-900/90 backdrop-blur-md border border-neutral-700/80 text-[11px] font-bold text-neutral-200">
                      {isBn ? prompt.categoryNameBn : prompt.categoryName}
                    </span>
                    {prompt.isNew && (
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-500 text-neutral-950 text-[10px] font-black uppercase">
                        NEW
                      </span>
                    )}
                  </div>

                  {/* Bookmark Button */}
                  <button
                    onClick={(e) => handleToggleBookmark(prompt.id, e)}
                    className="absolute top-3 right-3 h-8 w-8 rounded-xl bg-neutral-900/80 hover:bg-neutral-900 text-neutral-300 hover:text-amber-400 flex items-center justify-center backdrop-blur-md transition border border-neutral-700/60"
                    title={isSaved ? 'Remove from saved' : 'Save prompt'}
                  >
                    {isSaved ? (
                      <BookmarkCheck className="h-4 w-4 text-amber-400 fill-amber-400" />
                    ) : (
                      <Bookmark className="h-4 w-4" />
                    )}
                  </button>

                  {/* Title on Thumbnail */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-sm font-bold text-white line-clamp-1 group-hover:text-emerald-300 transition">
                      {isBn ? prompt.titleBn : prompt.title}
                    </h3>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col space-y-4">
                  
                  {/* Character Age Selector on Card (As requested: user can switch age on the fly) */}
                  <div className="flex items-center justify-between gap-2 p-2 rounded-2xl bg-neutral-950 border border-neutral-800">
                    <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                      <User className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="font-semibold">{isBn ? 'চরিত্রের বয়স:' : 'Age:'}</span>
                    </div>

                    <select
                      value={currentCardAge}
                      onChange={(e) => handleCardAgeChange(prompt.id, e.target.value as CharacterAgeBracket)}
                      className="bg-neutral-900 border border-neutral-750 text-xs font-bold text-neutral-200 rounded-xl px-2.5 py-1 focus:border-emerald-500 focus:outline-none transition cursor-pointer"
                    >
                      {AGE_BRACKETS.map((age) => (
                        <option key={age.id} value={age.id}>
                          {isBn ? age.labelBn : age.labelEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sub-tabs: Image Prompt, Video Prompt, Voice Prompt */}
                  <div className="flex items-center gap-1 p-1 rounded-xl bg-neutral-950 border border-neutral-800 text-[11px] font-bold">
                    <button
                      onClick={() => handleCardTabChange(prompt.id, 'image')}
                      className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg transition ${
                        activeSubTab === 'image'
                          ? 'bg-neutral-800 text-emerald-400 shadow-sm'
                          : 'text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      <ImageIcon className="h-3 w-3" />
                      <span>Photo</span>
                    </button>
                    <button
                      onClick={() => handleCardTabChange(prompt.id, 'video')}
                      className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg transition ${
                        activeSubTab === 'video'
                          ? 'bg-neutral-800 text-emerald-400 shadow-sm'
                          : 'text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      <Video className="h-3 w-3" />
                      <span>Video</span>
                    </button>
                    <button
                      onClick={() => handleCardTabChange(prompt.id, 'voice')}
                      className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg transition ${
                        activeSubTab === 'voice'
                          ? 'bg-neutral-800 text-emerald-400 shadow-sm'
                          : 'text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      <Volume2 className="h-3 w-3" />
                      <span>Voice</span>
                    </button>
                  </div>

                  {/* Prompt Text Box */}
                  <div className="relative rounded-2xl bg-neutral-950/80 border border-neutral-800/80 p-3.5 text-xs text-neutral-300 leading-relaxed min-h-[96px] flex flex-col justify-between group/box">
                    <p className="line-clamp-4 font-mono text-[11.5px] text-neutral-300">
                      {activePromptText}
                    </p>

                    <div className="flex items-center justify-between pt-2 mt-1 border-t border-neutral-900 text-[10px] text-neutral-500">
                      <span>
                        {activeSubTab === 'image' 
                          ? '📸 9:16 Cinematic Photo' 
                          : activeSubTab === 'video' 
                            ? '🎥 9:16 60fps Motion' 
                            : '🎙️ Bengali Audio Script'}
                      </span>
                      <button
                        onClick={(e) => handleCopy(activePromptText, `${prompt.id}_${activeSubTab}`, `${activeSubTab.toUpperCase()} Prompt`, e)}
                        className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                      >
                        {copiedId === `${prompt.id}_${activeSubTab}` ? (
                          <>
                            <Check className="h-3 w-3" />
                            <span>{isBn ? 'কপি হয়েছে' : 'Copied'}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>{isBn ? 'কপি করুন' : 'Copy'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {prompt.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-neutral-800/60 text-[10px] text-neutral-400"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Action Buttons: 
                      1. "Copy & Create" (কপি করে বানান)
                      2. "Copy" (কপি করুন)
                      3. "Create Photo"
                      4. "Create Video" */}
                  <div className="pt-2 border-t border-neutral-800 space-y-2 mt-auto">
                    
                    {/* Primary Row: Copy & Create + Quick Copy */}
                    <div className="grid grid-cols-12 gap-2">
                      {/* "কপি করে বানান" (Copy & Create) - primary call to action */}
                      <button
                        onClick={(e) => {
                          handleCopy(activePromptText, `${prompt.id}_copycreate`, 'Prompt', e);
                          setTimeout(() => {
                            onUsePrompt(activePromptText, currentCardAge, activeSubTab === 'video' ? 'video' : 'photo');
                          }, 300);
                        }}
                        className="col-span-8 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 text-xs font-black transition shadow-md shadow-emerald-500/20 active:scale-[0.98]"
                        title={isBn ? 'প্রম্পট কপি করুন এবং জেনারেটরে বানিয়ে নিন' : 'Copy prompt and open generator'}
                      >
                        <Sparkles className="h-3.5 w-3.5 fill-neutral-950" />
                        <span>{isBn ? 'কপি করে বানান' : 'Copy & Create'}</span>
                      </button>

                      {/* "Copy" Only button */}
                      <button
                        onClick={(e) => handleCopy(activePromptText, prompt.id, 'Prompt', e)}
                        className="col-span-4 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-200 text-xs font-semibold border border-neutral-700 transition active:scale-[0.98]"
                        title={isBn ? 'শুধু প্রম্পট কপি করুন' : 'Copy prompt to clipboard'}
                      >
                        {copiedId === prompt.id ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                            <span className="text-emerald-400 text-[11px] font-bold">{isBn ? 'কপি' : 'Done'}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5 text-neutral-300" />
                            <span className="text-[11px]">{isBn ? 'কপি' : 'Copy'}</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {/* "Create Photo" Button */}
                      <button
                        onClick={() => onUsePrompt(prompt.imagePrompt, currentCardAge, 'photo')}
                        className="flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-emerald-400 border border-neutral-800 hover:border-emerald-500/40 text-[11px] font-semibold transition"
                      >
                        <ImageIcon className="h-3 w-3" />
                        <span>{isBn ? 'ছবি বানান' : 'Create Photo'}</span>
                      </button>

                      {/* "Create Video" Button */}
                      <button
                        onClick={() => onUsePrompt(prompt.videoPrompt, currentCardAge, 'video')}
                        className="flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-amber-400 border border-neutral-800 hover:border-amber-500/40 text-[11px] font-semibold transition"
                      >
                        <Video className="h-3 w-3" />
                        <span>{isBn ? 'ভিডিও বানান' : 'Create Video'}</span>
                      </button>
                    </div>

                  </div>

                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center p-12 rounded-3xl bg-neutral-900/60 border border-dashed border-neutral-800 text-center space-y-4">
          <div className="h-16 w-16 rounded-2xl bg-neutral-800 flex items-center justify-center text-neutral-500">
            <Search className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-neutral-200">
              {isBn ? 'কোনো প্রম্পট খুঁজে পাওয়া যায়নি' : 'No Prompts Found'}
            </h3>
            <p className="text-xs text-neutral-400 max-w-sm">
              {isBn
                ? 'অন্য কোনো সার্চ শব্দ চেষ্টা করুন অথবা ফিল্টার পরিবর্তন করুন।'
                : 'Try different search keywords or reset active filters.'}
            </p>
          </div>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedAgeFilter('all');
              setOnlySaved(false);
            }}
            className="px-4 py-2 rounded-xl bg-emerald-500 text-neutral-950 font-bold text-xs"
          >
            {isBn ? 'সব ফিল্টার রিসেট করুন' : 'Reset All Filters'}
          </button>
        </div>
      )}

      {/* Load More Button */}
      {visibleCount < filteredPrompts.length && (
        <div className="flex justify-center pt-6">
          <button
            onClick={() => setVisibleCount(prev => prev + 24)}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-neutral-850 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 text-sm font-bold shadow-lg hover:border-emerald-500/50 transition"
          >
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <span>
              {isBn
                ? `আরও প্রম্পট দেখুন (বাকি ${filteredPrompts.length - visibleCount}টি)`
                : `Load More Prompts (${filteredPrompts.length - visibleCount} remaining)`}
            </span>
          </button>
        </div>
      )}

    </div>
  );
};
