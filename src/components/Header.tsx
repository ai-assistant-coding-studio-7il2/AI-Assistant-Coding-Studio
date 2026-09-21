import React from 'react';
import { 
  Menu, 
  Sparkles, 
  Layers, 
  Trash2, 
  Download, 
  Globe, 
  Plus, 
  Moon, 
  Sun,
  Code2,
  PenTool,
  Search,
  GraduationCap
} from 'lucide-react';
import { AssistantMode } from '../types';

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenArchitecture: () => void;
  onNewChat: () => void;
  onClearChat: () => void;
  onExportChat: () => void;
  mode: AssistantMode;
  enableSearch: boolean;
  hasMessages: boolean;
  darkMode: boolean;
  setDarkMode: (val: boolean | ((prev: boolean) => boolean)) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onOpenArchitecture,
  onNewChat,
  onClearChat,
  onExportChat,
  mode,
  enableSearch,
  hasMessages,
  darkMode,
  setDarkMode,
}) => {
  const getModeInfo = (m: AssistantMode) => {
    switch (m) {
      case 'coding':
        return { label: 'কোডিং মোড', icon: Code2, color: 'text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60' };
      case 'writing':
        return { label: 'লেখালেখি ও অনুবাদ', icon: PenTool, color: 'text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60' };
      case 'research':
        return { label: 'গবেষণা ও ফ্যাক্ট-চেক', icon: Search, color: 'text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/60' };
      case 'learning':
        return { label: 'পড়াশোনা ও কনসেপ্ট', icon: GraduationCap, color: 'text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/60' };
      default:
        return { label: 'সাধারণ অ্যাসিস্ট্যান্ট', icon: Sparkles, color: 'text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800' };
    }
  };

  const modeInfo = getModeInfo(mode);
  const ModeIcon = modeInfo.icon;

  return (
    <header
      id="app-header"
      className="h-14 border-b border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md px-4 flex items-center justify-between z-10 shrink-0"
    >
      <div className="flex items-center gap-2.5">
        <button
          id="toggle-sidebar-btn"
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          title="Sidebar খুলুন/বন্ধ করুন"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            AI
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold text-stone-900 dark:text-stone-100 leading-none">
              AI Assistant & Coding Studio
            </h1>
            <p className="text-[10px] text-stone-600 dark:text-stone-400 mt-0.5">
              বাংলা ও ইংরেজি স্মার্ট সহকারী (Gemini 3.8 Flash)
            </p>
          </div>
        </div>

        {/* Mode pill */}
        <div className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${modeInfo.color}`}>
          <ModeIcon className="w-3.5 h-3.5" />
          <span>{modeInfo.label}</span>
        </div>

        {/* Google Search status */}
        {enableSearch && (
          <div className="hidden lg:flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
            <Globe className="w-3 h-3 text-blue-500" />
            <span>Search Grounding Active</span>
          </div>
        )}
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-1.5">
        <button
          id="open-architecture-guide-btn"
          onClick={onOpenArchitecture}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 transition-colors shadow-xs"
          title="নিজস্ব AI অ্যাপ কীভাবে বানাবেন তার বিস্তারিত রোডম্যাপ"
        >
          <Layers className="w-3.5 h-3.5 text-amber-500" />
          <span className="hidden sm:inline">AI আর্কিটেকচার ম্যাপ</span>
        </button>

        <button
          id="header-new-chat-btn"
          onClick={onNewChat}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs"
          title="নতুন চ্যাট শুরু করুন"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden md:inline">নতুন চ্যাট</span>
        </button>

        {hasMessages && (
          <>
            <button
              id="export-chat-btn"
              onClick={onExportChat}
              className="p-2 rounded-lg text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              title="চ্যাট হিস্টোরি এক্সপোর্ট করুন"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              id="clear-chat-btn"
              onClick={onClearChat}
              className="p-2 rounded-lg text-stone-500 hover:text-rose-600 dark:text-stone-400 dark:hover:text-rose-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              title="চ্যাট হিস্টোরি মুছুন"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}

        <button
          id="toggle-dark-mode-btn"
          onClick={() => setDarkMode((d: boolean) => !d)}
          className="p-2 rounded-lg text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          title={darkMode ? 'লাইট মোড' : 'ডার্ক মোড'}
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
