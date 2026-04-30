"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseWebSpeechOptions {
    defaultRate?: number;
    defaultPitch?: number;
    defaultVolume?: number;
}

export function useWebSpeech(options: UseWebSpeechOptions = {}) {
    const {
        defaultRate = 1.0,
        defaultPitch = 1.0,
        defaultVolume = 1.0
    } = options;

    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
    const [rate, setRate] = useState(defaultRate);
    const [pitch, setPitch] = useState(defaultPitch);
    const [volume, setVolume] = useState(defaultVolume);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isSupported, setIsSupported] = useState(false);

    // Keep track of chunked speech state
    const chunkQueueRef = useRef<string[]>([]);
    const currentChunkIndexRef = useRef<number>(0);
    const isSpeakingChunksRef = useRef<boolean>(false);

    // Load available voices
    useEffect(() => {
        if (!window.speechSynthesis) {
            setIsSupported(false);
            return;
        }

        setIsSupported(true);

        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices()?.filter(v => v.lang === "ja-JP");
            setVoices(availableVoices);

            // Auto-select a Japanese voice if available and none is selected
            if (availableVoices.length > 0) {
                // const japaneseVoice = availableVoices.find(voice =>
                //     voice.lang.startsWith('ja') ||
                //     voice.name.includes('Japanese') ||
                //     voice.name.includes('Kyoko')
                // );
                // const japaneseVoice = availableVoices.filter(voice =>
                //     voice.lang.startsWith('ja') ||
                //     voice.name.includes('Japanese') ||
                //     voice.name.includes('Kyoko')
                // )[11]; // 6 11
                const japaneseVoice =
                    availableVoices.find(voice =>
                        voice.name === "Flo"
                        || voice.name === "Google 日本語"
                        || voice.name === "Kyoko"
                    );
                setSelectedVoice(japaneseVoice || availableVoices[0]);
            }
        };

        // Load voices immediately
        loadVoices();

        // Some browsers load voices asynchronously
        window.speechSynthesis.addEventListener('voiceschanged', loadVoices);

        return () => {
            window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
        };
    }, [selectedVoice]);

    // Track speech synthesis events
    useEffect(() => {
        if (!isSupported) return;

        // Cleanup if component unmounts while speaking
        return () => {
            if (window.speechSynthesis.speaking) {
                window.speechSynthesis.cancel();
                isSpeakingChunksRef.current = false;
            }
        };
    }, [isSupported]);


    // Split text into chunks to handle long passages
    const chunkText = (text: string): string[] => {
        const sentences = text.split(/[。！？\n]/);
        return sentences;
    };

    const speak = useCallback((text: string) => {
        if (!isSupported || !text.trim()) {
            console.warn('Web Speech API not supported or empty text');
            return;
        }

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const chunks = chunkText(text);
        chunkQueueRef.current = chunks;
        currentChunkIndexRef.current = 0;
        isSpeakingChunksRef.current = true;

        const speakChunk = (chunkIndex: number) => {
            if (chunkIndex >= chunks.length || !isSpeakingChunksRef.current) {
                setIsSpeaking(false);
                setIsPaused(false);
                isSpeakingChunksRef.current = false;
                return;
            }

            const utterance = new SpeechSynthesisUtterance(chunks[chunkIndex]);

            // Set voice properties
            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }
            utterance.rate = rate;
            utterance.pitch = pitch;
            utterance.volume = volume;

            // Add event listeners
            utterance.onstart = () => {
                if (chunkIndex === 0) setIsSpeaking(true);
            };

            utterance.onend = () => {
                // Move to next chunk
                currentChunkIndexRef.current++;
                if (currentChunkIndexRef.current < chunks.length && isSpeakingChunksRef.current) {
                    // Small delay between chunks to prevent issues
                    setTimeout(() => speakChunk(currentChunkIndexRef.current), 100);
                } else {
                    setIsSpeaking(false);
                    setIsPaused(false);
                    isSpeakingChunksRef.current = false;
                }
            };

            utterance.onerror = (event) => {
                console.error('Speech synthesis error:', event);
                setIsSpeaking(false);
                setIsPaused(false);
                isSpeakingChunksRef.current = false;
            };

            utterance.onpause = () => setIsPaused(true);
            utterance.onresume = () => setIsPaused(false);

            // Start speaking this chunk
            window.speechSynthesis.speak(utterance);
        };

        // Start speaking from the first chunk
        speakChunk(0);
    }, [isSupported, selectedVoice, rate, pitch, volume]);

    const pause = useCallback(() => {
        if (isSupported && window.speechSynthesis.speaking) {
            window.speechSynthesis.pause();
        }
    }, [isSupported]);

    const resume = useCallback(() => {
        if (isSupported && window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
        }
    }, [isSupported]);

    const cancel = useCallback(() => {
        if (isSupported) {
            window.speechSynthesis.cancel();
            isSpeakingChunksRef.current = false;
            setIsSpeaking(false);
            setIsPaused(false);
        }
    }, [isSupported]);

    return {
        // State
        voices,
        selectedVoice,
        rate,
        pitch,
        volume,
        isSpeaking,
        isPaused,
        isSupported,

        // Actions
        speak,
        pause,
        resume,
        cancel,

        // Setters
        setSelectedVoice,
        setRate,
        setPitch,
        setVolume,
    };
}
