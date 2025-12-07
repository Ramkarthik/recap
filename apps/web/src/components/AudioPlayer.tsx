import { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX } from 'lucide-react';

interface AudioPlayerProps {
    src: string;
    onEnded?: () => void;
}

export function AudioPlayer({ src, onEnded }: AudioPlayerProps) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => setDuration(audio.duration);
        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        const onEndedHandler = () => {
            setIsPlaying(false);
            if (onEnded) onEnded();
        };

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);
        audio.addEventListener('play', onPlay);
        audio.addEventListener('pause', onPause);
        audio.addEventListener('ended', onEndedHandler);

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);
            audio.removeEventListener('play', onPlay);
            audio.removeEventListener('pause', onPause);
            audio.removeEventListener('ended', onEndedHandler);
        };
    }, [src, onEnded]);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const toggleMute = () => {
        if (audioRef.current) {
            const newMuted = !isMuted;
            audioRef.current.muted = newMuted;
            setIsMuted(newMuted);
        }
    };

    const skip = (seconds: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime += seconds;
        }
    };

    const formatTime = (time: number) => {
        if (isNaN(time)) return "00:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="group flex items-center gap-3 w-full bg-secondary/10 rounded-full px-4 py-2 hover:bg-secondary/20 transition-colors">
            <audio ref={audioRef} src={src} />

            {/* Play/Pause */}
            <button
                onClick={togglePlay}
                className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm"
                aria-label={isPlaying ? "Pause" : "Play"}
            >
                {isPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
            </button>

            {/* Seek Buttons (Hidden on very small screens or low priority) */}
            <div className="flex items-center gap-1">
                <button
                    onClick={() => skip(-10)}
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-background/50 rounded-full transition-colors"
                >
                    <RotateCcw className="w-4 h-4" />
                </button>
                <button
                    onClick={() => skip(10)}
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-background/50 rounded-full transition-colors"
                >
                    <RotateCw className="w-4 h-4" />
                </button>
            </div>

            {/* Progress Bar */}
            <div className="flex-1 flex items-center gap-2 min-w-0">
                <span className="text-xs font-mono text-muted-foreground w-[40px] text-right tabular-nums hidden sm:block">
                    {formatTime(currentTime)}
                </span>

                <div className="relative flex-1 h-8 flex items-center group/slider">
                    <input
                        type="range"
                        min={0}
                        max={duration || 100}
                        value={currentTime}
                        onChange={handleSeek}
                        className="absolute w-full h-1.5 bg-foreground/10 rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125 hover:h-2 transition-all"
                        style={{
                            backgroundSize: `${(currentTime / (duration || 1)) * 100}% 100%`,
                            backgroundImage: `linear-gradient(currentColor, currentColor)`,
                            backgroundRepeat: 'no-repeat',
                            color: 'hsl(var(--primary))'
                        }}
                    />
                </div>

                <span className="text-xs font-mono text-muted-foreground w-[40px] tabular-nums hidden sm:block">
                    {formatTime(duration)}
                </span>
            </div>

            {/* Mute Toggle */}
            <button
                onClick={toggleMute}
                className="flex-shrink-0 p-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
        </div>
    );
}
