import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { 
  Bot, 
  User, 
  Copy, 
  Check, 
  Globe, 
  ExternalLink, 
  Play, 
  Download, 
  Volume2, 
  VolumeX, 
  AlertCircle,
  FileCode,
  Sparkles,
  RotateCw,
  Pencil,
  Send,
  X,
  Gauge,
  Music,
  Youtube,
  Disc3
} from 'lucide-react';
import { ChatMessage, GroundingChunk } from '../types';

interface ChatMessageItemProps {
  message: ChatMessage;
  onPreviewCode: (code: string, language: string) => void;
  onSelectPrompt?: (prompt: string) => void;
  onRetry?: () => void;
  onEditMessage?: (messageId: string, newText: string) => void;
  isGenerating?: boolean;
}

const CodeBlockItem: React.FC<{
  language: string;
  codeString: string;
  children: React.ReactNode;
  onPreviewCode: (code: string, language: string) => void;
  downloadAsFile: (content: string, filename: string) => void;
}> = ({ language, codeString, children, onPreviewCode, downloadAsFile }) => {
  const [copied, setCopied] = useState(false);
  const canPreview = ['html', 'js', 'javascript', 'svg', 'css'].includes(language.toLowerCase());

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-stone-700/80 bg-stone-900 text-stone-100 shadow-md">
      {/* Code Block Header */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-stone-950/90 border-b border-stone-800 text-xs font-mono">
        <div className="flex items-center gap-2">
          <FileCode className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-stone-300 font-semibold uppercase">{language || 'code'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {canPreview && (
            <button
              onClick={() => onPreviewCode(codeString, language)}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors cursor-pointer"
              title="লাইভ প্রিভিউ দেখুন"
            >
              <Play className="w-3 h-3" />
              <span>Run / Preview</span>
            </button>
          )}
          <button
            onClick={() => downloadAsFile(codeString, `code-snippet.${language || 'txt'}`)}
            className="p-1.5 rounded hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
            title="কোড ফাইল ডাউনলোড করুন"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleCopyCode}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-all cursor-pointer ${
              copied
                ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30'
                : 'bg-stone-800/80 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-700/60'
            }`}
            title="কোড ক্লিপবোর্ডে কপি করুন"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>কপি হয়েছে!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>কপি কোড</span>
              </>
            )}
          </button>
        </div>
      </div>
      {/* Code Content */}
      <pre className="p-4 overflow-x-auto text-xs font-mono leading-relaxed bg-stone-900 selection:bg-emerald-700">
        <code>{children}</code>
      </pre>
    </div>
  );
};

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  onPreviewCode,
  onSelectPrompt,
  onRetry,
  onEditMessage,
  isGenerating = false,
}) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSpeed, setSpeechSpeed] = useState<number>(1);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditText(message.text);
  }, [message.text]);

  useEffect(() => {
    if (isEditing && editTextareaRef.current) {
      editTextareaRef.current.focus();
      editTextareaRef.current.style.height = 'auto';
      editTextareaRef.current.style.height = `${editTextareaRef.current.scrollHeight}px`;
    }
  }, [isEditing]);

  const handleSaveEdit = () => {
    const trimmed = editText.trim();
    if (!trimmed || !onEditMessage) return;
    setIsEditing(false);
    onEditMessage(message.id, trimmed);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Clean text for text-to-speech (remove markdown syntax, codeblocks, links)
  const cleanTextForSpeech = (rawText: string) => {
    return rawText
      .replace(/```[\s\S]*?```/g, ' কোড ব্লক বাদ দেওয়া হয়েছে। ')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[*_~#]/g, '')
      .replace(/>\s+/g, '')
      .replace(/\n+/g, ' ')
      .trim();
  };

  useEffect(() => {
    return () => {
      // Cancel speech synthesis if component unmounts
      if ('speechSynthesis' in window && isSpeaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSpeaking]);

  const handleSpeak = (targetSpeed?: number) => {
    if (!('speechSynthesis' in window)) {
      alert('আপনার ব্রাউজারে টেক্সট-টু-স্পিচ (TTS) সমর্থিত নয়।');
      return;
    }

    const rateToUse = targetSpeed !== undefined ? targetSpeed : speechSpeed;

    if (isSpeaking && targetSpeed === undefined) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const spokenText = cleanTextForSpeech(message.text) || message.text;
    const utterance = new SpeechSynthesisUtterance(spokenText);
    
    // Choose appropriate voice (Bengali priority, or Hindi/English fallback)
    const voices = window.speechSynthesis.getVoices();
    const bnVoice = voices.find(
      (v) => v.lang.startsWith('bn') || v.name.toLowerCase().includes('bangla') || v.name.toLowerCase().includes('bengali')
    );
    if (bnVoice) {
      utterance.voice = bnVoice;
      utterance.lang = bnVoice.lang;
    } else {
      // Auto-detect if English dominant
      const isEnglish = /^[\x00-\x7F\s.,!?-]+$/.test(spokenText.slice(0, 50));
      if (isEnglish) {
        const enVoice = voices.find((v) => v.lang.startsWith('en'));
        if (enVoice) utterance.voice = enVoice;
      }
    }

    utterance.rate = rateToUse;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      setIsSpeaking(false);
    };

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSpeedChange = (speed: number) => {
    setSpeechSpeed(speed);
    if (isSpeaking) {
      // Restart speaking seamlessly with new speed
      handleSpeak(speed);
    }
  };

  const downloadAsFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Custom components for Markdown rendering
  const MarkdownComponents = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      const codeString = String(children).replace(/\n$/, '');

      if (!inline && (language || codeString.includes('\n'))) {
        return (
          <CodeBlockItem
            language={language}
            codeString={codeString}
            onPreviewCode={onPreviewCode}
            downloadAsFile={downloadAsFile}
          >
            {children}
          </CodeBlockItem>
        );
      }

      return (
        <code className="px-1.5 py-0.5 rounded bg-stone-200 dark:bg-stone-800 font-mono text-xs text-emerald-700 dark:text-emerald-400 font-medium" {...props}>
          {children}
        </code>
      );
    },
    p({ children }: any) {
      return <p className="mb-3 leading-relaxed last:mb-0 text-stone-800 dark:text-stone-200">{children}</p>;
    },
    ul({ children }: any) {
      return <ul className="list-disc pl-5 mb-3 space-y-1 text-stone-800 dark:text-stone-200">{children}</ul>;
    },
    ol({ children }: any) {
      return <ol className="list-decimal pl-5 mb-3 space-y-1 text-stone-800 dark:text-stone-200">{children}</ol>;
    },
    li({ children }: any) {
      return <li className="leading-relaxed">{children}</li>;
    },
    h1({ children }: any) {
      return <h1 className="text-xl font-bold mt-4 mb-2 text-stone-900 dark:text-white border-b border-stone-200 dark:border-stone-800 pb-1">{children}</h1>;
    },
    h2({ children }: any) {
      return <h2 className="text-lg font-bold mt-3 mb-2 text-stone-900 dark:text-white">{children}</h2>;
    },
    h3({ children }: any) {
      return <h3 className="text-base font-semibold mt-2.5 mb-1.5 text-stone-900 dark:text-stone-100">{children}</h3>;
    },
    blockquote({ children }: any) {
      return <blockquote className="border-l-3 border-emerald-500 pl-3 my-2 text-stone-600 dark:text-stone-400 italic text-sm">{children}</blockquote>;
    },
    table({ children }: any) {
      return (
        <div className="overflow-x-auto my-3 rounded-lg border border-stone-200 dark:border-stone-800">
          <table className="min-w-full divide-y divide-stone-200 dark:divide-stone-800 text-xs text-left">
            {children}
          </table>
        </div>
      );
    },
    a({ href, children }: any) {
      if (!href) return <span>{children}</span>;

      // Extract YouTube Video ID from any URL format:
      // watch?v=ID, youtu.be/ID, shorts/ID, embed/ID, music.youtube.com/watch?v=ID
      const ytMatch = href.match(/(?:(?:youtube|music\.youtube)\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
      const isYoutube = Boolean(ytMatch);
      const videoId = ytMatch ? ytMatch[1] : null;

      if (isYoutube && videoId) {
        return (
          <div className="my-4 rounded-2xl overflow-hidden border border-red-500/30 dark:border-red-500/20 bg-stone-950 text-stone-100 shadow-xl">
            {/* Header bar with controls */}
            <div className="px-3.5 py-2.5 bg-stone-900/90 border-b border-stone-800 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="p-1 rounded-md bg-red-600 text-white shrink-0">
                  <Play className="w-3.5 h-3.5 fill-current" />
                </span>
                <span className="font-semibold text-stone-200 truncate flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span className="truncate">{children || 'ইউটিউব গান / ভিডিও'}</span>
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(href);
                    alert('ইউটিউব লিংক কপি করা হয়েছে!');
                  }}
                  title="শেয়ার লিংক কপি করুন"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors text-[11px] cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span className="hidden sm:inline">লিংক কপি</span>
                </button>

                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  referrerPolicy="no-referrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-600 hover:bg-red-700 text-white font-medium text-[11px] transition-colors"
                  title="মূল ইউটিউব অ্যাপে খুলুন"
                >
                  <Youtube className="w-3 h-3" />
                  <span className="hidden sm:inline">ইউটিউবে</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Embedded Responsive YouTube Player */}
            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`}
                title="YouTube music and video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>

            {/* Audio / Song footer info */}
            <div className="px-3.5 py-2 bg-stone-900/60 border-t border-stone-800/80 text-[11px] text-stone-400 flex items-center justify-between">
              <div className="flex items-center gap-1.5 truncate">
                <Disc3 className="w-3.5 h-3.5 text-red-400 animate-spin [animation-duration:6s] shrink-0" />
                <span className="truncate">অ্যাপের ভেতরেই সরাসরি গানটি শুনতে পারেন</span>
              </div>
              <span className="text-stone-500 font-mono text-[10px] shrink-0">ID: {videoId}</span>
            </div>
          </div>
        );
      }

      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          referrerPolicy="no-referrer"
          className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 underline font-medium hover:bg-emerald-50 dark:hover:bg-emerald-950/40 px-1 py-0.5 rounded transition-colors"
        >
          <span>{children}</span>
          <ExternalLink className="w-3 h-3 inline shrink-0" />
        </a>
      );
    },
    th({ children }: any) {
      return <th className="px-3 py-2 bg-stone-100 dark:bg-stone-800 font-semibold text-stone-900 dark:text-stone-100">{children}</th>;
    },
    td({ children }: any) {
      return <td className="px-3 py-2 border-t border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300">{children}</td>;
    },
  };

  return (
    <div
      id={`message-${message.id}`}
      className={`group py-5 px-4 sm:px-6 transition-colors ${
        isUser
          ? 'bg-transparent'
          : 'bg-stone-50/70 dark:bg-stone-900/40 border-y border-stone-100 dark:border-stone-800/60'
      }`}
    >
      <div className="max-w-4xl mx-auto flex items-start gap-4">
        {/* Avatar */}
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
            isUser
              ? 'bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900 font-medium text-xs'
              : 'bg-emerald-600 dark:bg-emerald-500 text-white'
          }`}
        >
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </div>

        {/* Message body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              {isUser ? 'You' : 'AI Assistant (Gemini 3.8 Flash)'}
            </span>
            <span className="text-[11px] text-stone-400 font-mono">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* Error display if any */}
          {message.error && (
            <div className="p-3.5 mb-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span className="leading-relaxed">{message.error}</span>
              </div>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>পুনরায় চেষ্টা করুন</span>
                </button>
              )}
            </div>
          )}

          {/* Text Content / Edit Box */}
          {isUser && isEditing ? (
            <div className="mt-1 w-full space-y-2.5">
              <textarea
                ref={editTextareaRef}
                value={editText}
                onChange={(e) => {
                  setEditText(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSaveEdit();
                  } else if (e.key === 'Escape') {
                    setIsEditing(false);
                    setEditText(message.text);
                  }
                }}
                placeholder="আপনার বার্তা সম্পাদনা করুন..."
                rows={2}
                className="w-full resize-none p-3 text-sm rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-850 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 dark:focus:ring-emerald-400/50 shadow-inner leading-relaxed"
              />
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[11px] text-stone-400 dark:text-stone-500 hidden sm:inline">
                  পাঠাতে <kbd className="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-[10px] font-mono">Enter</kbd> চাপুন, নতুন লাইনের জন্য <kbd className="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-[10px] font-mono">Shift+Enter</kbd>
                </span>
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditText(message.text);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>বাতিল</span>
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={!editText.trim() || editText.trim() === message.text || isGenerating}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-xs transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>সংরক্ষণ ও পাঠান</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm prose-stone dark:prose-invert max-w-none break-words">
              <Markdown components={MarkdownComponents}>
                {message.text}
              </Markdown>
            </div>
          )}

          {/* User Action bar */}
          {isUser && !isEditing && (
            <div className="mt-2.5 flex items-center gap-1.5 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              {onEditMessage && (
                <button
                  onClick={() => {
                    setEditText(message.text);
                    setIsEditing(true);
                  }}
                  title="মেসেজটি এডিট করুন ও নতুন উত্তর পান"
                  className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5 text-stone-500 hover:text-emerald-600 dark:hover:text-emerald-400" />
                  <span>এডিট</span>
                </button>
              )}
              <button
                onClick={handleCopyMessage}
                title="মেসেজ কপি করো"
                className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'কপি হয়েছে' : 'কপি'}</span>
              </button>
            </div>
          )}

          {/* Streaming cursor indicator */}
          {message.isStreaming && (
            <span className="inline-block w-2 h-4 ml-1 align-middle bg-emerald-500 animate-pulse rounded-xs" />
          )}

          {/* Google Search Grounding Sources */}
          {message.groundingChunks && message.groundingChunks.length > 0 && (
            <div className="mt-4 pt-3 border-t border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 dark:text-stone-300 mb-2.5">
                <Globe className="w-3.5 h-3.5 text-blue-500" />
                <span>তথ্যসূত্র ও গুগল সার্চ গ্রাউন্ডিং (Google Search Sources)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {message.groundingChunks.map((chunk, idx) => {
                  if (!chunk.web) return null;
                  const domain = (() => {
                    try {
                      return new URL(chunk.web.uri).hostname.replace('www.', '');
                    } catch {
                      return 'source';
                    }
                  })();

                  return (
                    <a
                      key={idx}
                      href={chunk.web.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      referrerPolicy="no-referrer"
                      className="p-2.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/60 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-all flex items-start justify-between gap-2 group/link text-xs"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-stone-900 dark:text-stone-100 truncate group-hover/link:text-blue-600 dark:group-hover/link:text-blue-400">
                          {chunk.web.title || domain}
                        </p>
                        <p className="text-[11px] text-stone-600 dark:text-stone-400 truncate mt-0.5">
                          {domain}
                        </p>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-stone-600 group-hover/link:text-blue-600 dark:group-hover/link:text-blue-400 shrink-0 mt-0.5" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Search Queries used */}
          {message.searchQueries && message.searchQueries.length > 0 && (
            <div className="mt-2 flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-stone-600 dark:text-stone-400">অনুসন্ধান:</span>
              {message.searchQueries.map((q, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700"
                >
                  "{q}"
                </span>
              ))}
            </div>
          )}

          {/* Assistant Action bar */}
          {!isUser && !message.isStreaming && message.text && (
            <div className="mt-3.5 pt-2.5 flex items-center gap-2 flex-wrap border-t border-stone-200/60 dark:border-stone-800/60">
              {/* Prominent Copy Button */}
              <button
                id={`ai-copy-btn-${message.id}`}
                onClick={handleCopyMessage}
                title="এআই-এর সম্পূর্ণ উত্তর ক্লিপবোর্ডে কপি করুন"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-2xs cursor-pointer ${
                  copied
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 font-semibold'
                    : 'bg-white hover:bg-stone-50 dark:bg-stone-850 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-750 hover:border-stone-300 dark:hover:border-stone-650'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>কপি করা হয়েছে!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
                    <span>কপি করুন</span>
                  </>
                )}
              </button>

              {/* Text to Speech Button & Speed Selector */}
              <div className="flex items-center gap-1 rounded-lg p-0.5 bg-stone-100/80 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-750">
                <button
                  id={`ai-speak-btn-${message.id}`}
                  onClick={() => handleSpeak()}
                  title={isSpeaking ? 'ভয়েস পড়া থামান' : 'এআই-এর উত্তর পড়ে শোনান (Text-to-Speech)'}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    isSpeaking
                      ? 'bg-amber-500 text-white shadow-xs font-semibold'
                      : 'hover:bg-white dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-white" />
                      <span>থামান</span>
                      {/* Playing wave animation indicator */}
                      <span className="flex items-center gap-0.5 h-3 ml-0.5">
                        <span className="w-0.5 h-3 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-0.5 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-0.5 h-3 bg-white rounded-full animate-bounce" />
                      </span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
                      <span>পড়ে শোনান</span>
                    </>
                  )}
                </button>

                {/* Playback Speed Selector (0.5x, 1x, 1.5x, 2x) */}
                <div 
                  className="flex items-center gap-0.5 pl-1 pr-0.5 border-l border-stone-200 dark:border-stone-700" 
                  title="প্লেব্যাক স্পিড / পড়ার গতি নির্বাচন করুন"
                >
                  {[0.5, 1, 1.5, 2].map((speed) => {
                    const isSelected = speechSpeed === speed;
                    return (
                      <button
                        key={speed}
                        id={`ai-speed-${speed}x-${message.id}`}
                        onClick={() => handleSpeedChange(speed)}
                        title={`গতি ${speed}x সেট করুন`}
                        className={`px-1.5 py-0.5 text-[11px] rounded transition-all font-mono cursor-pointer ${
                          isSelected
                            ? 'bg-white dark:bg-stone-900 text-emerald-600 dark:text-emerald-400 font-bold shadow-2xs border border-stone-200/80 dark:border-stone-700'
                            : 'text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-stone-700/50'
                        }`}
                      >
                        {speed}x
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Markdown Download */}
              <button
                id={`ai-download-btn-${message.id}`}
                onClick={() => downloadAsFile(message.text, 'ai-response.md')}
                title="Markdown ফাইল হিসেবে ডাউনলোড করুন"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-stone-50 dark:bg-stone-850 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-750 hover:border-stone-300 dark:hover:border-stone-650 transition-colors shadow-2xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
                <span>ডাউনলোড (.md)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
