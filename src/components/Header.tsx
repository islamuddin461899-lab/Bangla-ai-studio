import React from 'react';
import { 
  Sparkles, 
  MessageSquarePlus, 
  Search, 
  Globe, 
  Moon, 
  Sun, 
  User, 
  Settings, 
  Menu, 
  Plus 
} from 'lucide-react';
import { AppView, Language, ThemeMode, UserProfile } from '../types';
import { translations } from '../i18n/translations';

interface HeaderProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onOpenCreate?: () => void;
  onNewChat?: () => void;
  language: Language;
  onLanguageChange?: (lang: Language) => void;
  onToggleLanguage?: () => void;
  theme?: ThemeMode;
  onToggleTheme?: () => void;
  user?: UserProfile;
  profile?: UserProfile;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onOpenCreate,
  onNewChat,
  language,
  onLanguageChange,
  onToggleLanguage,
  theme = 'dark',
  onToggleTheme,
  user,
  profile,
  onToggleMobileMenu
}) => {
  const t = translations[language] || translations.bn;
  const activeUser = user || profile;
  const avatarUrl = activeUser?.avatar || activeUser?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';
  const userName = activeUser?.name || 'User';

  const handleLangToggle = () => {
    if (onToggleLanguage) {
      onToggleLanguage();
    } else if (onLanguageChange) {
      onLanguageChange(language === 'bn' ? 'en' : 'bn');
    }
  };

  return (
    <header 
      id="app-header" 
      className="sticky top-0 z-40 w-full border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md transition-colors duration-200"
    >
      <div className="flex h-16 items-center justify-between px-3 sm:px-6">
        {/* Left: Mobile Menu Toggle & Brand Logo */}
        <div className="flex items-center gap-3">
          {onToggleMobileMenu && (
            <button
              id="mobile-menu-button"
              onClick={onToggleMobileMenu}
              aria-label="Menu"
              className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-850 transition"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          <button
            id="logo-button"
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 text-neutral-950 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="h-5 w-5 fill-neutral-950" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-white text-base sm:text-lg leading-none">
                {t.appName}
              </span>
              <span className="text-[10px] text-emerald-400 font-medium tracking-wide">
                AI CREATIVE STUDIO
              </span>
            </div>
          </button>
        </div>

        {/* Center: Search & New Chat Shortcut on Desktop */}
        <div className="hidden lg:flex items-center gap-3 max-w-md w-full mx-6">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              id="header-search-input"
              type="text"
              placeholder={t.search}
              className="w-full h-9 pl-9 pr-4 rounded-full bg-neutral-900/80 border border-neutral-800 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition"
            />
          </div>
        </div>

        {/* Right: Actions, Language Switch, Theme, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* New Chat Button */}
          {onNewChat && (
            <button
              id="header-new-chat-button"
              onClick={onNewChat}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs sm:text-sm font-medium text-neutral-200 hover:bg-neutral-850 hover:text-white hover:border-neutral-700 transition"
            >
              <MessageSquarePlus className="h-4 w-4 text-emerald-400" />
              <span>{t.newChat}</span>
            </button>
          )}

          {/* Primary Create Button */}
          {onOpenCreate && (
            <button
              id="header-create-button"
              onClick={onOpenCreate}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 text-neutral-950 font-semibold text-xs sm:text-sm shadow-sm hover:bg-emerald-400 active:scale-95 transition"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>{t.create}</span>
            </button>
          )}

          {/* Language Selector */}
          <div className="relative flex items-center">
            <button
              id="header-language-toggle"
              onClick={handleLangToggle}
              title={language === 'bn' ? 'Switch to English' : 'বাংলায় পরিবর্তন করুন'}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-neutral-800 bg-neutral-900 text-neutral-300 hover:text-white hover:border-neutral-700 transition"
            >
              <Globe className="h-3.5 w-3.5 text-emerald-400" />
              <span>{language === 'bn' ? 'বাংলা' : 'EN'}</span>
            </button>
          </div>

          {/* Theme Toggle */}
          {onToggleTheme && (
            <button
              id="header-theme-toggle"
              onClick={onToggleTheme}
              aria-label="Toggle Theme"
              className="flex items-center justify-center h-8 w-8 rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-300 hover:text-white hover:border-neutral-700 transition"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-neutral-400" />
              )}
            </button>
          )}

          {/* Settings Icon */}
          <button
            id="header-settings-button"
            onClick={() => onNavigate('settings')}
            title={t.settings?.title || (language === 'bn' ? 'সেটিংস' : 'Settings')}
            className={`flex items-center justify-center h-8 w-8 rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-300 hover:text-white hover:border-neutral-700 transition ${
              currentView === 'settings' ? 'border-emerald-500/50 text-emerald-400' : ''
            }`}
          >
            <Settings className="h-4 w-4" />
          </button>

          {/* Profile Icon */}
          <button
            id="header-profile-button"
            onClick={() => onNavigate('profile')}
            title={t.profile?.title || (language === 'bn' ? 'প্রোফাইল' : 'Profile')}
            className={`relative flex items-center justify-center h-8 w-8 rounded-lg overflow-hidden border border-neutral-800 hover:border-emerald-500/60 transition ${
              currentView === 'profile' ? 'ring-2 ring-emerald-500' : ''
            }`}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={userName}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-neutral-800 text-neutral-300">
                <User className="h-4 w-4" />
              </div>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
