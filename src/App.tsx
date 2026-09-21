import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Sparkles, 
  Code2, 
  PenTool, 
  GraduationCap, 
  Search, 
  Compass, 
  Layers, 
  ArrowRight,
  Terminal,
  Cpu,
  FileCode,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { ChatMessage, ChatSession, AssistantMode } from './types';
import { QUICK_PROMPTS } from './data/prompts';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatMessageItem } from './components/ChatMessageItem';
import { ChatInput } from './components/ChatInput';
import { ArchitectureModal } from './components/ArchitectureModal';
import { CodePreviewModal } from './components/CodePreviewModal';

const STORAGE_KEY = 'ai_studio_chat_sessions_v1';
const THEME_KEY = 'ai_studio_theme_mode';

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved !== null) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply dark mode class to html document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(THEME_KEY, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(THEME_KEY, 'light');
    }
  }, [darkMode]);

  // Sessions state
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse saved sessions', e);
    }
    const initialSession: ChatSession = {
      id: 'session-' + Date.now(),
      title: 'নতুন কথোপকথন',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      mode: 'general',
      enableSearch: false,
    };
    return [initialSession];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => sessions[0]?.id || 'session-1');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [architectureModalOpen, setArchitectureModalOpen] = useState(false);
  const [previewModal, setPreviewModal] = useState<{ isOpen: boolean; code: string; language: string }>({
    isOpen: false,
    code: '',
    language: 'html',
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Active session
  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const mode = activeSession?.mode || 'general';
  const enableSearch = activeSession?.enableSearch ?? false;

  // Persist sessions
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  // Scroll to bottom on message update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages]);

  // Update active session property helper
  const updateActiveSession = (updater: (s: ChatSession) => ChatSession) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          return updater({ ...s, updatedAt: Date.now() });
        }
        return s;
      })
    );
  };

  const setMode = (newMode: AssistantMode) => {
    updateActiveSession((s) => ({ ...s, mode: newMode }));
  };

  const setEnableSearch = (valOrFn: boolean | ((prev: boolean) => boolean)) => {
    updateActiveSession((s) => {
      const nextVal = typeof valOrFn === 'function' ? valOrFn(s.enableSearch) : valOrFn;
      return { ...s, enableSearch: nextVal };
    });
  };

  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: 'session-' + Date.now(),
      title: 'নতুন কথোপকথন',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      mode: 'general',
      enableSearch: false,
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length <= 1) {
      handleClearChat();
      return;
    }
    const remaining = sessions.filter((s) => s.id !== id);
    setSessions(remaining);
    if (activeSessionId === id) {
      setActiveSessionId(remaining[0].id);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('আপনি কি এই চ্যাটের সব মেসেজ মুছে ফেলতে চান?')) {
      updateActiveSession((s) => ({
        ...s,
        messages: [],
        title: 'নতুন কথোপকথন',
      }));
    }
  };

  const handleExportChat = () => {
    if (!activeSession || activeSession.messages.length === 0) return;
    let content = `# ${activeSession.title}\nDate: ${new Date(activeSession.createdAt).toLocaleString()}\nMode: ${activeSession.mode}\n\n---\n\n`;
    activeSession.messages.forEach((msg) => {
      const sender = msg.role === 'user' ? '👤 User' : '🤖 AI Assistant';
      content += `### ${sender} (${new Date(msg.timestamp).toLocaleTimeString()})\n\n${msg.text}\n\n`;
      if (msg.groundingChunks && msg.groundingChunks.length > 0) {
        content += `**Grounding Sources:**\n`;
        msg.groundingChunks.forEach((c) => {
          if (c.web) content += `- [${c.web.title || c.web.uri}](${c.web.uri})\n`;
        });
        content += '\n';
      }
      content += '---\n\n';
    });

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeSession.title.slice(0, 30).replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);

    // mark streaming message as stopped
    updateActiveSession((s) => ({
      ...s,
      messages: s.messages.map((m) => (m.isStreaming ? { ...m, isStreaming: false } : m)),
    }));
  };

  const executeChatStream = async (
    updatedMessages: ChatMessage[],
    promptText: string,
    assistantMsgId: string
  ) => {
    setIsGenerating(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, text: m.text })),
          prompt: promptText,
          enableSearch,
          mode,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported on this response.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedText = '';
      let accumulatedGrounding: any[] = [];
      let searchQueries: string[] = [];

      let hasReceivedError = false;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (!dataStr) continue;

            let data: any;
            try {
              data = JSON.parse(dataStr);
            } catch {
              continue;
            }

            if (data.error) {
              hasReceivedError = true;
              updateActiveSession((s) => ({
                ...s,
                messages: s.messages.map((m) =>
                  m.id === assistantMsgId
                    ? {
                        ...m,
                        isStreaming: false,
                        error: data.error,
                      }
                    : m
                ),
              }));
              return;
            }

            if (data.text) {
              accumulatedText += data.text;
              updateActiveSession((s) => ({
                ...s,
                messages: s.messages.map((m) =>
                  m.id === assistantMsgId ? { ...m, text: accumulatedText, error: undefined } : m
                ),
              }));
            }
            if (data.groundingChunks) {
              accumulatedGrounding = data.groundingChunks;
            }
            if (data.searchQueries) {
              searchQueries = data.searchQueries;
            }
          }
        }
      }

      if (!hasReceivedError) {
        // Finish streaming
        updateActiveSession((s) => ({
          ...s,
          messages: s.messages.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  text: accumulatedText || 'দুঃখিত, কোনো উত্তর পাওয়া যায়নি। পুনরায় চেষ্টা করুন।',
                  isStreaming: false,
                  groundingChunks: accumulatedGrounding,
                  searchQueries,
                }
              : m
          ),
        }));
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Stream aborted by user');
      } else {
        console.error('Error in chat stream:', err);
        updateActiveSession((s) => ({
          ...s,
          messages: s.messages.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  isStreaming: false,
                  error: err.message || 'একটি ত্রুটি ঘটেছে। দয়া করে সেটিংস থেকে GEMINI_API_KEY চেক করুন।',
                }
              : m
          ),
        }));
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const handleSendMessage = async (textOverride?: string) => {
    const textToSend = (textOverride || input).trim();
    if (!textToSend || isGenerating) return;

    setInput('');

    const userMessage: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      text: textToSend,
      timestamp: Date.now(),
      mode,
    };

    const assistantMsgId = 'msg-' + (Date.now() + 1);
    const initialAssistantMessage: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      text: '',
      timestamp: Date.now(),
      isStreaming: true,
      mode,
    };

    // Update session title if first user message
    const isFirstMessage = activeSession.messages.length === 0;
    const newTitle = isFirstMessage
      ? textToSend.length > 28
        ? textToSend.slice(0, 28) + '...'
        : textToSend
      : activeSession.title;

    // Append user & assistant messages
    const updatedMessages = [...activeSession.messages, userMessage];
    updateActiveSession((s) => ({
      ...s,
      title: newTitle,
      messages: [...updatedMessages, initialAssistantMessage],
    }));

    await executeChatStream(updatedMessages, textToSend, assistantMsgId);
  };

  const handleEditAndResend = async (messageId: string, newText: string) => {
    const trimmed = newText.trim();
    if (!trimmed) return;

    // If currently generating, abort the ongoing stream first
    if (isGenerating && abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const msgIndex = activeSession.messages.findIndex((m) => m.id === messageId);
    if (msgIndex === -1) return;

    const originalMsg = activeSession.messages[msgIndex];
    const editedUserMessage: ChatMessage = {
      ...originalMsg,
      text: trimmed,
      timestamp: Date.now(),
    };

    // Truncate conversation history up to before this message, then add edited message
    const priorHistory = activeSession.messages.slice(0, msgIndex);
    const updatedMessages = [...priorHistory, editedUserMessage];

    const assistantMsgId = 'msg-' + (Date.now() + 1);
    const initialAssistantMessage: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      text: '',
      timestamp: Date.now(),
      isStreaming: true,
      mode,
    };

    // Update title if it was the first message
    const newTitle = msgIndex === 0
      ? trimmed.length > 28
        ? trimmed.slice(0, 28) + '...'
        : trimmed
      : activeSession.title;

    updateActiveSession((s) => ({
      ...s,
      title: newTitle,
      messages: [...updatedMessages, initialAssistantMessage],
    }));

    await executeChatStream(updatedMessages, trimmed, assistantMsgId);
  };

  const handleRetryLastMessage = () => {
    // Find the last user message
    const lastUserMsg = [...activeSession.messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg && lastUserMsg.text) {
      handleSendMessage(lastUserMsg.text);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 antialiased">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onOpenArchitecture={() => setArchitectureModalOpen(true)}
        onSelectMode={setMode}
        currentMode={mode}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        <Header
          onToggleSidebar={() => setSidebarOpen((o) => !o)}
          onOpenArchitecture={() => setArchitectureModalOpen(true)}
          onNewChat={handleNewChat}
          onClearChat={handleClearChat}
          onExportChat={handleExportChat}
          mode={mode}
          enableSearch={enableSearch}
          hasMessages={activeSession?.messages.length > 0}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        {/* Scrollable messages container */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {activeSession.messages.length === 0 ? (
            <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
              {/* Hero Banner */}
              <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Claude ও Gemini-সক্ষম বাংলা ও ইংরেজি স্মার্ট অ্যাসিস্ট্যান্ট</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100">
                  কীভাবে সাহায্য করতে পারি?
                </h2>
                <p className="text-sm text-stone-600 dark:text-stone-400 max-w-2xl mx-auto leading-relaxed">
                  কোডিং ও সফটওয়্যার ডেভেলপমেন্ট, লেখালেখি, মাইক্রোফোনে বাংলা/ইংরেজি ভয়েস কমান্ড এবং Google Search গ্রাউন্ডিং সহ রিয়েল-টাইম গবেষণা—যেকোনো প্রশ্ন লিখুন বা মুখে বলুন।
                </p>
              </div>

              {/* Architecture Blueprint Feature Card */}
              <div
                onClick={() => setArchitectureModalOpen(true)}
                className="cursor-pointer group p-5 rounded-2xl bg-gradient-to-r from-stone-900 via-stone-800 to-emerald-950 text-white shadow-lg border border-stone-700/80 hover:border-emerald-500/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-400 text-stone-950 font-bold">
                      আর্কিটেকচার গাইড
                    </span>
                    <h3 className="text-base font-bold flex items-center gap-1.5 group-hover:text-emerald-300 transition-colors">
                      <Layers className="w-4 h-4 text-amber-400" />
                      Claude বা ChatGPT-এর মতো নিজস্ব AI অ্যাপ কীভাবে বানাবেন?
                    </h3>
                  </div>
                  <p className="text-xs text-stone-300 leading-relaxed max-w-2xl">
                    কোটি টাকার GPU ছাড়াই বর্তমান LLM API (Google Gemini, Claude), Express ব্যাকএন্ড, React ফ্রন্টএন্ড এবং Vector DB/RAG দিয়ে কয়েক সপ্তাহেই কাজ চালানোর মতো ফুল-ফাংশনাল AI প্রোডাক্ট লঞ্চ করার বিস্তারিত রোডম্যাপ।
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold backdrop-blur-xs transition-colors">
                  <span>ব্লুপ্রিন্ট দেখুন</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Quick Prompts Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                    রেডিমেড প্রম্পট ও ফিচার (Quick Starters)
                  </h3>
                  <span className="text-[11px] text-stone-600 dark:text-stone-400">ক্লিক করে সরাসরি শুরু করুন</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {QUICK_PROMPTS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleSendMessage(p.prompt)}
                      className="group/card text-left p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-900/40 hover:bg-white dark:hover:bg-stone-800 hover:border-emerald-300 dark:hover:border-emerald-700 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                            {p.titleBn}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover/card:text-emerald-500 group-hover/card:translate-x-0.5 transition-all" />
                        </div>
                        <h4 className="text-xs font-bold text-stone-800 dark:text-stone-100 group-hover/card:text-emerald-600 dark:group-hover/card:text-emerald-400">
                          {p.titleEn}
                        </h4>
                        <p className="text-[11px] text-stone-700 dark:text-stone-300 line-clamp-2 leading-relaxed">
                          {p.prompt}
                        </p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-stone-200/60 dark:border-stone-800 text-[10px] text-stone-600 dark:text-stone-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span>{p.descriptionBn}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 5 Core Pillars Info Bar */}
              <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/30">
                <p className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-3">
                  অ্যাসিস্ট্যান্টের ৫টি প্রধান কাজের ক্ষেত্র
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/60">
                    <Code2 className="w-4 h-4 mx-auto mb-1 text-emerald-500" />
                    <span className="font-semibold block text-stone-800 dark:text-stone-200">কোডিং</span>
                    <span className="text-[10px] text-stone-600 dark:text-stone-400">Python, JS, React</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/60">
                    <PenTool className="w-4 h-4 mx-auto mb-1 text-amber-500" />
                    <span className="font-semibold block text-stone-800 dark:text-stone-200">লেখা ও অনুবাদ</span>
                    <span className="text-[10px] text-stone-600 dark:text-stone-400">ইমেইল, রিপোর্ট</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/60">
                    <GraduationCap className="w-4 h-4 mx-auto mb-1 text-purple-500" />
                    <span className="font-semibold block text-stone-800 dark:text-stone-200">শেখা ও কনসেপ্ট</span>
                    <span className="text-[10px] text-stone-600 dark:text-stone-400">সহজ ভাষায় ব্যাখ্যা</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/60">
                    <Search className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                    <span className="font-semibold block text-stone-800 dark:text-stone-200">গুগল সার্চ</span>
                    <span className="text-[10px] text-stone-600 dark:text-stone-400">লাইভ ডাটা গ্রাউন্ডিং</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/60 col-span-2 sm:col-span-1">
                    <Compass className="w-4 h-4 mx-auto mb-1 text-rose-500" />
                    <span className="font-semibold block text-stone-800 dark:text-stone-200">পরামর্শ ও ফাইল</span>
                    <span className="text-[10px] text-stone-600 dark:text-stone-400">রোডম্যাপ ও কোড রান</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-stone-100 dark:divide-stone-800/40">
              {activeSession.messages.map((message) => (
                <ChatMessageItem
                  key={message.id}
                  message={message}
                  onPreviewCode={(code, language) =>
                    setPreviewModal({ isOpen: true, code, language })
                  }
                  onSelectPrompt={(p) => handleSendMessage(p)}
                  onRetry={handleRetryLastMessage}
                  onEditMessage={handleEditAndResend}
                  isGenerating={isGenerating}
                />
              ))}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>

        {/* Input Bar */}
        <ChatInput
          input={input}
          setInput={setInput}
          onSend={(text) => handleSendMessage(text)}
          onStop={handleStopGenerating}
          isGenerating={isGenerating}
          enableSearch={enableSearch}
          setEnableSearch={setEnableSearch}
          mode={mode}
          setMode={setMode}
        />
      </div>

      {/* Architecture Guide Modal */}
      <ArchitectureModal
        isOpen={architectureModalOpen}
        onClose={() => setArchitectureModalOpen(false)}
        onSelectPrompt={(p) => handleSendMessage(p)}
      />

      {/* Code Sandbox Preview Modal */}
      <CodePreviewModal
        isOpen={previewModal.isOpen}
        onClose={() => setPreviewModal((prev) => ({ ...prev, isOpen: false }))}
        code={previewModal.code}
        language={previewModal.language}
      />
    </div>
  );
}
