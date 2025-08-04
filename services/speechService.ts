
import { useState, useEffect, useRef, useCallback } from 'react';

const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export const useSpeechRecognition = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [finalTranscript, setFinalTranscript] = useState('');
    const recognitionRef = useRef<any>(null);
    const listeningIntentionRef = useRef(false);

    useEffect(() => {
        if (!SpeechRecognition) {
            console.warn("Speech Recognition API is not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event: any) => {
            let interimTranscript = '';
            let currentFinalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                const transcriptPart = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    currentFinalTranscript += transcriptPart + ' ';
                } else {
                    interimTranscript += transcriptPart;
                }
            }
            setTranscript(interimTranscript);
            if(currentFinalTranscript.trim()){
                 setFinalTranscript(currentFinalTranscript.trim());
            }
        };

        recognition.onend = () => {
            setIsListening(false);
            setTranscript('');
            // If the user still wants to be listening, restart it.
            if (listeningIntentionRef.current) {
                try {
                    recognition.start();
                } catch(e) {
                    console.error("Speech recognition could not restart:", e);
                    listeningIntentionRef.current = false;
                }
            }
        };
        
        recognition.onerror = (event: any) => {
            if (event.error !== 'no-speech') {
                console.error("Speech recognition error:", event.error);
                listeningIntentionRef.current = false; // Stop trying on other errors
            }
        };

        return () => {
            listeningIntentionRef.current = false;
            recognition.stop();
        };
    }, []);

    const startListening = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            listeningIntentionRef.current = true;
            setTranscript('');
            setFinalTranscript('');
            try {
                recognitionRef.current.start();
            } catch(e) {
                console.error("Speech recognition could not start:", e);
                listeningIntentionRef.current = false;
            }
        }
    }, [isListening]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            listeningIntentionRef.current = false;
            recognitionRef.current.stop();
        }
    }, []);

    return { isListening, transcript, finalTranscript, startListening, stopListening };
};
