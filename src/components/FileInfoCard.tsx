'use client';

import { useState, useEffect } from 'react';
import { FileAudio, Zap, Monitor } from 'lucide-react';

interface Track {
    id: number;
    mp3: string;
    track_title: string;
    track_artist: string;
    length: string;
    poster: string;
}

interface FileInfoCardProps {
    initialTrack?: Track | null;
}

export default function FileInfoCard({ initialTrack }: FileInfoCardProps) {
    const [currentTrack, setCurrentTrack] = useState<Track | null>(initialTrack || null);

    useEffect(() => {
        const handleTrackChange = (event: any) => {
            setCurrentTrack(event.detail);
        };

        window.addEventListener('trackChange', handleTrackChange);
        return () => window.removeEventListener('trackChange', handleTrackChange);
    }, []);

    const getFormat = (url: string) => {
        try {
            const ext = url.split('.').pop()?.split('?')[0].toUpperCase();
            return ext || 'MP3';
        } catch {
            return 'MP3';
        }
    };

    if (!currentTrack) {
        return (
            <div className="bg-gradient-to-br from-pink-50 to-green-50 rounded-[2.5rem] p-8 shadow-sm border border-white/50">
                <h3 className="text-lg font-bold text-slate-800 mb-6 font-primary">File Information</h3>
                <p className="text-sm text-slate-500 italic">Select a track to view details</p>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-pink-50 to-green-50 rounded-[2.5rem] p-8 shadow-sm border border-white/50 animate-in fade-in duration-500">
            <h3 className="text-lg font-bold text-slate-800 mb-6 font-primary">File Information</h3>

            <div className="space-y-6">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/80 p-2.5 flex items-center justify-center shrink-0 shadow-sm transition-transform hover:scale-110">
                        <FileAudio className="w-5 h-5 text-pink-400" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Format</p>
                        <p className="font-bold text-slate-700">{getFormat(currentTrack.mp3)} Lossless</p>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/80 p-2.5 flex items-center justify-center shrink-0 shadow-sm transition-transform hover:scale-110">
                        <Zap className="w-5 h-5 text-yellow-500" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Bitrate</p>
                        <p className="font-bold text-slate-700">320kbps / 48kHz</p>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/80 p-2.5 flex items-center justify-center shrink-0 shadow-sm transition-transform hover:scale-110">
                        <Monitor className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Compatibility</p>
                        <p className="font-bold text-slate-700">All Major DAW / Editors</p>
                    </div>
                </div>

                <div className="pt-4 border-t border-white/20 mt-4">
                    <p className="text-[10px] font-bold text-pink-400 uppercase tracking-widest mb-2">Track Status</p>
                    <p className="text-xs font-medium text-slate-600 leading-relaxed">
                        &quot;{currentTrack.track_title}&quot; is ready for production use.
                    </p>
                </div>
            </div>
        </div>
    );
}
