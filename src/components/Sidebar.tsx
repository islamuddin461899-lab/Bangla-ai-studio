import React from 'react';
import { 
  Home, 
  MessageSquare, 
  Image as ImageIcon, 
  Crop, 
  ImagePlus, 
  Clapperboard, 
  Video, 
  Film, 
  Mic2, 
  FolderKanban, 
  Sparkles,
  Layers,
  Settings,
  Plus,
  Coins,
  Crown,
  User,
  BookOpen,
  Wand2
} from 'lucide-react';
import { AppView, Language, UserProfile } from '../types';
import { translations } from '../i18n/translations';

interface SidebarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onNewChat?: () => void;
  language: Language;
  user?: UserProfile;
  profile?: UserProfile;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  onOpenCreateModal?: () => void;
  onOpenPricingModal?: () => void;
  userCredits?: number;
  userPlan?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  onNewChat,
  language,
  user,
  profile,
  isOpenMobile = false,
  onCloseMobile = () => {},
  onOpenCreateModal,
  onOpenPricingModal,
  userCredits,
  userPlan
}) => {
  const t = translations[language] || translations.bn;
  const activeUser = user || profile;
  const avatarUrl = activeUser?.avatar || activeUser?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';
  const userName = activeUser?.name || 'User';
  const userEmail = activeUser?.email || '';
  const credits = userCredits !== undefined ? userCredits : (activeUser?.remainingCredits ?? 150);
  const plan = userPlan || activeUser?.plan || 'Pro';

  const mainNav = [
    { id: 'home', label: language === 'bn' ? 'হোম পেজ' : 'Home', icon: Home, view: 'home' as AppView },
    { id: 'prompt-library', label: language === 'bn' ? 'Prompt Library' : 'Prompt Library', icon: BookOpen, view: 'prompt-library' as AppView, badge: '1000+' },
    { id: 'generator', label: language === 'bn' ? 'Create (জেনারেটর)' : 'Create', icon: Wand2, view: 'generator' as AppView, badge: 'New' },
    { id: 'creations', label: language === 'bn' ? 'My Creations' : 'My Creations', icon: Layers, view: 'creations' as AppView },
    { id: 'chat', label: language === 'bn' ? 'AI চ্যাট' : 'AI Chat', icon: MessageSquare, view: 'chat' as AppView },
  ];

  const creationTools = [
    { id: 'text-to-image', label: t.quickActions.textToImage, icon: ImageIcon, view: 'text-to-image' as AppView },
    { id: 'photo-editor', label: t.quickActions.photoEdit, icon: Crop, view: 'photo-editor' as AppView },
    { id: 'image-to-image', label: t.quickActions.imageToImage, icon: ImagePlus, view: 'image-to-image' as AppView },
    { id: 'photo-to-video', label: t.quickActions.photoToVideo, icon: Clapperboard, view: 'photo-to-video' as AppView },
    { id: 'text-to-video', label: t.quickActions.textToVideo, icon: Video, view: 'text-to-video' as AppView },
    { id: 'video-editor', label: t.quickActions.videoEdit, icon: Film, view: 'video-editor' as AppView },
    { id: 'ai-voice', label: t.quickActions.aiVoice, icon: Mic2, view: 'ai-voice' as AppView },
  ];

  const workspaceNav = [
    { id: 'creations', label: t.myCreations, icon: Layers, view: 'creations' as AppView },
    { id: 'projects', label: t.projects?.title || (language === 'bn' ? 'প্রজেক্ট সমূহ' : 'Projects'), icon: FolderKanban, view: 'projects' as AppView },
  ];

  const handleSelect = (view: AppView) => {
    onNavigate(view);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        id="app-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 md:w-60 lg:w-64 border-r border-neutral-800/80 bg-neutral-950 flex flex-col justify-between transition-transform duration-300 md:static md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top: Logo & New Chat button */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between md:hidden pb-2 border-b border-neutral-800">
            <span className="font-bold text-neutral-100 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              {t.appName}
            </span>
            <button 
              onClick={onCloseMobile}
              className="text-neutral-400 hover:text-white text-xs px-2 py-1 rounded bg-neutral-900 border border-neutral-800"
            >
              ✕
            </button>
          </div>

          {onNewChat && (
            <button
              id="sidebar-new-chat-btn"
              onClick={() => {
                onNewChat();
                onCloseMobile();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/50 text-sm font-medium transition group"
            >
              <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-200" />
              <span>{t.newChat}</span>
            </button>
          )}

          {onOpenCreateModal && (
            <button
              id="sidebar-quick-create-btn"
              onClick={onOpenCreateModal}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold shadow-sm transition"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>{t.create}</span>
            </button>
          )}
        </div>

        {/* Scrollable Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 space-y-5">
          {/* Main Nav */}
          <div className="space-y-1">
            {mainNav.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.view;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => handleSelect(item.view)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'bg-neutral-850 text-emerald-400 border border-neutral-800'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-400' : 'text-neutral-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Creation Tools Section */}
          <div className="space-y-1">
            <span className="px-3 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
              {t.sidebar?.creationTools || (language === 'bn' ? 'ক্রিয়েশন টুলস' : 'Creation Tools')}
            </span>
            <div className="pt-1 space-y-0.5">
              {creationTools.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.view;
                return (
                  <button
                    key={item.id}
                    id={`nav-item-${item.id}`}
                    onClick={() => handleSelect(item.view)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                      isActive
                        ? 'bg-neutral-850 text-emerald-400 border border-neutral-800'
                        : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-400' : 'text-neutral-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Workspace & Management */}
          <div className="space-y-1">
            <span className="px-3 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
              {t.sidebar?.workspace || (language === 'bn' ? 'ওয়ার্কস্পেস' : 'Workspace')}
            </span>
            <div className="pt-1 space-y-0.5">
              {workspaceNav.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.view;
                return (
                  <button
                    key={item.id}
                    id={`nav-item-${item.id}`}
                    onClick={() => handleSelect(item.view)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? 'bg-neutral-850 text-emerald-400 border border-neutral-800'
                        : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-400' : 'text-neutral-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Credit & Plan Widget */}
          <div className="p-3 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400 flex items-center gap-1.5">
                <Coins className="h-3.5 w-3.5 text-amber-400" />
                <span>{language === 'bn' ? 'ক্রেডিট' : 'Credits'}</span>
              </span>
              <span className="font-bold text-neutral-200">{credits}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-neutral-500">
              <span>{plan} {language === 'bn' ? 'প্ল্যান' : 'Plan'}</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <Crown className="h-3 w-3 text-amber-400" />
                <span>{language === 'bn' ? 'সক্রিয়' : 'Active'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Bottom User & Settings Bar */}
        <div className="p-3 border-t border-neutral-850 space-y-1">
          <button
            id="sidebar-settings-link"
            onClick={() => handleSelect('settings')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
              currentView === 'settings'
                ? 'bg-neutral-850 text-emerald-400'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>{t.settings?.title || (language === 'bn' ? 'সেটিংস' : 'Settings')}</span>
          </button>

          <button
            id="sidebar-profile-card"
            onClick={() => handleSelect('profile')}
            className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-xl transition ${
              currentView === 'profile' ? 'bg-neutral-850 border border-neutral-800' : 'hover:bg-neutral-900'
            }`}
          >
            <div className="h-8 w-8 rounded-full overflow-hidden border border-neutral-700 shrink-0 flex items-center justify-center bg-neutral-800">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={userName}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-4 w-4 text-neutral-400" />
              )}
            </div>
            <div className="flex flex-col text-left min-w-0">
              <span className="text-xs font-semibold text-neutral-200 truncate">
                {userName}
              </span>
              {userEmail && (
                <span className="text-[10px] text-neutral-500 truncate">
                  {userEmail}
                </span>
              )}
            </div>
          </button>
        </div>
      </aside>
    </>
  );
};
