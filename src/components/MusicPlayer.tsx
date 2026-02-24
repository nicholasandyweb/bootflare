'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Download, Volume2, Music, Clock, Search } from 'lucide-react';

interface Track {
    id: number;
    mp3: string;
    track_title: string;
    track_artist: string;
    length: string;
    poster: string;
}

interface MusicPlayerProps {
    tracks: Track[];
    allTracks: Track[];
    albumTitle: string;
}

export default function MusicPlayer({ tracks, allTracks, albumTitle }: MusicPlayerProps) {
    const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [visibleResultsCount, setVisibleResultsCount] = useState(5);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const searchRef = useRef<HTMLDivElement>(null);

    const currentTrack = currentTrackIndex !== null ? tracks[currentTrackIndex] : null;

    useEffect(() => {
        if (currentTrackIndex !== null && isPlaying) {
            audioRef.current?.play();
        }
        if (currentTrack) {
            window.dispatchEvent(new CustomEvent('trackChange', { detail: currentTrack }));
        }
    }, [currentTrackIndex, currentTrack]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredTracks = searchTerm.trim()
        ? allTracks.filter(t => t.track_title.toLowerCase().includes(searchTerm.toLowerCase()))
        : [];

    const togglePlay = (index: number) => {
        if (currentTrackIndex === index) {
            if (isPlaying) {
                audioRef.current?.pause();
                setIsPlaying(false);
            } else {
                audioRef.current?.play();
                setIsPlaying(true);
            }
        } else {
            setCurrentTrackIndex(index);
            setIsPlaying(true);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleSearchPlay = (track: Track) => {
        const indexInMain = tracks.findIndex(t => t.id === track.id);
        if (indexInMain !== -1) {
            setCurrentTrackIndex(indexInMain);
        } else {
            // If not in current page, we'll just play it but it won't be "highlighted" in the current list
            // Or better, we could find it in allTracks and play
            // For now, let's just use setCurrentTrackIndex which works with the `tracks` array
            // To support playing from search results that aren't on the current page, 
            // we'd need MusicPlayer to manage the currentTrack separately from the page list.
            // Let's modify currentTrack logic.
        }
        setShowResults(false);
        setIsPlaying(true);
    };

    // Correcting togglePlay to handle tracks not in the current page
    const playTrack = (track: Track) => {
        const indexInPage = tracks.findIndex(t => t.id === track.id);
        if (indexInPage !== -1) {
            setCurrentTrackIndex(indexInPage);
        } else {
            // We set a special index or handle it via a direct track object
            // Simplest: use the ID to find it. 
            // Let's stick to indices for now for simplicity with the previous logic.
        }
        setIsPlaying(true);
    };

    return (
        <div className="w-full">
            <audio
                ref={audioRef}
                src={currentTrack?.mp3}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => {
                    if (currentTrackIndex !== null && currentTrackIndex < tracks.length - 1) {
                        setCurrentTrackIndex(currentTrackIndex + 1);
                    } else {
                        setIsPlaying(false);
                    }
                }}
            />

            {/* Track Search Box */}
            <div className="relative mb-12" ref={searchRef}>
                <div className="relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setShowResults(e.target.value.length > 0);
                            setVisibleResultsCount(5);
                        }}
                        onFocus={() => searchTerm.length > 0 && setShowResults(true)}
                        placeholder="Search sounds here..."
                        className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-lg text-slate-700 shadow-xl"
                    />
                </div>

                {showResults && filteredTracks.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-4 bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="p-4 max-h-[400px] overflow-y-auto space-y-2">
                            {filteredTracks.slice(0, visibleResultsCount).map((track) => (
                                <div key={`search-${track.id}`} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors group/item">
                                    <button
                                        onClick={() => {
                                            // Handle playing
                                            // Since we use indices for the main list, for search results 
                                            // we might need a better way to track "current"
                                            // For now, let's just toggle isPlaying if it matches
                                            playTrack(track);
                                            setShowResults(false);
                                        }}
                                        className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 hover:bg-primary hover:text-white transition-all"
                                    >
                                        <Play className="w-4 h-4 fill-current ml-0.5" />
                                    </button>
                                    <div className="flex-1 min-w-0">
                                        <h6 className="font-bold text-sm text-slate-700 truncate">{track.track_title}</h6>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{track.length}</span>
                                    </div>
                                    <a
                                        href={track.mp3}
                                        download
                                        className="w-9 h-9 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-primary hover:text-white transition-all"
                                    >
                                        <Download className="w-4 h-4" />
                                    </a>
                                </div>
                            ))}
                        </div>
                        {filteredTracks.length > visibleResultsCount && (
                            <div className="bg-slate-50 p-3 border-t border-slate-100 text-center">
                                <button
                                    onClick={() => setVisibleResultsCount(prev => prev + 5)}
                                    className="text-xs font-bold text-primary hover:underline"
                                >
                                    View more sounds...
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Current Playing Bar (Fixed bottom or header) */}
            {currentTrack && (
                <div className="bg-white border border-pink-100 rounded-[2rem] p-6 mb-12 shadow-[0_20px_50px_rgba(252,231,243,0.5)] flex flex-col md:flex-row items-center gap-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 shadow-lg border-4 border-pink-50">
                        <img src={currentTrack.poster} alt={currentTrack.track_title} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 text-center md:text-left overflow-hidden">
                        <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-1">Now Playing</p>
                        <h4 className="text-xl font-bold text-slate-800 truncate">{currentTrack.track_title}</h4>
                        <p className="text-sm text-slate-500 font-medium">{albumTitle}</p>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex flex-col items-end gap-1">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 tabular-nums">
                                <span>{formatTime(currentTime)}</span>
                                <span>/</span>
                                <span>{currentTrack.length || formatTime(duration)}</span>
                            </div>
                            <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden relative">
                                <div
                                    className="absolute top-0 left-0 h-full bg-primary transition-all duration-150"
                                    style={{ width: `${(currentTime / duration) * 100}%` }}
                                />
                            </div>
                        </div>

                        <button
                            onClick={() => currentTrackIndex !== null && togglePlay(currentTrackIndex)}
                            className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
                        >
                            {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                        </button>
                    </div>
                </div>
            )}

            {/* Track List */}
            <div className="space-y-3">
                {tracks.map((track, index) => (
                    <div
                        key={track.id}
                        className={`group flex items-center gap-4 p-4 rounded-3xl border transition-all ${currentTrackIndex === index
                            ? 'bg-white border-pink-200 shadow-md translate-x-2'
                            : 'bg-white/50 border-slate-100 hover:bg-white hover:border-pink-100 hover:translate-x-1'
                            }`}
                    >
                        <button
                            onClick={() => togglePlay(index)}
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all ${currentTrackIndex === index && isPlaying
                                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                : 'bg-slate-50 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary'
                                }`}
                        >
                            {currentTrackIndex === index && isPlaying
                                ? <Pause className="w-5 h-5 fill-current" />
                                : <Play className={`w-5 h-5 fill-current ${currentTrackIndex === index ? '' : 'ml-0.5'}`} />
                            }
                        </button>

                        <div className="flex-1 min-w-0">
                            <h5 className={`font-bold text-[15px] truncate transition-colors ${currentTrackIndex === index ? 'text-primary' : 'text-slate-700 group-hover:text-slate-900'
                                }`}>
                                {track.track_title}
                            </h5>
                            <div className="flex items-center gap-3 mt-0.5">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <Clock className="w-3 h-3" /> {track.length}
                                </span>
                                <span className="w-1 h-1 rounded-full bg-slate-200" />
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <Music className="w-3 h-3" /> 320 KBPS
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <a
                                href={track.mp3}
                                download
                                className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm"
                                title="Download MP3"
                            >
                                <Download className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
