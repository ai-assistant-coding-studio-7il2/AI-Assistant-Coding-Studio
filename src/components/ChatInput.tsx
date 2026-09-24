import React, { useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Send, 
  Square, 
  Globe, 
  Code2, 
  PenTool, 
  GraduationCap, 
  Search, 
  Sparkles,
  Paperclip,
  X,
  Mic,
  MicOff,
  Languages,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import { AssistantMode } from '../types';
import { useVoiceInput, VoiceLanguage } from '../hooks/useVoiceInput';

interface ChatInputProps {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  onSend: (textOverride?: string) => void;
  onStop: () => void;
  isGenerating: boolean;
  enableSearch: boolean;
  setEnableSearch: (enabled: boolean | ((prev: boolean) => boolean)) => void;
  mode: AssistantMode;
  setMode: (mode: AssistantMode) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  onSend,
  onStop,
  isGenerating,
  enableSearch,
  setEnableSearch,
  mode,
  setMode,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    isListening,
    language,
    setLanguage,
    toggleListening,
    stopListening,
    errorMessage,
    setErrorMessage,
    audioLevel,
  } = useVoiceInput({
    defaultLang: 'bn-BD',
    onTranscriptUpdate: (transcript) => {
      setInput(transcript);
    },
    onSendVoiceCommand: (finalText) => {
      setInput(finalText);
      setTimeout(() => {
        onSend(finalText);
      }, 100);
    },
    onClearVoiceCommand: () => {
      setInput('');
    },
  });

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 180);
      textareaRef.current.style.height = `${Math.max(newHeight, 48)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isGenerating && input.trim()) {
        if (isListening) stopListening();
        onSend();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setInput(
          prev =>
            `${prev ? prev + '\n\n' : ''}[ফাইল: ${file.name}]\n\`\`\`\n${text.slice(0, 10000)}\n\`\`\`\nএই ফাইলের কোড/তথ্য বিশ্লেষণ করো:`
        );
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleVoiceToggle = () => {
    setErrorMessage(null);
    toggleListening();
  };

  const modeButtons: Array<{ id: AssistantMode; label: string; icon: any }> = [
    { id: 'general', label: 'সাধারণ', icon: Sparkles },
    { id: 'citizen', label: 'জনসেবা ও A-Z সমাধান', icon: ShieldCheck },
    { id: 'coding', label: 'কোডিং ও ডেভেলপমেন্ট', icon: Code2 },
    { id: 'writing', label: 'লেখালেখি ও অনুবাদ', icon: PenTool },
    { id: 'research', label: 'গবেষণা ও ফ্যাক্ট-চেক', icon: Search },
    { id: 'learning', label: 'পড়াশোনা ও কনসেপ্ট', icon: GraduationCap },
  ];

  return (
    <div className="border-t border-stone-200 dark:border-stone-800 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md px-4 py-3 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-2.5">
        {/* Error notification if microphone is blocked */}
        {errorMessage && (
          <div
            id="voice-mic-error-banner"
            className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between gap-3 shadow-xs"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="p-1 hover:bg-amber-200/50 dark:hover:bg-amber-900/60 rounded text-amber-700 dark:text-amber-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Live Voice Recording Status Bar */}
        {isListening && (
          <div
            id="voice-recording-active-banner"
            className="p-2.5 px-3.5 rounded-xl bg-gradient-to-r from-rose-500/10 via-emerald-500/10 to-blue-500/10 border border-rose-500/30 dark:border-rose-500/40 flex flex-wrap items-center justify-between gap-2 text-xs transition-all shadow-xs"
          >
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </span>

              <div className="flex items-center gap-1.5 font-semibold text-rose-700 dark:text-rose-300">
                <span>মাইক্রোফোন সক্রিয়... কথা বলুন</span>
              </div>

              {/* Dynamic Sound Wave visualizer */}
              <div className="flex items-center gap-0.5 h-4 ml-1">
                {[0.4, 0.8, 1, 0.7, 0.5, 0.9, 0.6].map((factor, i) => (
                  <span
                    key={i}
                    className="w-1 bg-rose-500 rounded-full transition-all duration-75"
                    style={{
                      height: `${Math.max(4, Math.min(18, (audioLevel || 15) * factor))}px`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Voice Command Tips & Language switch */}
            <div className="flex items-center gap-2 text-[11px]">
              <span className="hidden sm:inline text-stone-600 dark:text-stone-300 bg-white/70 dark:bg-stone-800/70 px-2 py-0.5 rounded-md border border-stone-200 dark:border-stone-700">
                🗣️ ভয়েস কমান্ড: শেষে <strong>"পাঠাও"</strong> বললে অটোমেটিক যাবে
              </span>

              {/* Language toggle: Bangla / English */}
              <button
                id="voice-language-switch-btn"
                onClick={() => setLanguage((l: VoiceLanguage) => (l === 'bn-BD' ? 'en-US' : 'bn-BD'))}
                title="ভয়েস ইনপুট ভাষা পরিবর্তন করুন"
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700 hover:border-emerald-500 transition-colors"
              >
                <Languages className="w-3 h-3 text-emerald-600" />
                <span>{language === 'bn-BD' ? 'বাংলা (bn-BD)' : 'English (en-US)'}</span>
              </button>

              <button
                onClick={stopListening}
                className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium shadow-xs transition-colors"
              >
                থামুন
              </button>
            </div>
          </div>
        )}

        {/* Mode & Tool Toggles */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          <div className="flex items-center gap-1.5 shrink-0">
            {modeButtons.map((btn) => {
              const Icon = btn.icon;
              const isActive = mode === btn.id;
              return (
                <button
                  key={btn.id}
                  id={`mode-btn-${btn.id}`}
                  onClick={() => setMode(btn.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-xs'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{btn.label}</span>
                </button>
              );
            })}
          </div>

          {/* Google Search Grounding toggle */}
          <button
            id="toggle-search-grounding-btn"
            onClick={() => setEnableSearch((prev: boolean) => !prev)}
            title="Google Search ডেটা দিয়ে রিয়েল-টাইম তথ্য পাওয়ার জন্য সক্রিয় করুন"
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium shrink-0 border transition-all ${
              enableSearch
                ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300 shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400'
            }`}
          >
            <Globe className={`w-3.5 h-3.5 ${enableSearch ? 'text-blue-600 dark:text-blue-400' : 'text-stone-400'}`} />
            <span>Google Search: {enableSearch ? 'সক্রিয় (ON)' : 'বন্ধ (OFF)'}</span>
          </button>
        </div>

        {/* Input Text Box */}
        <div className={`relative rounded-2xl border bg-white dark:bg-stone-950 shadow-xs transition-all ${
          isListening 
            ? 'border-rose-400 dark:border-rose-500 ring-2 ring-rose-500/20'
            : 'border-stone-300 dark:border-stone-700 focus-within:border-emerald-500 dark:focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-500/20'
        }`}>
          <textarea
            id="chat-textarea-input"
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isListening
                ? 'কথা বলুন... আপনার কণ্ঠস্বর টেক্সট আকারে এখানে লেখা হচ্ছে...'
                : 'গান বা ইউটিউব ভিডিও লিঙ্ক, ওয়েবসাইট সন্ধান, কোডিং বা যেকোনো প্রশ্ন লিখুন...'
            }
            className="w-full resize-none bg-transparent px-4 pt-3.5 pb-11 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none leading-relaxed"
          />

          {/* Bottom Bar inside Input */}
          <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.js,.ts,.tsx,.jsx,.py,.html,.css,.json,.md"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                id="attach-file-btn"
                onClick={() => fileInputRef.current?.click()}
                title="টেক্সট বা কোড ফাইল যুক্ত করুন"
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              {/* Microphone Voice Command Toggle Button with Visual Pulse Animation */}
              <div className="relative inline-flex items-center">
                {isListening && (
                  <>
                    {/* Multi-layered expanding ripple pulse rings */}
                    <span className="absolute -inset-1 rounded-xl bg-rose-500/35 animate-ping pointer-events-none" />
                    <span className="absolute -inset-2 rounded-xl bg-rose-500/15 animate-pulse blur-xs pointer-events-none" />
                  </>
                )}

                <motion.button
                  id="voice-input-mic-btn"
                  onClick={handleVoiceToggle}
                  title={
                    isListening
                      ? 'ভয়েস ইনপুট বন্ধ করুন'
                      : `ভয়েস কমান্ড / মুখে বলুন (${language === 'bn-BD' ? 'বাংলা' : 'English'})`
                  }
                  animate={
                    isListening
                      ? {
                          scale: [1, 1.05, 1],
                          boxShadow: [
                            '0 0 0 0 rgba(244, 63, 94, 0.5), 0 2px 8px rgba(244, 63, 94, 0.3)',
                            '0 0 0 6px rgba(244, 63, 94, 0), 0 2px 12px rgba(244, 63, 94, 0.4)',
                            '0 0 0 0 rgba(244, 63, 94, 0.5), 0 2px 8px rgba(244, 63, 94, 0.3)',
                          ],
                        }
                      : { scale: 1, boxShadow: 'none' }
                  }
                  transition={
                    isListening
                      ? {
                          repeat: Infinity,
                          duration: 1.4,
                          ease: 'easeInOut',
                        }
                      : { duration: 0.2 }
                  }
                  className={`relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    isListening
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700'
                  }`}
                >
                  {isListening ? (
                    <>
                      {/* Active recording beacon */}
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                      </span>

                      <MicOff className="w-3.5 h-3.5" />
                      <span>রেকর্ডিং হচ্ছে...</span>

                      {/* Mini Live Audio Equalizer Bars */}
                      <div className="flex items-center gap-0.5 h-3 ml-0.5">
                        {[0.4, 0.9, 0.6, 1, 0.5].map((factor, i) => (
                          <motion.span
                            key={i}
                            animate={{
                              scaleY: [
                                0.3, 
                                Math.min(1, Math.max(0.35, ((audioLevel || 20) / 35) * factor)), 
                                0.3
                              ],
                            }}
                            transition={{
                              repeat: Infinity,
                              duration: 0.5 + i * 0.1,
                              ease: 'easeInOut',
                            }}
                            className="w-0.5 h-3 bg-white/90 rounded-full origin-bottom"
                          />
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="hidden sm:inline">ভয়েস</span>
                    </>
                  )}
                </motion.button>
              </div>

              {input && (
                <button
                  id="clear-input-btn"
                  onClick={() => setInput('')}
                  title="লেখা মুছুন"
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <span className="hidden sm:inline text-[11px] text-stone-400">
                Enter পাঠাতে | 'পাঠাও' ভয়েস কমান্ড
              </span>

              {isGenerating ? (
                <button
                  id="stop-generating-btn"
                  onClick={onStop}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>থামাও</span>
                </button>
              ) : (
                <button
                  id="send-message-btn"
                  onClick={() => {
                    if (isListening) stopListening();
                    onSend();
                  }}
                  disabled={!input.trim()}
                  className={`p-2 rounded-xl transition-all ${
                    input.trim()
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                      : 'bg-stone-200 dark:bg-stone-800 text-stone-400 cursor-not-allowed'
                  }`}
                  title="মেসেজ পাঠান"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
