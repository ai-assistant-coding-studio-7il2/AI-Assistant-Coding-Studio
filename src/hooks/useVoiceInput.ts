import { useState, useRef, useEffect, useCallback } from 'react';

export type VoiceLanguage = 'bn-BD' | 'en-US';

interface UseVoiceInputOptions {
  onTranscriptUpdate?: (transcript: string, isFinal: boolean) => void;
  onSendVoiceCommand?: (finalText: string) => void;
  onClearVoiceCommand?: () => void;
  defaultLang?: VoiceLanguage;
}

export function useVoiceInput({
  onTranscriptUpdate,
  onSendVoiceCommand,
  onClearVoiceCommand,
  defaultLang = 'bn-BD',
}: UseVoiceInputOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState<VoiceLanguage>(defaultLang);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);

  const recognitionRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isManuallyStoppedRef = useRef<boolean>(false);
  const currentAccumulatedTextRef = useRef<string>('');

  // Check speech recognition API support
  const isSupported = typeof window !== 'undefined' && 
    Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  // Setup audio level analyzer
  const setupAudioAnalyzer = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateLevel = () => {
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') return;
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        const normalized = Math.min(100, Math.round((average / 128) * 100));
        setAudioLevel(normalized);
        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };

      updateLevel();
    } catch (err) {
      console.warn('Audio analyzer not supported or blocked:', err);
    }
  };

  const cleanupAudio = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  };

  const stopListening = useCallback(() => {
    isManuallyStoppedRef.current = true;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore if already stopped
      }
    }
    cleanupAudio();
    setIsListening(false);
  }, []);

  const startListening = useCallback(async () => {
    setErrorMessage(null);
    isManuallyStoppedRef.current = false;
    currentAccumulatedTextRef.current = '';

    // Step 1: Request microphone permission via getUserMedia
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        setHasPermission(true);
        setupAudioAnalyzer(stream);
      }
    } catch (err: any) {
      console.error('Microphone access error:', err);
      setHasPermission(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('মাইক্রোফোন এক্সেস অনুমতি দেওয়া হয়নি। অনুগ্রহ করে ব্রাউজার সেটিংসে মাইক্রোফোন পারমিশন Allow করুন।');
      } else {
        setErrorMessage('মাইক্রোফোনে সংযোগ করা যায়নি: ' + (err.message || 'Unknown error'));
      }
      return;
    }

    // Step 2: Initialize Web Speech Recognition
    if (!isSupported) {
      setErrorMessage('আপনার ব্রাউজারে স্পিচ রিকগনিশন (ভয়েস টাইপিং) সরাসরি সমর্থিত নয়। দয়া করে Google Chrome, Edge বা Safari ব্যবহার করুন।');
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMessage(null);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error event:', event);
        if (event.error === 'not-allowed') {
          setErrorMessage('মাইক্রোফোন ব্যবহারের অনুমতি বাতিল করা হয়েছে।');
          stopListening();
        } else if (event.error === 'no-speech') {
          // Keep listening or ignore silence
        } else if (event.error === 'network') {
          setErrorMessage('স্পিচ সার্ভারে নেটওয়ার্ক সমস্যা হয়েছে। আপনার ইন্টারনেট কানেকশন চেক করুন।');
          stopListening();
        }
      };

      recognition.onend = () => {
        // Restart if not manually stopped
        if (!isManuallyStoppedRef.current && recognitionRef.current) {
          try {
            recognition.start();
          } catch (e) {
            setIsListening(false);
            cleanupAudio();
          }
        } else {
          setIsListening(false);
          cleanupAudio();
        }
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcriptChunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptChunk;
          } else {
            interimTranscript += transcriptChunk;
          }
        }

        const combined = (finalTranscript || interimTranscript).trim();

        // Check for voice command triggers:
        // Bengali commands: "পাঠাও", "মেসেজ পাঠাও", "সেন্ড করো"
        // English commands: "send", "send message"
        const lower = combined.toLowerCase();
        const sendCommandsBn = ['পাঠাও', 'সেন্ড করো', 'মেসেজ পাঠাও', 'পাঠিয়ে দাও'];
        const sendCommandsEn = ['send message', 'send'];
        const clearCommands = ['মুছে ফেলো', 'ক্লিয়ার করো', 'clear all', 'clear input'];

        const hasSendCommand = 
          sendCommandsBn.some(cmd => lower.endsWith(cmd) || lower === cmd) ||
          sendCommandsEn.some(cmd => lower.endsWith(cmd) || lower === cmd);

        const hasClearCommand = clearCommands.some(cmd => lower.includes(cmd));

        if (hasClearCommand) {
          if (onClearVoiceCommand) {
            onClearVoiceCommand();
          }
          currentAccumulatedTextRef.current = '';
          return;
        }

        if (hasSendCommand) {
          // Strip out the trigger command word from the message text
          let cleanedText = combined;
          [...sendCommandsBn, ...sendCommandsEn].forEach(cmd => {
            const regex = new RegExp(`\\s*${cmd}\\s*$`, 'i');
            cleanedText = cleanedText.replace(regex, '');
          });

          cleanedText = cleanedText.trim();
          stopListening();
          if (cleanedText && onSendVoiceCommand) {
            onSendVoiceCommand(cleanedText);
          }
          return;
        }

        // Regular text update
        if (combined) {
          currentAccumulatedTextRef.current = combined;
          if (onTranscriptUpdate) {
            onTranscriptUpdate(combined, Boolean(finalTranscript));
          }
        }
      };

      recognition.start();
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      setErrorMessage('ভয়েস রিকগনিশন শুরু করা সম্ভব হয়নি: ' + (err.message || ''));
      setIsListening(false);
      cleanupAudio();
    }
  }, [isSupported, language, onTranscriptUpdate, onSendVoiceCommand, onClearVoiceCommand, stopListening]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      isManuallyStoppedRef.current = true;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
      cleanupAudio();
    };
  }, []);

  return {
    isListening,
    language,
    setLanguage,
    startListening,
    stopListening,
    toggleListening,
    isSupported,
    hasPermission,
    errorMessage,
    setErrorMessage,
    audioLevel,
  };
}
