import React, { useState, useEffect } from 'react';
import { AppView, CreationItem, Language, UserProfile, AppSettings } from './types';
import { storageService } from './services/storageService';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { CreateModal } from './components/CreateModal';
import { PricingModal } from './components/PricingModal';
import { HomePage } from './components/HomePage';
import { ChatPage } from './components/ChatPage';
import { TextToImagePage } from './components/TextToImagePage';
import { PhotoEditorPage } from './components/PhotoEditorPage';
import { ImageToImagePage } from './components/ImageToImagePage';
import { PhotoToVideoPage } from './components/PhotoToVideoPage';
import { TextToVideoPage } from './components/TextToVideoPage';
import { VideoEditorPage } from './components/VideoEditorPage';
import { AIVoicePage } from './components/AIVoicePage';
import { MyCreationsPage } from './components/MyCreationsPage';
import { ProfilePage } from './components/ProfilePage';
import { SettingsPage } from './components/SettingsPage';
import { PromptLibraryPage } from './components/PromptLibraryPage';
import { AIGeneratorPage } from './components/AIGeneratorPage';

export default function App() {
  // App navigation state
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [activePrompt, setActivePrompt] = useState<string | undefined>(undefined);
  const [extraData, setExtraData] = useState<any>(undefined);

  // App settings, language, user profile & creations
  const [settings, setSettings] = useState<AppSettings>(() => storageService.getSettings());
  const [language, setLanguage] = useState<Language>(() => storageService.getSettings().language || 'bn');
  const [user, setUser] = useState<UserProfile>(() => storageService.getUserProfile());
  const [creations, setCreations] = useState<CreationItem[]>(() => storageService.getCreations());

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sync settings when language changes
  const handleToggleLanguage = () => {
    const nextLang: Language = language === 'bn' ? 'en' : 'bn';
    setLanguage(nextLang);
    const updated = { ...settings, language: nextLang };
    setSettings(updated);
    storageService.saveSettings(updated);
  };

  const handleUpdateSettings = (updated: AppSettings) => {
    setSettings(updated);
    setLanguage(updated.language);
    storageService.saveSettings(updated);
  };

  const handleUpdateUser = (updated: UserProfile) => {
    setUser(updated);
    storageService.saveUserProfile(updated);
  };

  const handleRefreshCreations = () => {
    setCreations(storageService.getCreations());
  };

  // Centralized navigation handler supporting prompt passing
  const handleNavigate = (view: AppView, prompt?: string, extra?: any) => {
    setActivePrompt(prompt);
    setExtraData(extra);
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpgradeToPro = () => {
    const updated: UserProfile = {
      ...user,
      plan: 'Pro',
      remainingCredits: user.remainingCredits + 500
    };
    handleUpdateUser(updated);
    alert(language === 'bn' ? 'অভিনন্দন! আপনি সফলভাবে প্রো প্ল্যানে আপগ্রেড করেছেন।' : 'Congratulations! Upgraded to Pro successfully.');
  };

  // Apply dark / light mode class to document body
  useEffect(() => {
    if (settings.theme === 'light') {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('bg-neutral-950', 'text-neutral-100');
      document.body.classList.add('bg-neutral-50', 'text-neutral-900');
    } else {
      document.documentElement.classList.add('dark');
      document.body.classList.remove('bg-neutral-50', 'text-neutral-900');
      document.body.classList.add('bg-neutral-950', 'text-neutral-100');
    }
  }, [settings.theme]);

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      settings.theme === 'light' ? 'bg-neutral-50 text-neutral-900' : 'bg-neutral-950 text-neutral-100'
    }`}>
      {/* 1. TOP HEADER */}
      <Header
        currentView={currentView}
        onNavigate={(view) => handleNavigate(view)}
        language={language}
        onToggleLanguage={handleToggleLanguage}
        onNewChat={() => handleNavigate('chat')}
        onOpenCreate={() => setIsCreateModalOpen(true)}
        user={user}
        profile={user}
        theme={settings.theme}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* 2. BODY LAYOUT: DESKTOP SIDEBAR + MAIN CONTENT */}
      <div className="flex-1 flex overflow-hidden">
        {/* DESKTOP SIDEBAR */}
        <Sidebar
          currentView={currentView}
          onNavigate={(view) => handleNavigate(view)}
          onNewChat={() => handleNavigate('chat')}
          language={language}
          user={user}
          profile={user}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
          onOpenPricingModal={() => setIsPricingModalOpen(true)}
          userCredits={user.remainingCredits}
          userPlan={user.plan}
        />

        {/* MAIN ROUTED VIEW AREA */}
        <main className="flex-1 overflow-y-auto pb-24 md:pb-8">
          {currentView === 'home' && (
            <HomePage
              onNavigate={handleNavigate}
              language={language}
              creations={creations}
            />
          )}

          {currentView === 'chat' && (
            <ChatPage
              initialPrompt={activePrompt}
              onNavigate={handleNavigate}
              language={language}
            />
          )}

          {currentView === 'text-to-image' && (
            <TextToImagePage
              initialPrompt={activePrompt}
              onNavigate={handleNavigate}
              language={language}
            />
          )}

          {currentView === 'photo-editor' && (
            <PhotoEditorPage
              initialImage={extraData?.imageUrl}
              initialPrompt={activePrompt}
              language={language}
            />
          )}

          {currentView === 'image-to-image' && (
            <ImageToImagePage
              onNavigate={handleNavigate}
              language={language}
            />
          )}

          {currentView === 'photo-to-video' && (
            <PhotoToVideoPage
              initialPrompt={activePrompt}
              initialImage={extraData?.sourceImage}
              onNavigate={handleNavigate}
              language={language}
            />
          )}

          {currentView === 'text-to-video' && (
            <TextToVideoPage
              initialPrompt={activePrompt}
              onNavigate={handleNavigate}
              language={language}
            />
          )}

          {currentView === 'video-editor' && (
            <VideoEditorPage
              initialVideo={extraData?.videoUrl}
              initialPrompt={activePrompt}
              language={language}
            />
          )}

          {currentView === 'ai-voice' && (
            <AIVoicePage
              initialPrompt={activePrompt}
              language={language}
            />
          )}

          {(currentView === 'creations' || currentView === 'projects') && (
            <MyCreationsPage
              creations={creations}
              onRefreshCreations={handleRefreshCreations}
              onNavigate={handleNavigate}
              language={language}
            />
          )}

          {currentView === 'prompt-library' && (
            <PromptLibraryPage
              language={language}
              onNavigate={handleNavigate}
              onUsePrompt={(promptText, age, mode) => {
                handleNavigate('generator', promptText, { age, mode });
              }}
            />
          )}

          {currentView === 'generator' && (
            <AIGeneratorPage
              initialPrompt={activePrompt}
              initialAge={extraData?.age || 'young-adult'}
              initialMode={extraData?.mode || 'photo'}
              language={language}
              onNavigate={handleNavigate}
              onCreationAdded={(item) => {
                setCreations(prev => [item, ...prev]);
              }}
            />
          )}

          {currentView === 'profile' && (
            <ProfilePage
              user={user}
              onUpdateUser={handleUpdateUser}
              onOpenPricing={() => setIsPricingModalOpen(true)}
              language={language}
              onNavigate={handleNavigate}
            />
          )}

          {currentView === 'settings' && (
            <SettingsPage
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              language={language}
            />
          )}
        </main>
      </div>

      {/* 3. MOBILE BOTTOM NAVIGATION */}
      <BottomNav
        currentView={currentView}
        onNavigate={(view) => handleNavigate(view)}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        language={language}
      />

      {/* 4. MODALS */}
      <CreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSelectTool={(view) => handleNavigate(view)}
        language={language}
      />

      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        onUpgrade={handleUpgradeToPro}
        language={language}
      />
    </div>
  );
}
