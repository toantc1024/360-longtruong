import React, { useEffect, useRef, useState } from "react";
import useVRStore from "@/store/vr.store";
import { useAudioStore } from "@/store/audio.store";
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

  // Background Music URL (Custom background music uploaded for Area)
  const bgMusicUrl = (currentArea as any)?.metadata?.bg_music_url;

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

  // If no audio is currently configured or available, hide floating controller
  if (!bgMusicUrl && !hotspotAudioUrl) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 bg-slate-950/80 text-white backdrop-blur-2xl border border-slate-800/80 p-2.5 px-4 rounded-full shadow-2xl transition-all hover:border-blue-500/50 hover:shadow-blue-500/10 group">
      {/* Speaker Mute / Unmute Button on Left */}
      <button
        type="button"
        onClick={toggleMuteAll}
        className="p-2 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white transition-colors cursor-pointer shrink-0 border border-slate-800"
        title={isMutedAll ? "Bật loa âm thanh" : "Tắt toàn bộ âm thanh (Mute)"}
      >
        {isMutedAll ? (
          <VolumeX className="w-4 h-4 text-red-400" />
        ) : (
          <Volume2 className="w-4 h-4 text-blue-400 animate-pulse" />
        )}
      </button>

      {/* Audio Status & Title */}
      <div className="flex items-center gap-2 text-xs font-semibold">
        {isSpeechActive ? (
          <>
            <Mic className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-emerald-300 max-w-[130px] sm:max-w-[180px] truncate">
              {currentHotspot?.title || "Thuyết minh"}
            </span>
          </>
        ) : (
          <>
            <Music className="w-3.5 h-3.5 text-blue-400 shrink-0 animate-spin" style={{ animationDuration: "8s" }} />
            <span className="text-blue-200">Nhạc nền khu vực</span>
          </>
        )}
      </div>

      {/* Stop / Continue (Play/Pause) Button on Right */}
      <button
        type="button"
        onClick={togglePlayPause}
        className="p-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer shrink-0 font-bold shadow-md flex items-center justify-center ml-1"
        title={isPlaying ? "Dừng âm thanh (Stop)" : "Tiếp tục phát (Continue)"}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4 fill-white" />
        )}
      </button>
    </div>
  );
};

export default GlobalAudioManager;
