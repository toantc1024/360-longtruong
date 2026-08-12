import React, { useEffect, useRef } from "react";
import useVRStore from "@/store/vr.store";
import { useAudioStore } from "@/store/audio.store";
import { Volume2, VolumeX, Play, Pause, Music, Mic } from "lucide-react";
import { Button } from "../ui/button";

export const GlobalAudioManager: React.FC = () => {
  const { currentArea, currentHotspot } = useVRStore();
  const {
    isPlaying,
    isMutedAll,
    speechTimestamps,
    updateSpeechTimestamp,
  } = useAudioStore();

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

  // Headless manager handles audio elements globally
  return null;
};

// Bottom Bar Audio Control Pill matching exact glassmorphism design of toolbar buttons
export const AudioControlPill: React.FC = () => {
  const { currentArea, currentHotspot } = useVRStore();
  const { isPlaying, togglePlayPause, isMutedAll, toggleMuteAll } = useAudioStore();

  const bgMusicUrl = (currentArea as any)?.metadata?.bg_music_url;
  const hotspotAudioUrl = (currentHotspot as any)?.metadata?.audio_url;

  // Don't show pill if no audio is configured
  if (!bgMusicUrl && !hotspotAudioUrl) return null;

  const isSpeechActive = Boolean(currentHotspot && hotspotAudioUrl);

  return (
    <div className="shadow-lg rounded-full glass glass-hover text-white flex items-center gap-2 px-3 py-1 cursor-pointer select-none text-xs sm:text-sm font-medium shrink-0">
      {/* Mute/Unmute toggle */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          toggleMuteAll();
        }}
        className="p-1 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
        title={isMutedAll ? "Bật âm thanh" : "Tắt âm thanh (Mute)"}
      >
        {isMutedAll ? (
          <VolumeX className="w-3.5 h-3.5 text-red-400" />
        ) : (
          <Volume2 className="w-3.5 h-3.5 text-blue-300" />
        )}
      </button>

      {/* Label and status */}
      <div
        className="flex items-center gap-1.5 cursor-pointer max-w-[140px] sm:max-w-[180px] truncate"
        onClick={togglePlayPause}
      >
        {isSpeechActive ? (
          <Mic className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        ) : (
          <Music className="w-3.5 h-3.5 text-blue-400 shrink-0" />
        )}
        <span className="truncate">
          {isSpeechActive ? (currentHotspot?.title || "Thuyết minh") : "Nhạc nền khu vực"}
        </span>
      </div>

      {/* Pause/Play toggle */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          togglePlayPause();
        }}
        className="p-1.5 rounded-full bg-blue-600/80 hover:bg-blue-500 text-white transition-colors cursor-pointer shrink-0 ml-0.5 flex items-center justify-center"
        title={isPlaying ? "Tạm dừng (Pause)" : "Tiếp tục (Play)"}
      >
        {isPlaying ? (
          <Pause className="w-3 h-3" />
        ) : (
          <Play className="w-3 h-3 fill-white" />
        )}
      </button>
    </div>
  );
};

// Top Right Audio Circle Button matching circular top-right toolbar buttons (Search, Map, Chatbot)
export const AudioControlTopRightButton: React.FC = () => {
  const { currentArea, currentHotspot } = useVRStore();
  const { isPlaying, togglePlayPause, isMutedAll } = useAudioStore();

  const bgMusicUrl = (currentArea as any)?.metadata?.bg_music_url;
  const hotspotAudioUrl = (currentHotspot as any)?.metadata?.audio_url;

  if (!bgMusicUrl && !hotspotAudioUrl) return null;

  return (
    <Button
      type="button"
      onClick={togglePlayPause}
      className="w-12 h-12 xl:w-16 xl:h-16 shadow-lg rounded-full glass glass-hover ring-1 ring-black/10 flex items-center justify-center cursor-pointer text-white relative"
      title={isPlaying ? "Tạm dừng Nhạc nền (Pause)" : "Phát Nhạc nền (Play)"}
    >
      {isMutedAll ? (
        <VolumeX className="!size-5 sm:!size-6 xl:!size-8 text-red-400" />
      ) : isPlaying ? (
        <div className="relative flex items-center justify-center">
          <Music className="!size-5 sm:!size-6 xl:!size-8 text-blue-300 animate-pulse" />
          <span className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-0.5">
            <Pause className="w-2.5 h-2.5 fill-white text-white" />
          </span>
        </div>
      ) : (
        <div className="relative flex items-center justify-center">
          <Music className="!size-5 sm:!size-6 xl:!size-8 text-white/50" />
          <span className="absolute -bottom-1 -right-1 bg-emerald-600 rounded-full p-0.5">
            <Play className="w-2.5 h-2.5 fill-white text-white" />
          </span>
        </div>
      )}
    </Button>
  );
};

export default GlobalAudioManager;
