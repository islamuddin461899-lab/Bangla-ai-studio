import React from 'react';
import { Home, BookOpen, Plus, FolderKanban, User, Sparkles } from 'lucide-react';
import { AppView, Language } from '../types';

interface BottomNavProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onOpenCreate?: () => void;
  onOpenCreateModal?: () => void;
  language: Language;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentView,
  onNavigate,
  onOpenCreate,
  onOpenCreateModal,
  language
}) => {
  const isBn = language === 'bn';
  const handleCreateClick = onOpenCreateModal || onOpenCreate || (() => {});

  return (
    <nav 
      id="mobile-bottom-nav" 
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/95 border-t border-neutral-850 backdrop-blur-md px-3 py-1.5 safe-area-pb"
    >
      <div className="flex items-center justify-around">
        {/* 1. Home */}
        <button
          id="bottom-nav-home"
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition ${
            currentView === 'home' ? 'text-emerald-400' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Home className="h-5 w-5" />
          <span className="text-[10px] mt-0.5 font-medium">
            {isBn ? 'হোম' : 'Home'}
          </span>
        </button>

        {/* 2. Prompt Library */}
        <button
          id="bottom-nav-prompts"
          onClick={() => onNavigate('prompt-library')}
          className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-lg transition ${
            currentView === 'prompt-library' ? 'text-emerald-400' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <div className="relative">
            <BookOpen className="h-5 w-5" />
            <span className="absolute -top-1 -right-2 h-2 w-2 rounded-full bg-amber-400 animate-ping" />
            <span className="absolute -top-1 -right-2 h-2 w-2 rounded-full bg-amber-400" />
          </div>
          <span className="text-[10px] mt-0.5 font-medium">
            {isBn ? 'প্রম্পট' : 'Prompts'}
          </span>
        </button>

        {/* 3. Create (Prominent center button) */}
        <button
          id="bottom-nav-create"
          onClick={() => onNavigate('generator')}
          className="flex flex-col items-center justify-center -mt-4"
        >
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-emerald-500 text-neutral-950 shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 active:scale-95 transition">
            <Plus className="h-6 w-6 stroke-[3]" />
          </div>
          <span className="text-[10px] mt-1 font-semibold text-emerald-400">
            {isBn ? 'তৈরি' : 'Create'}
          </span>
        </button>

        {/* 4. Creations */}
        <button
          id="bottom-nav-projects"
          onClick={() => onNavigate('creations')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition ${
            currentView === 'creations' || currentView === 'projects' ? 'text-emerald-400' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <FolderKanban className="h-5 w-5" />
          <span className="text-[10px] mt-0.5 font-medium">
            {isBn ? 'ক্রিয়েশন' : 'Creations'}
          </span>
        </button>

        {/* 5. Profile */}
        <button
          id="bottom-nav-profile"
          onClick={() => onNavigate('profile')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition ${
            currentView === 'profile' ? 'text-emerald-400' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <User className="h-5 w-5" />
          <span className="text-[10px] mt-0.5 font-medium">
            {isBn ? 'প্রোফাইল' : 'Profile'}
          </span>
        </button>
      </div>
    </nav>
  );
};
