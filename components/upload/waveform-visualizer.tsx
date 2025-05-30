"use client"

import { useEffect, useRef, useState } from "react"
import { FileAudio } from "lucide-react"

interface WaveformVisualizerProps {
    audioUrl: string
    height?: number
    color?: string
    backgroundColor?: string
    isPlaying?: boolean
}

export default function WaveformVisualizer({
    audioUrl,
    height = 80,
    color = "#8b5cf6",
    backgroundColor = "#27272a",
    isPlaying = false,
}: WaveformVisualizerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const audioContextRef = useRef<AudioContext | null>(null)
    const analyserRef = useRef<AnalyserNode | null>(null)
    const animationRef = useRef<number | null>(null)
    const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null)
    const [waveformBuffer, setWaveformBuffer] = useState<Float32Array | null>(null)

    // Initialize audio context and analyser
    useEffect(() => {
        let isMounted = true;
        
        const initializeAudioContext = async () => {
            try {
                if (!audioContextRef.current) {
                    const newAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                    const newAnalyser = newAudioContext.createAnalyser();
                    newAnalyser.fftSize = 2048;
            newAnalyser.smoothingTimeConstant = 0.1;

                    if (isMounted) {
            audioContextRef.current = newAudioContext;
            analyserRef.current = newAnalyser;
                    } else {
                        // Clean up if component unmounted during initialization
                        newAudioContext.close();
                    }
                }

                // Resume context on user interaction
                const resumeContext = async () => {
                    if (audioContextRef.current?.state === 'suspended') {
                        try {
                            await audioContextRef.current.resume();
                        } catch (e) {
                            console.error("Failed to resume AudioContext:", e);
                        }
                }
                window.removeEventListener('click', resumeContext);
                window.removeEventListener('touchstart', resumeContext);
            };

            window.addEventListener('click', resumeContext);
            window.addEventListener('touchstart', resumeContext);

        } catch (err) {
                console.error("Failed to create audio context:", err);
                if (isMounted) {
                    setError("Your browser doesn't support audio visualization");
                }
        }
        };

        initializeAudioContext();

        return () => {
            isMounted = false;
            
            // Clean up animation
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
            }

            // Clean up audio context
            if (audioContextRef.current) {
                audioContextRef.current.close().catch(e => console.error("Failed to close AudioContext:", e));
                audioContextRef.current = null;
        }

            // Clean up analyser
            analyserRef.current = null;
        };
    }, []); // Empty dependency array to run only on mount/unmount

    // Fetch, decode, and process audio for static waveform
    useEffect(() => {
        let isMounted = true;
        
        const processAudio = async () => {
            if (!audioUrl || !audioContextRef.current || !isMounted) {
            setWaveformBuffer(null);
            setIsLoading(false);
            return;
        }

            setIsLoading(true);
            setError(null);
        setWaveformBuffer(null);

            try {
        // Clean up previous sources/animations
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }
        if (sourceNodeRef.current) {
            sourceNodeRef.current.disconnect();
            sourceNodeRef.current = null;
        }
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
        }

                // Fetch audio file
                const response = await fetch(audioUrl);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const arrayBuffer = await response.arrayBuffer();

                // Decode audio data
                const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);

                if (!isMounted) return; // Check if still mounted

                // Process buffer to get waveform data
                const rawData = audioBuffer.getChannelData(0);
                const samples = 128;
                const blockSize = Math.floor(rawData.length / samples);
                const filteredData = new Float32Array(samples);

                for (let i = 0; i < samples; i++) {
                    let sum = 0;
                    const start = i * blockSize;
                    for (let j = 0; j < blockSize; j++) {
                        sum += Math.abs(rawData[start + j]);
                    }
                    filteredData[i] = sum / blockSize;
                }

                if (isMounted) {
                setWaveformBuffer(filteredData);
                setIsLoading(false);
                }

            } catch (err) {
                console.error("Error processing audio file:", err);
                if (isMounted) {
                setError("Failed to load or process audio file.");
                setIsLoading(false);
                }
            }
        };

        processAudio();

        return () => {
            isMounted = false;
        };
    }, [audioUrl]);

    // Draw the waveform (static or dynamic)
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        const analyser = analyserRef.current;
        const audioContext = audioContextRef.current;

        if (!canvas || !ctx || !audioContext) return;

        // Set canvas dimensions with device pixel ratio for sharp rendering
        const dpr = window.devicePixelRatio || 1;
        canvas.width = canvas.clientWidth * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);

        // Function to draw static waveform from buffer
        const drawStaticWaveform = (buffer: Float32Array) => {
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

            const barCount = buffer.length;
            const barWidth = canvas.clientWidth / barCount;
            const barSpacing = 1; // Adjust spacing as needed
            const scaleFactor = height / 2; // Scale to canvas height

            ctx.fillStyle = color;

            for (let i = 0; i < barCount; i++) {
                const barHeight = buffer[i] * scaleFactor;
                const x = i * barWidth;
                const y = (canvas.clientHeight / dpr - barHeight) / 2;

                ctx.beginPath();
                // Draw simple rectangles for now
                ctx.rect(x, y, barWidth - barSpacing, barHeight);
                ctx.fill();
            }
        };

        // Function to draw dynamic waveform from analyser
        const drawDynamicWaveform = () => {
            if (!analyser || !ctx) return;

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            // Get time domain data for waveform visualizer
            analyser.getByteTimeDomainData(dataArray);

            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

            const sliceWidth = canvas.clientWidth * 1.0 / bufferLength;
            let x = 0;

            ctx.lineWidth = 2;
            ctx.strokeStyle = color;

            ctx.beginPath();

            for(let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const y = v * canvas.clientHeight / 2;

                if(i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }

                x += sliceWidth;
            }

            // Draw a line to the end of the canvas
            ctx.lineTo(canvas.clientWidth, canvas.clientHeight/2);
            ctx.stroke();

            animationRef.current = requestAnimationFrame(drawDynamicWaveform);
        };

        // --- Drawing Logic ---

        // Stop any existing animation frame
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }

        if (isLoading || error) {
            // Clear canvas if loading or error
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            return;
        }

        if (isPlaying && analyser) {
            // Connect audio element to analyser if not already connected
            // Note: This assumes the audio element exists and is managed elsewhere
            // A more robust solution would manage the audio element within this component
            // or receive it as a prop.
            // For simplicity, we'll just start the animation loop.
            drawDynamicWaveform();
        } else if (waveformBuffer) {
            // Draw static waveform from buffer if available and not playing
            drawStaticWaveform(waveformBuffer);
        } else {
            // Draw empty/default state if no buffer and not playing
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // Optionally draw a placeholder or message
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            // Disconnect source if it was connected here
            if (sourceNodeRef.current) {
                sourceNodeRef.current.disconnect();
                sourceNodeRef.current = null;
            }
        };

    }, [isPlaying, waveformBuffer, isLoading, error, height, color, backgroundColor]); // Add isPlaying and waveformBuffer to dependencies

    // Effect to connect audio element to analyser when isPlaying changes
    useEffect(() => {
        const audioContext = audioContextRef.current;
        const analyser = analyserRef.current;
        const audio = audioRef.current; // Assumes audioRef is updated by the parent component or elsewhere

        if (!audioContext || !analyser || !audio) {
            if (sourceNodeRef.current) {
                sourceNodeRef.current.disconnect();
                sourceNodeRef.current = null;
            }
            return;
        }

        if (isPlaying && !sourceNodeRef.current) {
            try {
                const source = audioContext.createMediaElementSource(audio);
                source.connect(analyser);
                // Connect to destination only if the audio element itself isn't already connected
                // This avoids double playback if the audio element is already in the DOM and playing.
                // analyser.connect(audioContext.destination);
                sourceNodeRef.current = source;
                console.log("Audio element connected to analyser");

            } catch (e) {
                console.error("Error connecting audio element to analyser:", e);
                setError("Could not connect audio for visualization.");
            }
        } else if (!isPlaying && sourceNodeRef.current) {
            sourceNodeRef.current.disconnect();
            sourceNodeRef.current = null;
            console.log("Audio element disconnected from analyser");
        }

    }, [isPlaying, audioUrl]); // Depend on isPlaying and audioUrl

    return (
        <div className="w-full relative">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/80 rounded-md">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-violet-500 border-t-transparent"></div>
                </div>
            )}

            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/80 rounded-md">
                    <div className="text-red-500 text-sm text-center">{error}</div>
                </div>
            )}

            {/* Static placeholder if no audioUrl and not loading/error */}
            {!audioUrl && !isLoading && !error && (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/80 rounded-md">
                    <FileAudio className="h-12 w-12 text-zinc-600" />
                </div>
            )}

            <canvas ref={canvasRef} className={`w-full rounded-md ${isLoading || error || !audioUrl ? 'opacity-0' : 'opacity-100'}`} style={{ height: `${height}px` }} />
        </div>
    )
}
