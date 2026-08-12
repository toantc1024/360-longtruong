import React, { useEffect, useRef, useState } from "react";
import useVRStore from "@/store/vr.store";
import { useAudioStore, DEFAULT_BG_MUSIC_URL } from "@/store/audio.store";
import { Volume2, VolumeX, Play, Pause, Music, Mic } from "lucide-react";

export const GlobalAudioManager: React.FC = () => {
  const { currentArea, currentHotspot } = useVRStore();
  const {
    isMutedAll,
    toggleMuteAll,
    speechTimestamps,
    updateSpeechTimestamp,
  } = useAudioStore();

  const [isPlaying, setIsPlaying] = useState(true);

  const bgAudioRef = useRef<HTMLAudioElement | null>(null);
  const speechAudioRef = useRef<HTMLAudioElement | null>(null);
  const activeHotspotIdRef = useRef<number | null>(null);

  // Background Music URL (Area custom or default hardcoded music)
  const bgMusicUrl =
    (currentArea as any)?.metadata?.bg_music_url || DEFAULT_BG_MUSIC_URL;

  // Auto-unlock audio on user's first click anywhere on page
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (bgAudioRef.current && !isMutedAll && isPlaying) {
        bgAudioRef.current.play().catch(console.warn);
      }
      if (speechAudioRef.current && !isMutedAll && isPlaying) {
        speechAudioRef.current.play().catch(console.warn);
      }
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
    };

    window.addEventListener("click", handleFirstInteraction);
    window.addEventListener("touchstart", handleFirstInteraction);

    return () => {
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
    };
  }, [isMutedAll, isPlaying]);

  // Background Music loop setup & switching
  useEffect(() => {
    if (!bgMusicUrl) {
      if (bgAudioRef.current) {
        bgAudioRef.current.pause();
        bgAudioRef.current = null;
      }
      return;
    }

    if (!bgAudioRef.current || bgAudioRef.current.src !== bgMusicUrl) {
      if (bgAudioRef.current) bgAudioRef.current.pause();
      const audio = new Audio(bgMusicUrl);
      audio.loop = true;
      audio.volume = speechAudioRef.current ? 0.15 : 0.8;
      bgAudioRef.current = audio;

      if (!isMutedAll && isPlaying) {
        audio.play().catch(console.warn);
      }
    }
  }, [bgMusicUrl, isMutedAll, isPlaying]);

  // Hotspot Thuyết Minh speech setup & switching
  const hotspotAudioUrl = (currentHotspot as any)?.metadata?.audio_url;
  const hotspotId = currentHotspot?.hotspot_id;

  useEffect(() => {
    if (!hotspotId || !hotspotAudioUrl) {
      if (speechAudioRef.current) {
        if (activeHotspotIdRef.current) {
          updateSpeechTimestamp(
            activeHotspotIdRef.current,
            speechAudioRef.current.currentTime || 0
          );
        }
        speechAudioRef.current.pause();
        speechAudioRef.current = null;
      }
      // Restore background audio volume to normal
      if (bgAudioRef.current && !isMutedAll && isPlaying) {
        bgAudioRef.current.volume = 0.8;
        bgAudioRef.current.play().catch(console.warn);
      }
      return;
    }

    // Save previous speech timestamp if changing hotspot
    if (
      speechAudioRef.current &&
      activeHotspotIdRef.current &&
      activeHotspotIdRef.current !== hotspotId
    ) {
      updateSpeechTimestamp(
        activeHotspotIdRef.current,
        speechAudioRef.current.currentTime || 0
      );
      speechAudioRef.current.pause();
      speechAudioRef.current = null;
    }

    activeHotspotIdRef.current = hotspotId;

    if (!speechAudioRef.current || speechAudioRef.current.src !== hotspotAudioUrl) {
      const speech = new Audio(hotspotAudioUrl);
      speechAudioRef.current = speech;

      // Resume from previous timestamp in session if exists
      const savedTime = speechTimestamps[hotspotId] || 0;
      if (savedTime > 0) {
        speech.currentTime = savedTime;
      }

      // Lower bg audio volume while speech is playing (ducking)
      if (bgAudioRef.current) {
        bgAudioRef.current.volume = 0.15;
      }

      speech.onended = () => {
        if (bgAudioRef.current && !isMutedAll && isPlaying) {
          bgAudioRef.current.volume = 0.8;
        }
      };

      speech.ontimeupdate = () => {
        if (speechAudioRef.current) {
          updateSpeechTimestamp(hotspotId, speechAudioRef.current.currentTime);
        }
      };

      if (!isMutedAll && isPlaying) {
        speech.play().catch(console.warn);
      }
    }
  }, [hotspotId, hotspotAudioUrl, isMutedAll, isPlaying]);

  // Handle Mute All / Play Pause Toggle
  useEffect(() => {
    if (isMutedAll || !isPlaying) {
      if (bgAudioRef.current) bgAudioRef.current.pause();
      if (speechAudioRef.current) speechAudioRef.current.pause();
    } else {
      if (speechAudioRef.current) {
        speechAudioRef.current.play().catch(console.warn);
        if (bgAudioRef.current) bgAudioRef.current.volume = 0.15;
      } else if (bgAudioRef.current) {
        bgAudioRef.current.volume = 0.8;
        bgAudioRef.current.play().catch(console.warn);
      }
    }
  }, [isMutedAll, isPlaying]);

  const togglePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  const isSpeechActive = Boolean(currentHotspot && hotspotAudioUrl);

  return (
    <div className="fixed bottom-4 left-4 z-[9999] flex items-center gap-2 bg-slate-950/90 text-white backdrop-blur-xl border border-slate-800 p-2 px-3 rounded-full shadow-2xl animate-in fade-in slide-in-from-bottom-4 transition-all">
      {/* Dynamic Status Icon & Text */}
      <div className="flex items-center gap-2 text-xs font-semibold pr-2 border-r border-slate-800">
        {isSpeechActive ? (
          <>
            <Mic className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="hidden sm:inline text-emerald-300 max-w-[150px] truncate">
              {currentHotspot?.title || "Thuyết minh"}
            </span>
          </>
        ) : (
          <>
            <Music className="w-4 h-4 text-blue-400 animate-spin" style={{ animationDuration: "6s" }} />
            <span className="hidden sm:inline text-blue-300">Nhạc nền khu vực</span>
          </>
        )}
      </div>

      {/* Play / Pause Toggle Button */}
      <button
        type="button"
        onClick={togglePlayPause}
        className="p-1.5 rounded-full hover:bg-slate-800 text-slate-200 hover:text-white transition-colors cursor-pointer"
        title={isPlaying ? "Tạm dừng âm thanh" : "Tiếp tục phát âm thanh"}
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald-400" />}
      </button>

      {/* Mute / Unmute Toggle Button */}
      <button
        type="button"
        onClick={toggleMuteAll}
        className="p-1.5 rounded-full hover:bg-slate-800 text-slate-200 hover:text-white transition-colors cursor-pointer"
        title={isMutedAll ? "Bật âm thanh" : "Tắt toàn bộ âm thanh (Mute)"}
      >
        {isMutedAll ? (
          <VolumeX className="w-4 h-4 text-red-400" />
        ) : (
          <Volume2 className="w-4 h-4 text-blue-400" />
        )}
      </button>
    </div>
  );
};

export default GlobalAudioManager;
