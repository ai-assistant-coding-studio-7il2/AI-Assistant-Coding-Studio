import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface MiniBrowserContextType {
  isOpen: boolean;
  activeUrl: string;
  searchQuery: string;
  activeVideoId?: string;
  activeVideoTitle?: string;
  activeTab: 'search' | 'youtube' | 'web' | 'lyrics';
  setActiveTab: (tab: 'search' | 'youtube' | 'web' | 'lyrics') => void;
  openBrowser: (urlOrQuery?: string, tab?: 'search' | 'youtube' | 'web' | 'lyrics') => void;
  openYouTubeInBrowser: (videoId: string, title?: string, originalUrl?: string) => void;
  closeBrowser: () => void;
  setSearchQuery: (query: string) => void;
  setActiveUrl: (url: string) => void;
}

const MiniBrowserContext = createContext<MiniBrowserContextType | undefined>(undefined);

export const MiniBrowserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeUrl, setActiveUrl] = useState('https://www.google.com');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeVideoId, setActiveVideoId] = useState<string | undefined>(undefined);
  const [activeVideoTitle, setActiveVideoTitle] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'search' | 'youtube' | 'web' | 'lyrics'>('search');

  const openBrowser = useCallback((urlOrQuery?: string, tab: 'search' | 'youtube' | 'web' | 'lyrics' = 'search') => {
    if (urlOrQuery) {
      if (urlOrQuery.startsWith('http://') || urlOrQuery.startsWith('https://')) {
        setActiveUrl(urlOrQuery);
        // Check if it's a youtube url
        const ytMatch = urlOrQuery.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/i);
        if (ytMatch) {
          setActiveVideoId(ytMatch[1]);
          setActiveTab('youtube');
        } else {
          setActiveTab(tab);
        }
      } else {
        setSearchQuery(urlOrQuery);
        setActiveTab('search');
      }
    }
    setIsOpen(true);
  }, []);

  const openYouTubeInBrowser = useCallback((videoId: string, title?: string, originalUrl?: string) => {
    setActiveVideoId(videoId);
    setActiveVideoTitle(title || 'ইউটিউব ভিডিও / গান');
    setActiveUrl(originalUrl || `https://www.youtube.com/watch?v=${videoId}`);
    setSearchQuery(title || '');
    setActiveTab('youtube');
    setIsOpen(true);
  }, []);

  const closeBrowser = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <MiniBrowserContext.Provider
      value={{
        isOpen,
        activeUrl,
        searchQuery,
        activeVideoId,
        activeVideoTitle,
        activeTab,
        setActiveTab,
        openBrowser,
        openYouTubeInBrowser,
        closeBrowser,
        setSearchQuery,
        setActiveUrl,
      }}
    >
      {children}
    </MiniBrowserContext.Provider>
  );
};

export const useMiniBrowser = (): MiniBrowserContextType => {
  const context = useContext(MiniBrowserContext);
  if (!context) {
    throw new Error('useMiniBrowser must be used within a MiniBrowserProvider');
  }
  return context;
};
