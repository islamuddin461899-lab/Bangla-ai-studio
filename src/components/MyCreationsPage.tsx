import React, { useState } from 'react';
import { 
  Layers, 
  Image as ImageIcon, 
  Film, 
  Mic2, 
  Crop, 
  Download, 
  Share2, 
  Trash2, 
  Edit3, 
  Plus, 
  FolderPlus, 
  Folder, 
  Search,
  ExternalLink,
  Eye,
  Sparkles,
  Copy,
  Check,
  X
} from 'lucide-react';
import { AppView, CreationItem, CreationType, Language, ProjectFolder } from '../types';
import { translations } from '../i18n/translations';
import { storageService } from '../services/storageService';
import { downloadMediaToGallery } from '../utils/downloadUtils';

interface MyCreationsPageProps {
  creations: CreationItem[];
  onRefreshCreations: () => void;
  onNavigate: (view: AppView, prompt?: string, extraData?: any) => void;
  language: Language;
}

export const MyCreationsPage: React.FC<MyCreationsPageProps> = ({
  creations,
  onRefreshCreations,
  onNavigate,
  language
}) => {
  const t = translations[language];
  const isBn = language === 'bn';

  const [activeTab, setActiveTab] = useState<'all' | CreationType>('all');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [folders, setFolders] = useState<ProjectFolder[]>(() => storageService.getFolders());
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [viewingItem, setViewingItem] = useState<CreationItem | null>(null);

  // Tabs as specified in Section 10
  const tabs: Array<{ id: 'all' | CreationType; label: string; icon: any }> = [
    { id: 'all', label: t.creations?.tabs?.all || 'All', icon: Layers },
    { id: 'image', label: t.creations?.tabs?.images || (isBn ? 'ছবি (Photos)' : 'Images'), icon: ImageIcon },
    { id: 'video', label: t.creations?.tabs?.videos || (isBn ? 'ভিডিও (Videos)' : 'Videos'), icon: Film },
    { id: 'voice', label: t.creations?.tabs?.audio || (isBn ? 'অডিও' : 'Audio'), icon: Mic2 },
    { id: 'edited-photo', label: t.creations?.tabs?.editedPhotos || (isBn ? 'এডিট করা ছবি' : 'Edited Photos'), icon: Crop },
  ];

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    const newFolder: ProjectFolder = {
      id: 'fld_' + Date.now(),
      name: newFolderName.trim(),
      itemCount: 0,
      createdAt: Date.now()
    };
    const updated = [newFolder, ...folders];
    setFolders(updated);
    storageService.saveFolders(updated);
    setNewFolderName('');
    setIsCreatingFolder(false);
  };

  const handleDeleteCreation = (id: string) => {
    if (confirm(isBn ? 'আপনি কি নিশ্চিত যে এটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this creation?')) {
      storageService.deleteCreation(id);
      onRefreshCreations();
    }
  };

  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  const handleCopyCreationPrompt = (item: CreationItem) => {
    if (!item.prompt) return;
    navigator.clipboard.writeText(item.prompt);
    setCopiedPromptId(item.id);
    setTimeout(() => setCopiedPromptId(null), 2500);
  };

  const handleDownloadItem = async (item: CreationItem) => {
    const extension = item.type === 'video' ? 'mp4' : item.type === 'voice' ? 'mp3' : 'jpg';
    const filename = `${item.title.replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 24)}_${item.id}.${extension}`;
    await downloadMediaToGallery(item.fileUrl, filename);
  };

  const handleShare = (item: CreationItem) => {
    if (navigator.share) {
      navigator.share({
        title: item.title,
        url: item.fileUrl
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(item.fileUrl);
      alert(isBn ? 'লিংক কপি করা হয়েছে!' : 'Link copied!');
    }
  };

  // Filter items
  const filteredItems = creations.filter(item => {
    const matchesTab = activeTab === 'all' || item.type === activeTab;
    const matchesFolder = selectedFolder ? item.folderId === selectedFolder : true;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.prompt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesFolder && matchesSearch;
  });

  return (
    <div id="my-creations-container" className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-neutral-100">
                {t.creations.title}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400">
                {t.creations.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Buttons & Search */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isBn ? 'নাম বা প্রম্পট দিয়ে খুঁজুন...' : 'Search creations...'}
              className="w-full h-9 pl-9 pr-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <button
            onClick={() => onNavigate('prompt-library')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-bold text-amber-400 transition"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{isBn ? '১০০০+ প্রম্পট' : '1000+ Prompts'}</span>
          </button>
          
          <button
            onClick={() => onNavigate('generator')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold transition shadow-sm"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>{isBn ? 'নতুন তৈরি করুন' : 'Create New'}</span>
          </button>
        </div>
      </div>

      {/* 11. PROJECTS / FOLDERS SECTION */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
            <Folder className="h-4 w-4 text-emerald-400" />
            <span>{t.projects.title}</span>
          </h2>
          <button
            onClick={() => setIsCreatingFolder(true)}
            className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
          >
            <FolderPlus className="h-3.5 w-3.5" />
            <span>{t.projects.createFolder}</span>
          </button>
        </div>

        {/* Create Folder Input Dialog */}
        {isCreatingFolder && (
          <div className="flex items-center gap-2 p-2 rounded-xl bg-neutral-900 border border-neutral-800 max-w-md">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder={t.projects.folderNamePlaceholder}
              className="flex-1 bg-transparent px-3 py-1.5 text-xs text-neutral-200 focus:outline-none"
            />
            <button
              onClick={handleCreateFolder}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 text-neutral-950 font-bold text-xs"
            >
              {isBn ? 'সংরক্ষণ' : 'Save'}
            </button>
            <button
              onClick={() => setIsCreatingFolder(false)}
              className="px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-400 text-xs"
            >
              {t.cancel}
            </button>
          </div>
        )}

        {/* Folders List */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedFolder(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              selectedFolder === null
                ? 'bg-neutral-800 text-white border-neutral-700'
                : 'bg-neutral-950 text-neutral-400 border-neutral-850 hover:border-neutral-750'
            }`}
          >
            {isBn ? 'সকল ফোল্ডার' : 'All Folders'}
          </button>

          {folders.map(f => (
            <button
              key={f.id}
              onClick={() => setSelectedFolder(f.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                selectedFolder === f.id
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-neutral-950 text-neutral-400 border-neutral-850 hover:border-neutral-750'
              }`}
            >
              <Folder className="h-3.5 w-3.5 text-emerald-400" />
              <span>{f.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 10. TABS: All, Images, Videos, Audio, Edited Photos */}
      <div className="flex items-center gap-2 border-b border-neutral-850 pb-2 overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                isActive
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-400' : 'text-neutral-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* CREATIONS GRID */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 space-y-3 bg-neutral-900/40 rounded-2xl border border-dashed border-neutral-800">
          <Layers className="h-10 w-10 mx-auto text-neutral-600" />
          <p className="text-sm text-neutral-400 font-medium">
            {t.creations.empty}
          </p>
          <p className="text-xs text-neutral-500">
            {isBn ? 'যেকোনো টুল ব্যবহার করে ছবি, ভিডিও বা অডিও তৈরি করুন।' : 'Generate images, videos, or voice to populate your creations.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map(item => (
            <div
              key={item.id}
              className="group rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-md flex flex-col justify-between"
            >
              {/* Media Preview */}
              <div className="relative aspect-video bg-neutral-950 overflow-hidden flex items-center justify-center">
                {item.type === 'video' ? (
                  <video
                    src={item.fileUrl}
                    poster={item.thumbnailUrl}
                    controls
                    className="w-full h-full object-cover"
                  />
                ) : item.type === 'voice' ? (
                  <div className="p-6 text-center space-y-2">
                    <Mic2 className="h-10 w-10 mx-auto text-yellow-400" />
                    <audio src={item.fileUrl} controls className="w-full max-w-[200px] h-8" />
                  </div>
                ) : (
                  <img
                    src={item.fileUrl}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}

                <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] uppercase font-bold text-emerald-400">
                  {item.type}
                </span>
              </div>

              {/* Item Info as specified: Preview, Title, Date */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-100 truncate">
                    {item.title}
                  </h3>
                  <div className="flex items-center justify-between mt-1 text-[11px] text-neutral-500">
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    {item.metadata?.aspectRatio && (
                      <span className="font-mono">{item.metadata.aspectRatio}</span>
                    )}
                  </div>
                </div>

                {/* Actions as requested: [View], [Download], [Delete] */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-850">
                  <button
                    onClick={() => setViewingItem(item)}
                    title={isBn ? 'দেখুন (View)' : 'View'}
                    className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-200 text-xs font-semibold border border-neutral-700/60 transition"
                  >
                    <Eye className="h-3.5 w-3.5 text-emerald-400" />
                    <span>{isBn ? 'View' : 'View'}</span>
                  </button>

                  <button
                    onClick={() => handleDownloadItem(item)}
                    title={isBn ? 'ডাউনলোড (Download)' : 'Download'}
                    className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold transition shadow-sm"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>{isBn ? 'Download' : 'Download'}</span>
                  </button>

                  <button
                    onClick={() => handleDeleteCreation(item.id)}
                    title={isBn ? 'মুছে ফেলুন (Delete)' : 'Delete'}
                    className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-neutral-800 hover:bg-rose-950/60 text-neutral-400 hover:text-rose-400 text-xs font-semibold border border-neutral-700/60 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>{isBn ? 'Delete' : 'Delete'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW MODAL (For previewing full size photo/video) */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh] bg-neutral-950 rounded-3xl border border-neutral-800 p-6 flex flex-col items-center space-y-4 shadow-2xl overflow-y-auto">
            <div className="w-full flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white line-clamp-1">{viewingItem.title}</h3>
                <p className="text-xs text-neutral-400 mt-0.5">{viewingItem.prompt}</p>
              </div>
              <button
                onClick={() => setViewingItem(null)}
                className="p-2 rounded-xl bg-neutral-900 text-neutral-400 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="w-full flex items-center justify-center bg-black rounded-2xl overflow-hidden max-h-[60vh]">
              {viewingItem.type === 'video' ? (
                <video
                  src={viewingItem.fileUrl}
                  controls
                  autoPlay
                  className="max-h-[58vh] w-auto object-contain rounded-xl"
                />
              ) : viewingItem.type === 'voice' ? (
                <div className="p-12 text-center space-y-4">
                  <Mic2 className="h-16 w-16 mx-auto text-yellow-400" />
                  <audio src={viewingItem.fileUrl} controls autoPlay className="w-72" />
                </div>
              ) : (
                <img
                  src={viewingItem.fileUrl}
                  alt={viewingItem.title}
                  className="max-h-[58vh] w-auto object-contain rounded-xl"
                />
              )}
            </div>

            <div className="w-full flex flex-wrap items-center justify-between gap-3 pt-2">
              {viewingItem.prompt && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyCreationPrompt(viewingItem)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-800 text-neutral-200 text-xs font-semibold hover:bg-neutral-750 border border-neutral-700 transition"
                  >
                    {copiedPromptId === viewingItem.id ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-400">{isBn ? 'কপি হয়েছে' : 'Copied'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-neutral-400" />
                        <span>{isBn ? 'প্রম্পট কপি করুন' : 'Copy Prompt'}</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      const p = viewingItem.prompt;
                      setViewingItem(null);
                      onNavigate('ai-generator', p);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/30 transition"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{isBn ? 'কপি করে আবার বানান' : 'Remix / Create'}</span>
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => handleShare(viewingItem)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-800 text-neutral-200 text-xs font-semibold hover:bg-neutral-700"
                >
                  <Share2 className="h-4 w-4" />
                  <span>{t.share}</span>
                </button>

                <button
                  onClick={() => handleDownloadItem(viewingItem)}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-500 text-neutral-950 text-xs font-bold hover:bg-emerald-400 shadow-md"
                >
                  <Download className="h-4 w-4" />
                  <span>{isBn ? 'গ্যালারিতে সেভ করুন' : 'Save to Gallery'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
