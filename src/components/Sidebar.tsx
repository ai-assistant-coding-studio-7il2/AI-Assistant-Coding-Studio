import React from 'react';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  Layers, 
  Code2, 
  PenTool, 
  Search, 
  GraduationCap, 
  Compass, 
  Sparkles,
  X,
  Server,
  Cpu
} from 'lucide-react';
import { ChatSession, AssistantMode } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  onOpenArchitecture: () => void;
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
  onOpenArchitecture,
  onSelectMode,
  currentMode,
}) => {
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
        {/* Top Header */}
        <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
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
          <button
            id="sidebar-close-btn"
            onClick={onClose}
            className="p-2 ml-2 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 md:hidden rounded-lg hover:bg-stone-200 dark:hover:bg-stone-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Quick Select */}
        <div className="px-4 py-3 border-b border-stone-200/80 dark:border-stone-800/80">
          <p className="text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-2">
            অ্যাসিস্ট্যান্ট মোড (Modes)
          </p>
          <div className="space-y-1">
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
                  <div className="flex items-center gap-2 min-w-0 pr-6">
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-emerald-500' : 'text-stone-400'}`} />
                    <span className="truncate">{s.title || 'নতুন কথোপকথন'}</span>
                  </div>
                  <button
                    onClick={(e) => onDeleteSession(s.id, e)}
                    title="চ্যাট মুছে ফেলুন"
                    className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-rose-500 transition-opacity rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Architecture Blueprint Promo Banner */}
        <div className="p-3 border-t border-stone-200 dark:border-stone-800">
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
