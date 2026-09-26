import React, { useState, useEffect, useRef } from 'react';
import {
  Globe,
  Search,
  Youtube,
  Music,
  FileText,
  ExternalLink,
  X,
  Maximize2,
  Minimize2,
  RotateCw,
  Home,
  Play,
  Check,
  Copy,
  Sparkles,
  Disc3,
  Headphones,
  AlertCircle,
  ArrowRight,
  Radio,
  BookOpen
} from 'lucide-react';
import Markdown from 'react-markdown';
import { useMiniBrowser } from '../context/MiniBrowserContext';

interface SearchResult {
  title: string;
  url: string;
  domain?: string;
  snippet: string;
}

interface SearchResponse {
  query: string;
  instantAnswer?: string;
  knowledgeCard?: {
    title: string;
    subtitle?: string;
    description?: string;
    fields?: Array<{ label: string; value: string }>;
  };
  results: SearchResult[];
  youtubeMedia?: {
    videoId?: string;
    title?: string;
    artist?: string;
    watchUrl?: string;
    musicUrl?: string;
  };
  groundingSources?: Array<{ uri: string; title: string }>;
}

export const MiniGoogleBrowserModal: React.FC = () => {
  const {
    isOpen,
    closeBrowser,
    activeUrl,
    setActiveUrl,
    searchQuery,
    setSearchQuery,
    activeVideoId,
    activeVideoTitle,
    activeTab,
    setActiveTab,
    openYouTubeInBrowser,
  } = useMiniBrowser();

  const [inputUrlOrQuery, setInputUrlOrQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchData, setSearchData] = useState<SearchResponse | null>(null);
  const [lyricsData, setLyricsData] = useState<{ title: string; artist?: string; lyricsText: string } | null>(null);
  const [isLyricsLoading, setIsLyricsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      if (searchQuery) {
        setInputUrlOrQuery(searchQuery);
        handleSearch(searchQuery);
      } else if (activeVideoId) {
        setInputUrlOrQuery(`https://www.youtube.com/watch?v=${activeVideoId}`);
      } else if (activeUrl) {
        setInputUrlOrQuery(activeUrl);
      }
    }
  }, [isOpen, activeVideoId]);

  const handleSearch = async (queryText: string) => {
    const q = queryText.trim();
    if (!q) return;

    setIsLoading(true);
    setActiveTab('search');
    try {
      const res = await fetch('/api/mini-browser/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      if (res.ok) {
        const data: SearchResponse = await res.json();
        setSearchData(data);
      }
    } catch (err) {
      console.warn('Mini browser search failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchLyrics = async (title: string, artist?: string, vid?: string) => {
    setIsLyricsLoading(true);
    setActiveTab('lyrics');
    try {
      const res = await fetch('/api/mini-browser/lyrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songTitle: title, artist, videoId: vid }),
      });
      if (res.ok) {
        const data = await res.json();
        setLyricsData(data);
      }
    } catch (err) {
      console.warn('Lyrics fetch failed:', err);
    } finally {
      setIsLyricsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = inputUrlOrQuery.trim();
    if (!val) return;

    // Check if user entered a direct YouTube link
    const ytMatch = val.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/i);
    if (ytMatch) {
      const vid = ytMatch[1];
      openYouTubeInBrowser(vid, 'ইউটিউব গান / ভিডিও', val);
      return;
    }

    if (val.startsWith('http://') || val.startsWith('https://')) {
      setActiveUrl(val);
      setActiveTab('web');
    } else {
      handleSearch(val);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  const currentVideoId = activeVideoId || searchData?.youtubeMedia?.videoId;
  const currentSongTitle = activeVideoTitle || searchData?.youtubeMedia?.title || searchData?.knowledgeCard?.title || inputUrlOrQuery || 'গান / মিউজিক';
  const watchUrl = currentVideoId ? `https://www.youtube.com/watch?v=${currentVideoId}` : `https://www.youtube.com/results?search_query=${encodeURIComponent(currentSongTitle)}`;
  const musicUrl = currentVideoId ? `https://music.youtube.com/watch?v=${currentVideoId}` : `https://music.youtube.com/search?q=${encodeURIComponent(currentSongTitle)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`bg-stone-900 border border-stone-750 text-stone-100 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-200 ${
          isFullscreen
            ? 'w-full h-full rounded-none sm:rounded-xl'
            : 'w-full max-w-4xl h-[90vh] max-h-[820px]'
        }`}
      >
        {/* Browser Top Titlebar (Chrome / Safari style) */}
        <div className="px-3.5 py-2.5 bg-stone-950 border-b border-stone-800 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            {/* Window control dots */}
            <div className="flex items-center gap-1.5 mr-2">
              <button
                type="button"
                onClick={closeBrowser}
                className="w-3 h-3 rounded-full bg-rose-500 hover:bg-rose-600 transition-colors"
                title="বন্ধ করুন"
              />
              <button
                type="button"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="w-3 h-3 rounded-full bg-amber-500 hover:bg-amber-600 transition-colors"
                title={isFullscreen ? 'ছোট করুন' : 'বড় করুন'}
              />
              <button
                type="button"
                onClick={() => window.open(watchUrl, '_blank')}
                className="w-3 h-3 rounded-full bg-emerald-500 hover:bg-emerald-600 transition-colors"
                title="ব্রাউজারে খুলুন"
              />
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-stone-900/90 p-0.5 rounded-lg border border-stone-800 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('youtube')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
                  activeTab === 'youtube'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                }`}
              >
                <Youtube className="w-3.5 h-3.5 text-white" />
                <span>ইউটিউব ও মিউজিক</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('search')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
                  activeTab === 'search'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                }`}
              >
                <Search className="w-3.5 h-3.5 text-white" />
                <span>গুগল সার্চ</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!lyricsData) {
                    handleFetchLyrics(currentSongTitle, undefined, currentVideoId);
                  } else {
                    setActiveTab('lyrics');
                  }
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
                  activeTab === 'lyrics'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-white" />
                <span>লিরিক্স ও তথ্য</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-750 text-stone-300 transition-colors"
              title={isFullscreen ? 'রিস্টোর করুন' : 'ফুলস্ক্রিন করুন'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={closeBrowser}
              className="p-1.5 rounded-lg bg-stone-800/80 hover:bg-rose-900/60 text-stone-300 hover:text-rose-200 transition-colors"
              title="বন্ধ করুন"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Omnibox / Search & Address Bar */}
        <div className="p-2.5 bg-stone-900 border-b border-stone-800 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setInputUrlOrQuery('https://www.google.com');
              setActiveTab('search');
            }}
            title="গুগল হোম"
            className="p-2 rounded-lg bg-stone-800 hover:bg-stone-750 text-stone-400 hover:text-white transition-colors shrink-0"
          >
            <Home className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => handleSearch(inputUrlOrQuery || currentSongTitle)}
            title="রিফ্রেশ"
            className="p-2 rounded-lg bg-stone-800 hover:bg-stone-750 text-stone-400 hover:text-white transition-colors shrink-0"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
          </button>

          <form onSubmit={handleFormSubmit} className="flex-1 flex items-center relative">
            <div className="absolute left-3 flex items-center gap-1.5 text-stone-400 pointer-events-none">
              <span className="font-bold text-blue-400 text-xs">G</span>
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={inputUrlOrQuery}
              onChange={(e) => setInputUrlOrQuery(e.target.value)}
              placeholder="গুগলে খুঁজুন বা ইউটিউব লিঙ্ক পেস্ট করুন (যেমন: https://youtu.be/...)"
              className="w-full pl-12 pr-24 py-2 rounded-xl bg-stone-950 border border-stone-750 focus:border-blue-500 focus:outline-hidden text-xs text-stone-100 placeholder-stone-500 transition-all font-sans"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="absolute right-1.5 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-xs transition-colors flex items-center gap-1 disabled:opacity-50"
            >
              <span>খুঁজুন</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </form>

          <a
            href={watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="সরাসরি মূল ব্রাউজারে খুলুন"
            className="p-2 rounded-lg bg-stone-800 hover:bg-stone-750 text-stone-300 hover:text-white transition-colors shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-3 py-1.5 bg-stone-950/60 border-b border-stone-800/80 flex items-center gap-1.5 overflow-x-auto text-[11px] shrink-0 scrollbar-none">
          <span className="text-stone-500 text-[10px] uppercase font-semibold shrink-0">জনপ্রিয়:</span>
          {[
            { label: '🎵 Zack Knight - Dheere', query: 'https://youtu.be/Vny_75WmEH4?si=CnMSNOnq_rgEuf17' },
            { label: '🇧🇩 আমার সোনার বাংলা', query: 'আমার সোনার বাংলা গান' },
            { label: '🎧 ইউটিউব মিউজিক ট্রেন্ডিং', query: 'YouTube Music Top Songs' },
            { label: '📰 আজকের খবর', query: 'বাংলাদেশ আজকের খবর' },
          ].map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setInputUrlOrQuery(item.query);
                if (item.query.startsWith('http')) {
                  const ytMatch = item.query.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/i);
                  if (ytMatch) {
                    openYouTubeInBrowser(ytMatch[1], item.label, item.query);
                  }
                } else {
                  handleSearch(item.query);
                }
              }}
              className="px-2 py-0.5 rounded-full bg-stone-800/70 hover:bg-stone-750 text-stone-300 hover:text-white transition-colors shrink-0 border border-stone-700/60"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Browser Viewport Content Area */}
        <div className="flex-1 overflow-y-auto bg-stone-950 p-4 space-y-4">
          {/* TAB 1: YOUTUBE & MUSIC WEB PLAYER */}
          {activeTab === 'youtube' && (
            <div className="space-y-4 max-w-3xl mx-auto">
              {/* Media Title & Author Banner */}
              <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-red-950/40 via-stone-900 to-stone-900 border border-red-500/20 shadow-md">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-red-600/30">
                    <Music className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-white truncate">
                      {currentSongTitle}
                    </h3>
                    <p className="text-xs text-stone-400 flex items-center gap-2 mt-0.5">
                      <span className="inline-flex items-center gap-1 text-red-400 font-medium">
                        <Youtube className="w-3 h-3" />
                        <span>ইউটিউব মিউজিক স্ট্রিম</span>
                      </span>
                      {currentVideoId && (
                        <span className="font-mono text-[10px] text-stone-500">ID: {currentVideoId}</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopy(watchUrl)}
                    className="p-2 rounded-lg bg-stone-800 hover:bg-stone-750 text-stone-300 hover:text-white text-xs transition-colors"
                    title="লিংক কপি করুন"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  <a
                    href={watchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-all shadow-md shadow-red-600/20"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>ইউটিউব অ্যাপে খুলুন</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Embedded Player */}
              {currentVideoId ? (
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-stone-800 shadow-2xl">
                  <iframe
                    src={`https://www.youtube.com/embed/${currentVideoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                    title="YouTube Video Player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>
              ) : (
                <div className="p-8 text-center rounded-2xl bg-stone-900 border border-stone-800 text-stone-400 space-y-2">
                  <Disc3 className="w-8 h-8 text-red-500 mx-auto animate-spin" />
                  <p className="text-sm">ইউটিউব ভিডিও বা গানের লিংক উপরে দিয়ে সার্চ করুন।</p>
                </div>
              )}

              {/* T-Series & Copyright Restricted Fallback Card (The exact solution for Vny_75WmEH4) */}
              <div className="p-4 rounded-2xl bg-stone-900/90 border border-amber-500/30 text-stone-200 space-y-3">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs sm:text-sm font-bold text-amber-300">
                      কপিরাইট সীমাবদ্ধতা ও নিরবচ্ছিন্ন শোনার নিশ্চয়তা:
                    </h4>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      অনেক অফিসিয়াল মিউজিক লেবেল (যেমন T-Series, Sony, VEVO) তাদের গানের ভিডিও অন্য ওয়েবসাইটে সরাসরি এম্বেড প্লেব্যাক বন্ধ রাখে। সেজন্য নিচের যে কোনো বিকল্প দিয়ে মুহূর্তে গানটি চালানো সম্ভব:
                    </p>
                  </div>
                </div>

                {/* Direct Action Launchers */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <a
                    href={watchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:brightness-110 text-white font-bold text-xs transition-all shadow-md shadow-red-600/25"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>ইউটিউব ও ভিডিও শুনুন</span>
                  </a>

                  <a
                    href={musicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 p-3 rounded-xl bg-stone-800 hover:bg-stone-750 text-red-400 hover:text-red-300 font-bold text-xs border border-red-500/30 transition-all shadow-xs"
                  >
                    <Headphones className="w-4 h-4" />
                    <span>YouTube Music এ শুনুন</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => handleFetchLyrics(currentSongTitle, undefined, currentVideoId)}
                    className="flex items-center justify-center gap-2 p-3 rounded-xl bg-stone-800 hover:bg-stone-750 text-purple-400 hover:text-purple-300 font-bold text-xs border border-purple-500/30 transition-all shadow-xs"
                  >
                    <FileText className="w-4 h-4" />
                    <span>গানের লিরিক্স ও কথা পড়ুন</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GOOGLE SEARCH RESULTS */}
          {activeTab === 'search' && (
            <div className="max-w-3xl mx-auto space-y-4">
              {isLoading ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mx-auto" />
                  <p className="text-xs text-stone-400">গুগল থেকে সর্বশেষ তথ্য ও সার্চ রেজাল্ট আনা হচ্ছে...</p>
                </div>
              ) : searchData ? (
                <>
                  {/* Instant Answer Box */}
                  {searchData.instantAnswer && (
                    <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/30 text-stone-200 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-blue-400 text-xs font-semibold">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>গুগল ইনস্ট্যান্ট উত্তর:</span>
                      </div>
                      <p className="text-xs sm:text-sm leading-relaxed text-stone-200">
                        {searchData.instantAnswer}
                      </p>
                    </div>
                  )}

                  {/* Knowledge Card */}
                  {searchData.knowledgeCard && (
                    <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-2">
                      <h4 className="text-base font-bold text-white">
                        {searchData.knowledgeCard.title}
                      </h4>
                      {searchData.knowledgeCard.subtitle && (
                        <p className="text-xs text-blue-400 font-medium">
                          {searchData.knowledgeCard.subtitle}
                        </p>
                      )}
                      {searchData.knowledgeCard.description && (
                        <p className="text-xs text-stone-300 leading-relaxed">
                          {searchData.knowledgeCard.description}
                        </p>
                      )}
                      {searchData.knowledgeCard.fields && searchData.knowledgeCard.fields.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-800 text-xs">
                          {searchData.knowledgeCard.fields.map((f, i) => (
                            <div key={i}>
                              <span className="text-stone-500">{f.label}: </span>
                              <span className="text-stone-200 font-medium">{f.value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Organic Results */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                      সার্চ রেজাল্ট ({searchData.results.length}):
                    </h5>
                    {searchData.results.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-stone-900/80 hover:bg-stone-900 border border-stone-800/80 hover:border-blue-500/40 transition-all space-y-1"
                      >
                        <div className="text-[11px] text-stone-500 truncate flex items-center gap-1.5">
                          <Globe className="w-3 h-3 text-stone-400" />
                          <span>{item.domain || item.url}</span>
                        </div>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-semibold text-blue-400 hover:text-blue-300 hover:underline block truncate"
                        >
                          {item.title}
                        </a>
                        <p className="text-xs text-stone-300 leading-relaxed line-clamp-2">
                          {item.snippet}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="py-16 text-center space-y-3">
                  <Search className="w-10 h-10 text-stone-600 mx-auto" />
                  <p className="text-sm text-stone-400">যেকোনো বিষয় বা গানের নাম লিখে সার্চ করুন।</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LYRICS & SONG DETAILS */}
          {activeTab === 'lyrics' && (
            <div className="max-w-3xl mx-auto space-y-4">
              {isLyricsLoading ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin mx-auto" />
                  <p className="text-xs text-stone-400">লিরিক্স ও গানের বিস্তারিত তথ্য সংগ্রহ করা হচ্ছে...</p>
                </div>
              ) : lyricsData ? (
                <div className="p-5 rounded-2xl bg-stone-900 border border-purple-500/30 space-y-4">
                  <div className="flex items-center justify-between gap-3 border-b border-stone-800 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Music className="w-4 h-4 text-purple-400" />
                        <span>{lyricsData.title}</span>
                      </h3>
                      {lyricsData.artist && (
                        <p className="text-xs text-purple-300 mt-0.5">শিল্পী: {lyricsData.artist}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(lyricsData.lyricsText)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-750 text-stone-200 text-xs font-medium transition-colors"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>লিরিক্স কপি করুন</span>
                    </button>
                  </div>

                  <div className="prose prose-invert prose-stone max-w-none text-xs sm:text-sm leading-relaxed whitespace-pre-line text-stone-200 font-sans">
                    <Markdown>{lyricsData.lyricsText}</Markdown>
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center space-y-3">
                  <FileText className="w-10 h-10 text-stone-600 mx-auto" />
                  <p className="text-sm text-stone-400">গানের লিরিক্স দেখতে উপরে গানের নাম দিয়ে সার্চ করুন।</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: WEB READER / IFRAME */}
          {activeTab === 'web' && (
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-stone-400">বর্তমান ওয়েব অ্যাড্রেস:</p>
                  <p className="text-sm font-mono text-blue-400 truncate">{activeUrl}</p>
                </div>
                <a
                  href={activeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors shrink-0"
                >
                  <span>ওয়েব পেজটি খুলুন</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="h-[450px] w-full rounded-2xl overflow-hidden border border-stone-800 bg-stone-900">
                <iframe
                  src={activeUrl}
                  title="Web Viewer"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                  className="w-full h-full border-0"
                />
              </div>
            </div>
          )}
        </div>

        {/* Browser Footer */}
        <div className="px-4 py-2 bg-stone-950 border-t border-stone-800 text-[11px] text-stone-500 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span>ইন-অ্যাপ মিনি গুগল ওয়েব ব্রাউজার ও মিউজিক প্লেয়ার</span>
          </div>
          <span className="font-mono text-[10px]">Google Grounded Live Web</span>
        </div>
      </div>
    </div>
  );
};
