import React from 'react';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  Download,
  Layers, 
  Code2, 
  PenTool, 
  Search, 
  GraduationCap, 
  Compass, 
  Sparkles,
  X,
  Server,
  Cpu,
  Cloud,
  CloudCheck,
  LogIn,
  Share2,
  ShieldCheck,
  PhoneCall,
  Bot,
  HardDrive
} from 'lucide-react';
import { ChatSession, AssistantMode } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { AppLogo } from './AppLogo';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  onExportSession?: (session: ChatSession, e: React.MouseEvent) => void;
  onOpenArchitecture: () => void;
  onOpenHostingDiagnostic?: () => void;
  onOpenCitizenServices?: () => void;
  onOpenFreelanceAgent?: () => void;
  onOpenGoogleDrive?: () => void;
  onOpenShare?: (config?: { shareType?: 'app' | 'session' }) => void;
  onSelectMode: (mode: AssistantMode) => void;
  currentMode: AssistantMode;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onExportSession,
  onOpenArchitecture,
  onOpenHostingDiagnostic,
  onOpenCitizenServices,
  onOpenFreelanceAgent,
  onOpenGoogleDrive,
  onOpenShare,
  onSelectMode,
  currentMode,
}) => {
  const { user, signIn } = useAuth();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          id="sidebar-mobile-backdrop"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        id="app-sidebar"
        className={`fixed md:static inset-y-0 left-0 z-40 w-72 bg-stone-100 dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-72'
        } shrink-0`}
      >
        {/* Brand Banner */}
        <div className="px-4 pt-3.5 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AppLogo size={28} withGlow={true} />
            <div>
              <span className="text-xs font-extrabold text-stone-900 dark:text-stone-100 tracking-tight leading-none block">
                AI Studio
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                Gemini 3.8 Flash
              </span>
            </div>
          </div>
          <button
            id="sidebar-close-btn"
            onClick={onClose}
            className="p-1.5 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 md:hidden rounded-lg hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
            title="বন্ধ করুন"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Top Header */}
        <div className="p-3 pt-1 border-b border-stone-200 dark:border-stone-800 flex items-center gap-2">
          <button
            id="sidebar-new-chat-btn"
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 768) onClose();
            }}
            className="flex-1 flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন কথোপকথন (New Chat)</span>
          </button>
        </div>

        {/* Mode Quick Select */}
        <div className="px-4 py-3 border-b border-stone-200/80 dark:border-stone-800/80">
          <p className="text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-2">
            অ্যাসিস্ট্যান্ট মোড (Modes)
          </p>
          <div className="space-y-1">
            <button
              onClick={() => onSelectMode('citizen')}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                currentMode === 'citizen'
                  ? 'bg-teal-500/10 text-teal-700 dark:text-teal-300 font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-800/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>জনসেবা ও A-Z সমাধান</span>
            </button>
            <button
              onClick={() => onSelectMode('coding')}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                currentMode === 'coding'
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-800/60'
              }`}
            >
              <Code2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>কোডিং ও সফটওয়্যার</span>
            </button>
            <button
              onClick={() => onSelectMode('writing')}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                currentMode === 'writing'
                  ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-800/60'
              }`}
            >
              <PenTool className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>লেখালেখি ও যোগাযোগ</span>
            </button>
            <button
              onClick={() => onSelectMode('learning')}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                currentMode === 'learning'
                  ? 'bg-purple-500/10 text-purple-700 dark:text-purple-300 font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-800/60'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>পড়াশোনা ও কনসেপ্ট</span>
            </button>
            <button
              onClick={() => onSelectMode('research')}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                currentMode === 'research'
                  ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300 font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-800/60'
              }`}
            >
              <Search className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>গবেষণা ও ফ্যাক্ট-চেক</span>
            </button>
          </div>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 px-2 py-1">
            আগের চ্যাটসমূহ ({sessions.length})
          </p>

          {sessions.length === 0 ? (
            <div className="p-4 text-center text-xs text-stone-600 dark:text-stone-400">
              কোনো পূর্ববর্তী চ্যাট নেই। নতুন প্রশ্ন জিজ্ঞাসা করুন!
            </div>
          ) : (
            sessions.map((s) => {
              const isActive = s.id === activeSessionId;
              return (
                <div
                  key={s.id}
                  onClick={() => {
                    onSelectSession(s.id);
                    if (window.innerWidth < 768) onClose();
                  }}
                  className={`group relative flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-all ${
                    isActive
                      ? 'bg-white dark:bg-stone-800 font-semibold text-stone-900 dark:text-stone-100 shadow-xs border border-stone-200 dark:border-stone-700'
                      : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-emerald-500' : 'text-stone-400'}`} />
                    <span className="truncate">{s.title || 'নতুন কথোপকথন'}</span>
                    {s.isGeneratingTitle && (
                      <span title="এআই শিরোনাম তৈরি করছে..." className="shrink-0 inline-flex items-center">
                        <Sparkles className="w-3 h-3 text-emerald-500 animate-spin" />
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {s.messages.length > 0 && onExportSession && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onExportSession(s, e);
                        }}
                        title="চ্যাট এক্সপোর্ট করুন (PDF / JSON)"
                        className="p-1 text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-stone-200 dark:hover:bg-stone-700 rounded transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(s.id, e);
                      }}
                      title="চ্যাট মুছে ফেলুন"
                      className="p-1 text-stone-400 hover:text-rose-500 hover:bg-stone-200 dark:hover:bg-stone-700 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* PWA Install Button & Architecture Blueprint Promo */}
        <div className="p-3 border-t border-stone-200 dark:border-stone-800 space-y-2">
          <PWAInstallButton variant="sidebar" />

          <button
            onClick={() => {
              onOpenArchitecture();
              if (window.innerWidth < 768) onClose();
            }}
            className="w-full text-left p-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-emerald-500/10 border border-amber-500/20 hover:border-amber-500/40 transition-colors"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-stone-900 dark:text-stone-100">
              <Layers className="w-4 h-4 text-amber-500" />
              <span>AI আর্কিটেকচার ব্লুপ্রিন্ট</span>
            </div>
            <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
              Claude-এর মতো AI বানানোর বাস্তবসম্মত গাইডলাইন (পথ ১ বনাম পথ ২)
            </p>
          </button>

          {onOpenHostingDiagnostic && (
            <button
              id="sidebar-hosting-diagnostic-btn"
              onClick={() => {
                onOpenHostingDiagnostic();
                if (window.innerWidth < 768) onClose();
              }}
              className="w-full text-left p-2.5 mt-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/25 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-950 dark:text-emerald-200">
                  <Server className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>হোস্টিং ও এআই ডায়াগনস্টিক</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <p className="text-[10px] text-emerald-800/80 dark:text-emerald-300/80 mt-1">
                সার্ভার হেলথ চেক ও ক্লাউড সমাধান নির্দেশিকা
              </p>
            </button>
          )}
        </div>

        {/* Citizen Services Launcher */}
        {onOpenCitizenServices && (
          <div className="px-3 pt-2 pb-1">
            <button
              id="sidebar-citizen-services-btn"
              onClick={() => {
                onOpenCitizenServices();
                if (window.innerWidth < 768) onClose();
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-teal-50/90 hover:bg-teal-100 dark:bg-teal-950/40 dark:hover:bg-teal-950/70 border border-teal-200/80 dark:border-teal-800/60 text-left transition-all group cursor-pointer shadow-2xs"
              title="জরুরি মোবাইল নম্বর, ঠিকানা, পরিচয় যাচাই ও দরখাস্ত কেন্দ্র"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-teal-950 dark:text-teal-200 truncate">
                    জনসেবা ও A-Z টুলকিট
                  </p>
                  <p className="text-[10px] text-teal-700/90 dark:text-teal-400/90 truncate">
                    হটলাইন, ঠিকানা, এনআইডি ও দরখাস্ত
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-900/60 px-1.5 py-0.5 rounded-md">
                খুলুন
              </span>
            </button>
          </div>
        )}

        {/* Autonomous Remote Freelance AI Agent Launcher */}
        {onOpenFreelanceAgent && (
          <div className="px-3 pt-1 pb-1">
            <button
              id="sidebar-freelance-agent-btn"
              onClick={() => {
                onOpenFreelanceAgent();
                if (window.innerWidth < 768) onClose();
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent hover:from-emerald-500/25 border border-emerald-500/30 text-left transition-all group cursor-pointer shadow-2xs"
              title="২৪ ঘণ্টা স্বয়ংক্রিয় রিমোট জব ও ফ্রিল্যান্স এআই এজেন্ট"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                      রিমোট এআই জব এজেন্ট
                    </p>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  </div>
                  <p className="text-[10px] text-emerald-700 dark:text-emerald-400 truncate">
                    Upwork/Remote জব ও প্রপোজাল
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded-md">
                ২৪/৭
              </span>
            </button>
          </div>
        )}

        {/* Google Drive Workspace Launcher */}
        {onOpenGoogleDrive && (
          <div className="px-3 pt-1 pb-1">
            <button
              id="sidebar-google-drive-btn"
              onClick={() => {
                onOpenGoogleDrive();
                if (window.innerWidth < 768) onClose();
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-left transition-all group cursor-pointer shadow-2xs"
              title="Google Drive ফাইল ম্যানেজার ও ক্লাউড স্টোরেজ"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                  <HardDrive className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-amber-950 dark:text-amber-200 truncate">
                    Google Drive
                  </p>
                  <p className="text-[10px] text-amber-700/90 dark:text-amber-400/90 truncate">
                    ক্লাউড ফাইল ব্রাউজ ও ব্যাকআপ
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 px-1.5 py-0.5 rounded-md">
                ড্রাইভ
              </span>
            </button>
          </div>
        )}

        {/* Share on Social Media Platforms */}
        <div className="px-3 pt-1 pb-2">
          <button
            id="sidebar-share-app-btn"
            onClick={() => onOpenShare && onOpenShare({ shareType: 'app' })}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/80 hover:bg-emerald-100/90 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/70 border border-emerald-200/80 dark:border-emerald-800/60 text-left transition-all group cursor-pointer shadow-2xs"
            title="সোশ্যাল মিডিয়া ও বন্ধুদের সাথে অ্যাপটি শেয়ার করুন"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                <Share2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-emerald-950 dark:text-emerald-200 truncate">
                  মিডিয়া প্ল্যাটফর্মে শেয়ার
                </p>
                <p className="text-[10px] text-emerald-700/90 dark:text-emerald-400/90 truncate">
                  WhatsApp, FB, X, লিঙ্ক ও QR
                </p>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.5 rounded-md">
              শেয়ার
            </span>
          </button>
        </div>

        {/* Firebase Cloud Sync Card */}
        <div className="p-3 border-t border-stone-200 dark:border-stone-800">
          {user ? (
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60">
              <div className="flex items-center gap-2">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-7 h-7 rounded-full object-cover border border-emerald-500 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 truncate">
                      ফায়ারস্টোর সিঙ্কড
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <button
              id="sidebar-cloud-login-btn"
              onClick={() => signIn()}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200/80 dark:bg-stone-800 dark:hover:bg-stone-750 border border-stone-200 dark:border-stone-700 text-left transition-colors group"
            >
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <p className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                    ক্লাউড ব্যাকআপ
                  </p>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400">
                    Firestore-এ ডাটা সেভ রাখুন
                  </p>
                </div>
              </div>
              <LogIn className="w-3.5 h-3.5 text-stone-400 group-hover:text-emerald-600 transition-colors" />
            </button>
          )}
        </div>

        {/* Footer specs */}
        <div className="px-4 py-3 bg-stone-200/50 dark:bg-stone-950/60 border-t border-stone-200 dark:border-stone-800 text-[10px] text-stone-600 dark:text-stone-400 space-y-1">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 font-mono">
              <Cpu className="w-3 h-3 text-emerald-500" />
              Model:
            </span>
            <span className="font-semibold text-stone-700 dark:text-stone-300">Gemini 3.8 Flash</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 font-mono">
              <Server className="w-3 h-3 text-blue-500" />
              Search:
            </span>
            <span className="text-emerald-700 dark:text-emerald-400 font-medium">Google Search Grounding</span>
          </div>
        </div>
      </aside>
    </>
  );
};
