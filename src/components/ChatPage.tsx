import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Square, 
  RotateCcw, 
  Copy, 
  Check, 
  Share2, 
  Trash2, 
  Bookmark, 
  Search, 
  Plus, 
  Sparkles, 
  Image as ImageIcon,
  Bot,
  User,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { AppView, ChatMessage, ChatSession, Language } from '../types';
import { translations } from '../i18n/translations';
import { aiService } from '../services/aiService';
import { storageService } from '../services/storageService';

interface ChatPageProps {
  initialPrompt?: string;
  onNavigate: (view: AppView, prompt?: string) => void;
  language: Language;
}

export const ChatPage: React.FC<ChatPageProps> = ({
  initialPrompt,
  onNavigate,
  language
}) => {
  const t = translations[language];
  const isBn = language === 'bn';

  // Chat sessions state
  const [sessions, setSessions] = useState<ChatSession[]>(() => storageService.getSessions());
  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    const s = storageService.getSessions();
    return s[0]?.id || 'default_session';
  });

  const [inputPrompt, setInputPrompt] = useState(initialPrompt || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const currentSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages, isGenerating]);

  // Handle initialPrompt if provided when navigating from HomePage
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSendMessage(initialPrompt);
    }
  }, []);

  // Save sessions to storage whenever updated
  const updateSessions = (updated: ChatSession[]) => {
    setSessions(updated);
    storageService.saveSessions(updated);
  };

  // Create New Chat
  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: 'session_' + Date.now(),
      userId: 'usr_default_01',
      title: isBn ? 'নতুন কথোপকথন' : 'New Conversation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [
        {
          id: 'msg_welcome_' + Date.now(),
          sender: 'assistant',
          text: isBn 
            ? 'নমস্কার! আমি বাংলা AI সহকারী। আপনার যেকোনো প্রশ্ন লিখুন বা ছবি ও ভিডিও তৈরির নির্দেশ দিন।'
            : 'Hello! I am your Bangla AI Assistant. Ask questions, explore ideas, or ask to create pictures & videos.',
          timestamp: Date.now()
        }
      ]
    };
    const updated = [newSession, ...sessions];
    updateSessions(updated);
    setActiveSessionId(newSession.id);
  };

  // Send message
  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || inputPrompt).trim();
    if (!prompt || isGenerating) return;

    setInputPrompt('');

    const userMessage: ChatMessage = {
      id: 'usr_msg_' + Date.now(),
      sender: 'user',
      text: prompt,
      timestamp: Date.now()
    };

    const currentMessages = currentSession ? [...currentSession.messages, userMessage] : [userMessage];
    
    // Update session immediately with user message
    const updatedSessions = sessions.map(s => {
      if (s.id === activeSessionId) {
        return {
          ...s,
          title: s.messages.length <= 1 ? prompt.slice(0, 30) : s.title,
          messages: currentMessages,
          updatedAt: Date.now()
        };
      }
      return s;
    });
    updateSessions(updatedSessions);

    setIsGenerating(true);

    try {
      // Build conversation history format for API
      const history = currentMessages.map(m => ({
        sender: m.sender,
        text: m.text
      }));

      const res = await aiService.sendChatMessage(prompt, history, language);

      const botMessage: ChatMessage = {
        id: 'bot_msg_' + Date.now(),
        sender: 'assistant',
        text: res.text,
        timestamp: Date.now(),
        suggestedAction: res.suggestedAction as any
      };

      const finalSessions = storageService.getSessions().map(s => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            messages: [...s.messages, botMessage],
            updatedAt: Date.now()
          };
        }
        return s;
      });
      updateSessions(finalSessions);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: 'err_msg_' + Date.now(),
        sender: 'assistant',
        text: t.errors.apiError,
        timestamp: Date.now()
      };
      const finalSessions = storageService.getSessions().map(s => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            messages: [...s.messages, errorMessage],
            updatedAt: Date.now()
          };
        }
        return s;
      });
      updateSessions(finalSessions);
    } finally {
      setIsGenerating(false);
    }
  };

  // Stop generation
  const handleStopGenerating = () => {
    setIsGenerating(false);
  };

  // Regenerate last response
  const handleRegenerate = () => {
    if (!currentSession || currentSession.messages.length < 2) return;
    const lastUserMessage = [...currentSession.messages].reverse().find(m => m.sender === 'user');
    if (lastUserMessage) {
      handleSendMessage(lastUserMessage.text);
    }
  };

  // Copy message
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  // Share message
  const handleShare = (text: string) => {
    if (navigator.share) {
      navigator.share({
        title: 'বাংলা AI Studio কথোপকথন',
        text: text
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      alert(isBn ? 'টেক্সট ক্লিপবোর্ডে কপি করা হয়েছে।' : 'Text copied to clipboard.');
    }
  };

  // Delete message
  const handleDeleteMessage = (msgId: string) => {
    if (!currentSession) return;
    const updatedMsgs = currentSession.messages.filter(m => m.id !== msgId);
    const updated = sessions.map(s => s.id === activeSessionId ? { ...s, messages: updatedMsgs } : s);
    updateSessions(updated);
  };

  // Toggle Save session
  const handleToggleSaveSession = (sessionId: string) => {
    const updated = sessions.map(s => {
      if (s.id === sessionId) {
        return { ...s, isSaved: !s.isSaved };
      }
      return s;
    });
    updateSessions(updated);
  };

  // Delete entire session
  const handleDeleteSession = (sessionId: string) => {
    const updated = sessions.filter(s => s.id !== sessionId);
    if (updated.length === 0) {
      handleNewChat();
    } else {
      updateSessions(updated);
      setActiveSessionId(updated[0].id);
    }
  };

  // Filter sessions
  const filteredSessions = sessions.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesSaved = showSavedOnly ? s.isSaved : true;
    return matchesSearch && matchesSaved;
  });

  return (
    <div id="chat-page-container" className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* 1. LEFT CHAT SIDEBAR */}
      <aside 
        id="chat-history-sidebar"
        className="hidden md:flex flex-col w-64 lg:w-72 border-r border-neutral-800/80 bg-neutral-950 p-3.5 space-y-3"
      >
        {/* New Chat Button */}
        <button
          id="chat-sidebar-new-btn"
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-200 hover:bg-neutral-850 hover:text-white text-xs font-semibold transition group shadow-sm"
        >
          <Plus className="h-4 w-4 text-emerald-400 group-hover:rotate-90 transition-transform" />
          <span>{t.newChat}</span>
        </button>

        {/* Search Chats Input */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500" />
          <input
            id="chat-search-input"
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder={t.searchChats}
            className="w-full h-8 pl-8 pr-3 rounded-lg bg-neutral-900 border border-neutral-850 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50 transition"
          />
        </div>

        {/* Filter Tabs (All / Saved) */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-neutral-900 border border-neutral-850 text-[11px]">
          <button
            onClick={() => setShowSavedOnly(false)}
            className={`flex-1 py-1 rounded-md text-center transition ${
              !showSavedOnly ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {t.chatHistory}
          </button>
          <button
            onClick={() => setShowSavedOnly(true)}
            className={`flex-1 py-1 rounded-md text-center transition ${
              showSavedOnly ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {t.savedChats}
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {filteredSessions.length === 0 ? (
            <div className="text-center py-8 text-xs text-neutral-500">
              {t.noChats}
            </div>
          ) : (
            filteredSessions.map((session) => {
              const isActive = session.id === activeSessionId;
              return (
                <div
                  key={session.id}
                  className={`group relative flex items-center justify-between p-2 rounded-lg text-xs transition cursor-pointer ${
                    isActive
                      ? 'bg-neutral-850 text-emerald-400 border border-neutral-800'
                      : 'text-neutral-400 hover:bg-neutral-900/60 hover:text-neutral-200'
                  }`}
                  onClick={() => setActiveSessionId(session.id)}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <MessageSquare className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-emerald-400' : 'text-neutral-500'}`} />
                    <span className="truncate font-medium">{session.title}</span>
                  </div>

                  {/* Actions for Session */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleSaveSession(session.id);
                      }}
                      title={session.isSaved ? 'Unsave' : 'Save'}
                      className={`p-1 rounded hover:bg-neutral-800 ${session.isSaved ? 'text-amber-400' : 'text-neutral-400'}`}
                    >
                      <Bookmark className="h-3 w-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSession(session.id);
                      }}
                      title="Delete"
                      className="p-1 rounded text-neutral-400 hover:text-rose-400 hover:bg-neutral-800"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* 2. MAIN CHAT AREA */}
      <main id="chat-main-area" className="flex-1 flex flex-col bg-neutral-950 relative overflow-hidden">
        {/* Chat Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-850 bg-neutral-950/60 backdrop-blur-xs">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-200 truncate max-w-[200px] sm:max-w-md">
                {currentSession?.title || t.chat.title}
              </h2>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Gemini 3.8 Flash Engine
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentSession && (
              <button
                onClick={() => handleToggleSaveSession(currentSession.id)}
                className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border border-neutral-800 bg-neutral-900 transition ${
                  currentSession.isSaved ? 'text-amber-400 border-amber-500/30' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Bookmark className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t.save}</span>
              </button>
            )}
            <button
              onClick={handleNewChat}
              className="md:hidden flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{t.newChat}</span>
            </button>
          </div>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-6 space-y-5">
          {currentSession?.messages.map((message) => {
            const isUser = message.sender === 'user';
            return (
              <div
                key={message.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar */}
                <div className={`flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-xl text-xs font-semibold shadow-sm ${
                  isUser 
                    ? 'bg-neutral-800 text-neutral-200 border border-neutral-700' 
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>

                {/* Bubble */}
                <div className="space-y-2 max-w-[85%] sm:max-w-xl">
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      isUser
                        ? 'bg-emerald-600 text-white rounded-tr-xs'
                        : 'bg-neutral-900 border border-neutral-800/90 text-neutral-100 rounded-tl-xs shadow-md'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.text}</p>

                    {/* INTELLIGENT ROUTER ACTION BUTTON */}
                    {message.suggestedAction && (
                      <div className="mt-3.5 pt-3 border-t border-neutral-800/80">
                        <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-neutral-950/80 border border-emerald-500/30">
                          <div className="flex items-center gap-2">
                            <ImageIcon className="h-4 w-4 text-emerald-400" />
                            <span className="text-xs font-semibold text-neutral-200">
                              {message.suggestedAction.label}
                            </span>
                          </div>
                          <button
                            onClick={() => onNavigate(message.suggestedAction!.view, message.suggestedAction!.prompt)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold transition shadow-sm"
                          >
                            <span>{t.chat.openGenerator}</span>
                            <ExternalLink className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Message Action Utilities */}
                  <div className={`flex items-center gap-2 text-[11px] text-neutral-500 px-1 ${
                    isUser ? 'justify-end' : 'justify-start'
                  }`}>
                    <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>

                    <button
                      onClick={() => handleCopy(message.id, message.text)}
                      title={t.copy}
                      className="hover:text-neutral-300 p-0.5"
                    >
                      {copiedMessageId === message.id ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>

                    <button
                      onClick={() => handleShare(message.text)}
                      title={t.share}
                      className="hover:text-neutral-300 p-0.5"
                    >
                      <Share2 className="h-3 w-3" />
                    </button>

                    <button
                      onClick={() => handleDeleteMessage(message.id)}
                      title={t.delete}
                      className="hover:text-rose-400 p-0.5"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isGenerating && (
            <div className="flex gap-3 max-w-3xl mr-auto">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl rounded-tl-xs px-4 py-3 bg-neutral-900 border border-neutral-800 text-neutral-400 text-xs flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span>{isBn ? 'AI বাংলায় উত্তর তৈরি করছে...' : 'AI is generating answer...'}</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input & Control Footer */}
        <div className="p-3 sm:p-4 border-t border-neutral-850 bg-neutral-950/80 backdrop-blur-md">
          <div className="max-w-3xl mx-auto space-y-2">
            {/* Top Bar for Regenerate / Stop */}
            <div className="flex items-center justify-between px-1">
              {isGenerating ? (
                <button
                  onClick={handleStopGenerating}
                  className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition"
                >
                  <Square className="h-3 w-3 fill-current" />
                  <span>{t.stopGenerating}</span>
                </button>
              ) : (
                <button
                  onClick={handleRegenerate}
                  className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-200 transition"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>{t.regenerate}</span>
                </button>
              )}
              <span className="text-[10px] text-neutral-500 hidden sm:inline">
                {isBn ? 'বাংলা বা ইংরেজিতে প্রম্পট লিখুন' : 'Ask in Bengali or English'}
              </span>
            </div>

            {/* Prompt Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="relative flex items-center rounded-2xl bg-neutral-900 border border-neutral-800 focus-within:border-emerald-500/50 p-1.5 transition"
            >
              <input
                id="chat-prompt-input"
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder={t.chat.inputPlaceholder}
                className="w-full bg-transparent px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none"
              />

              <button
                id="chat-send-btn"
                type="submit"
                disabled={!inputPrompt.trim() || isGenerating}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-neutral-950 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-400 active:scale-95 transition shadow-sm"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};
