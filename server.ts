import express from 'express';
import path from 'path';
import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy GoogleGenAI client
function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString(),
  });
});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function formatFriendlyErrorMessage(err: any): string {
  const errStr = typeof err === 'string' ? err : err?.message || JSON.stringify(err);
  if (
    errStr.includes('429') ||
    errStr.includes('quota') ||
    errStr.includes('RESOURCE_EXHAUSTED') ||
    errStr.includes('rate limit')
  ) {
    return 'এআই কোটা সীমা (API Rate Limit / Quota Exceeded 429) সাময়িকভাবে শেষ হয়েছে। অনুরোধের চাপ বেশি থাকায় কিছুক্ষণ পর স্বয়ংক্রিয়ভাবে স্বাভাবিক হবে। অনুগ্রহ করে কয়েক সেকেন্ড অপেক্ষা করে "পুনরায় চেষ্টা করুন" বাটনে ক্লিক করুন অথবা Google Search অফ করে চেষ্টা করুন।';
  }
  if (errStr.includes('503') || errStr.includes('UNAVAILABLE') || errStr.includes('high demand') || errStr.includes('overloaded')) {
    return 'গুগল এআই সার্ভার এই মুহূর্তে অতিরিক্ত চাপে রয়েছে (503 Service Unavailable)। স্বয়ংক্রিয়ভাবে বিকল্প মডেলে চেষ্টা করা হচ্ছে... কয়েক সেকেন্ড পর পুনরায় চেষ্টা করুন।';
  }
  if (errStr.includes('404') || errStr.includes('NOT_FOUND') || errStr.includes('no longer available')) {
    return 'অনুরোধকৃত এআই মডেলটি এই মুহূর্তে প্রস্তুত নয় (404 Not Found)। সিস্টেম স্বয়ংক্রিয়ভাবে বিকল্প সক্রিয় মডেলে সংযোগ করছে। অনুগ্রহ করে আবার চেষ্টা করুন।';
  }
  if (errStr.includes('API_KEY') || errStr.includes('API key not valid')) {
    return 'Gemini API Key পাওয়া যায়নি বা সঠিক নয়। অনুগ্রহ করে সেটিংস থেকে সঠিক API Key যাচাই করুন।';
  }
  return err?.message || 'একটি অপ্রত্যাশিত সমস্যা দেখা দিয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।';
}

const FALLBACK_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-flash-latest',
  'gemini-3.1-flash-lite',
  'gemini-3.1-pro-preview',
];

async function fetchStreamWithResilience(
  ai: any,
  contents: any[],
  systemInstruction: string,
  enableSearch: boolean,
  modelPreference = 'gemini-3.8-flash'
) {
  const modelsToTry = [
    modelPreference,
    ...FALLBACK_MODELS,
  ].filter((v, i, a) => Boolean(v) && a.indexOf(v) === i);

  let searchAvailable = enableSearch;
  let lastError: any = null;

  for (const model of modelsToTry) {
    // If search is requested and currently available, attempt it
    if (searchAvailable) {
      try {
        const stream = await ai.models.generateContentStream({
          model,
          contents,
          config: { systemInstruction, tools: [{ googleSearch: {} }] },
        });
        return { stream, modelUsed: model, hadSearch: true };
      } catch (err: any) {
        lastError = err;
        // Search tool failed (e.g. quota limit on search API). Disable search for subsequent attempts.
        searchAvailable = false;
        const errStr = String(err?.message || err);
        if (
          errStr.includes('429') ||
          errStr.includes('quota') ||
          errStr.includes('RESOURCE_EXHAUSTED') ||
          errStr.includes('503')
        ) {
          await sleep(500);
        }
      }
    }

    // Try standard prompt generation without search tools
    try {
      const stream = await ai.models.generateContentStream({
        model,
        contents,
        config: { systemInstruction },
      });
      return { stream, modelUsed: model, hadSearch: false };
    } catch (err: any) {
      lastError = err;
      const errStr = String(err?.message || err);
      if (
        errStr.includes('429') ||
        errStr.includes('quota') ||
        errStr.includes('RESOURCE_EXHAUSTED') ||
        errStr.includes('503')
      ) {
        await sleep(500);
      }
    }
  }

  throw lastError || new Error('All model attempts failed.');
}

async function fetchContentWithResilience(
  ai: any,
  contents: any[],
  systemInstruction: string,
  enableSearch: boolean,
  modelPreference = 'gemini-3.8-flash'
) {
  const modelsToTry = [
    modelPreference,
    ...FALLBACK_MODELS,
  ].filter((v, i, a) => Boolean(v) && a.indexOf(v) === i);

  let searchAvailable = enableSearch;
  let lastError: any = null;

  for (const model of modelsToTry) {
    if (searchAvailable) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config: { systemInstruction, tools: [{ googleSearch: {} }] },
        });
        return response;
      } catch (err: any) {
        lastError = err;
        searchAvailable = false;
        const errStr = String(err?.message || err);
        if (
          errStr.includes('429') ||
          errStr.includes('quota') ||
          errStr.includes('RESOURCE_EXHAUSTED') ||
          errStr.includes('503')
        ) {
          await sleep(500);
        }
      }
    }

    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: { systemInstruction },
      });
      return response;
    } catch (err: any) {
      lastError = err;
      const errStr = String(err?.message || err);
      if (
        errStr.includes('429') ||
        errStr.includes('quota') ||
        errStr.includes('RESOURCE_EXHAUSTED') ||
        errStr.includes('503')
      ) {
        await sleep(500);
      }
    }
  }

  throw lastError || new Error('All model attempts failed.');
}

// Streaming Chat API with Search Grounding
app.post('/api/chat/stream', async (req, res) => {
  try {
    const {
      messages = [],
      prompt,
      systemInstruction,
      enableSearch = true,
      model = 'gemini-3.8-flash',
    } = req.body;

    if (!prompt && (!messages || messages.length === 0)) {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    const ai = getAIClient();

    // Prepare contents
    // Convert previous messages to Gemini format: role 'user' | 'model', parts: [{ text }]
    const formattedContents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    if (Array.isArray(messages) && messages.length > 0) {
      for (const msg of messages) {
        if (!msg.text || !msg.text.trim()) continue;
        formattedContents.push({
          role: msg.role === 'model' || msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.text }],
        });
      }
    }

    // If a standalone prompt was also passed and not already at the end of messages
    if (prompt && (!formattedContents.length || formattedContents[formattedContents.length - 1].parts[0].text !== prompt)) {
      formattedContents.push({
        role: 'user',
        parts: [{ text: prompt }],
      });
    }

    const defaultSystem = `You are a knowledgeable, thoughtful, and highly capable AI Assistant and Software Engineering Companion (অনুরূপ Claude/Gemini).
You are fluent in both Bengali (বাংলা) and English.
You excel in:
1. Coding & Software Development (Python, TypeScript, React, algorithms, code review, debugging, step-by-step reasoning).
2. Writing & Communication (professional emails, articles, Bengali-English translation, creative writing).
3. Web Research & Link Finding:
   - Finding active websites, tools, documentation, and official resources.
   - Finding songs, music, lyrics, playlists, and artists with YouTube links (e.g., [গানের শিরোনাম - শিল্পী](https://www.youtube.com/watch?v=...)) and official streaming platforms (Spotify, YouTube Music, SoundCloud).
   - Finding YouTube videos, tutorials, educational channels, and playlists. Always provide properly formatted Markdown links [ভিডিও বা গানের নাম](ইউটিউব_বা_ওয়েবসাইট_লিঙ্ক).
4. Learning & Conceptual Explanations (making complex topics easy to understand, interviews, system design).
5. Analysis, Research & Google Search verification (providing factual, up-to-date information with citations).
6. File generation, interactive tools, and daily engineering advice.

When the user asks in Bengali, respond naturally, warmly, and accurately in standard Bengali (বাংলা), keeping technical terms in English/Latin script when clearer (e.g., API, Backend, React, Hook, State).
When the user asks for songs, music, or YouTube videos, search using Google Search and provide accurate song titles, singer/artist names, album/release year, and direct clickable YouTube / website links.
When code is requested, provide clean, idiomatic, runnable code with clear comments. Format with markdown code blocks.`;

    const effectiveSystemInstruction = systemInstruction ? `${defaultSystem}\n\nSpecific task mode instructions:\n${systemInstruction}` : defaultSystem;

    // Setup headers for Server-Sent Events (SSE)
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    // Stream content with automatic retry and model/search fallbacks
    const { stream: responseStream } = await fetchStreamWithResilience(
      ai,
      formattedContents,
      effectiveSystemInstruction,
      enableSearch,
      model || 'gemini-3.8-flash'
    );

    let accumulatedGrounding: any[] = [];
    let searchQueries: string[] = [];

    try {
      for await (const chunk of responseStream) {
        const textChunk = chunk.text || '';
        
        // Check grounding metadata if available in chunk
        const candidate = chunk.candidates?.[0];
        if (candidate?.groundingMetadata) {
          const metadata = candidate.groundingMetadata;
          if (metadata.groundingChunks) {
            accumulatedGrounding = metadata.groundingChunks;
          }
          if (metadata.webSearchQueries) {
            searchQueries = metadata.webSearchQueries;
          }
        }

        if (textChunk) {
          res.write(`data: ${JSON.stringify({ text: textChunk })}\n\n`);
        }
      }
    } catch (streamIterError: any) {
      console.warn('Error during stream chunk iteration:', streamIterError?.message || streamIterError);
      const friendly = formatFriendlyErrorMessage(streamIterError);
      res.write(`data: ${JSON.stringify({ error: friendly })}\n\n`);
      res.end();
      return;
    }

    // Send final grounding metadata if captured
    if (accumulatedGrounding.length > 0 || searchQueries.length > 0) {
      res.write(`data: ${JSON.stringify({
        done: true,
        groundingChunks: accumulatedGrounding,
        searchQueries,
      })}\n\n`);
    } else {
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    }

    res.end();
  } catch (error: any) {
    console.error('Error in /api/chat/stream:', error?.message || error);
    const friendlyErrorMessage = formatFriendlyErrorMessage(error);
    
    // If headers already sent, write error event
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ error: friendlyErrorMessage })}\n\n`);
      res.end();
    } else {
      res.status(500).json({ error: friendlyErrorMessage });
    }
  }
});

// Non-streaming chat endpoint (fallback/quick queries)
app.post('/api/chat', async (req, res) => {
  try {
    const {
      messages = [],
      prompt,
      systemInstruction,
      enableSearch = true,
      model = 'gemini-3.8-flash',
    } = req.body;

    const ai = getAIClient();

    const formattedContents: Array<{ role: string; parts: Array<{ text: string }> }> = [];
    if (Array.isArray(messages) && messages.length > 0) {
      for (const msg of messages) {
        if (!msg.text || !msg.text.trim()) continue;
        formattedContents.push({
          role: msg.role === 'model' || msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.text }],
        });
      }
    }

    if (prompt && (!formattedContents.length || formattedContents[formattedContents.length - 1].parts[0].text !== prompt)) {
      formattedContents.push({
        role: 'user',
        parts: [{ text: prompt }],
      });
    }

    const defaultSystem = `You are a helpful, brilliant Bengali & English AI Assistant and Coding Companion. Provide thoughtful, well-structured answers with code examples, clear explanations, and accurate facts.`;
    const effectiveSystemInstruction = systemInstruction ? `${defaultSystem}\n\n${systemInstruction}` : defaultSystem;

    const response = await fetchContentWithResilience(
      ai,
      formattedContents,
      effectiveSystemInstruction,
      enableSearch,
      model || 'gemini-3.8-flash'
    );

    const candidate = response.candidates?.[0];
    const groundingChunks = candidate?.groundingMetadata?.groundingChunks || [];
    const searchQueries = candidate?.groundingMetadata?.webSearchQueries || [];

    res.json({
      text: response.text || '',
      groundingChunks,
      searchQueries,
    });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({ error: error?.message || 'Server error occurred.' });
  }
});

// AI Session Title Generation Endpoint
app.post('/api/session/title', async (req, res) => {
  try {
    const { userMessage, assistantMessage, mode = 'general' } = req.body;

    if (!userMessage && !assistantMessage) {
      return res.status(400).json({ error: 'Conversation context is required.' });
    }

    const ai = getAIClient();

    const cleanUser = String(userMessage || '').slice(0, 500).trim();
    const cleanAssistant = String(assistantMessage || '').slice(0, 800).trim();

    const prompt = `You are a concise conversation titling engine.
Generate a short, descriptive, and accurate title (3 to 6 words maximum) for this chat session based on the first user-assistant interaction.

Rules:
1. Length: Exactly 3 to 6 words.
2. Language: If the user's message is written primarily in Bengali (বাংলা), generate the title in natural, fluent Bengali. If written in English, generate in English.
3. Content: Capture the specific topic, problem, or objective (e.g. "পাইথনে ডেটা সর্টিং", "রিয়েক্ট হুকস আর্কিটেকচার", "Tailwind CSS Layout Debugging", "জব অ্যাপ্লিকেশনের কভার লেটার").
4. Format: Return ONLY the title text. Do NOT wrap in quotes. Do NOT add prefixes like "Title:" or "শিরোনাম:". Do NOT add markdown or trailing punctuation like periods or dāri (।).

User message:
"${cleanUser}"

Assistant response:
"${cleanAssistant}"`;

    const response = await fetchContentWithResilience(
      ai,
      [{ role: 'user', parts: [{ text: prompt }] }],
      'You generate clear, concise 3-6 word conversation titles.',
      false, // search disabled for fast, cheap title generation
      'gemini-3.8-flash'
    );

    let generatedTitle = response.text || '';
    // Clean formatting and punctuation
    let cleaned = generatedTitle
      .replace(/^(Title|শিরোনাম|শীর্ষক)\s*[:：-]\s*/i, '')
      .replace(/^["'`“”‘’]+|["'`“”‘’]+$/g, '')
      .replace(/[*_#~]/g, '')
      .replace(/[।.\s]+$/g, '')
      .trim();

    if (!cleaned || cleaned.length > 60) {
      cleaned = cleanUser.length > 30 ? cleanUser.slice(0, 30) + '...' : cleanUser;
    }

    res.json({ title: cleaned });
  } catch (error: any) {
    console.warn('Error in /api/session/title:', error?.message || error);
    const fallback = (req.body?.userMessage || 'নতুন কথোপকথন').slice(0, 30);
    res.json({ title: fallback });
  }
});

// JSON 404 response for any unhandled /api/* endpoints
app.all('/api/*', (req, res) => {
  res.status(404).json({
    error: `API route not found: ${req.method} ${req.path}`,
    status: 404,
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
