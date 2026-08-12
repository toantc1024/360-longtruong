import React, { useEffect, useRef } from "react";
import useVRStore from "@/store/vr.store";
import { useAudioStore } from "@/store/audio.store";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";
import { Button } from "../ui/button";

// ── Debug ──
const TAG = "[AudioMgr]";
const log = (...args: any[]) => console.log(TAG, ...args);

// ── Global singleton audio elements ──
let _bgAudio: HTMLAudioElement | null = null;
let _speechAudio: HTMLAudioElement | null = null;
let _activeSpeechHotspotId: number | null = null;

const BG_VOLUME = 0.8;
const BG_DUCKED = 0.05;

async function safePlay(label: string, audio: HTMLAudioElement): Promise<boolean> {
  if (audio.paused) {
    try {
      await audio.play();
      log(`${label} ▶ playing`);
      return true;
    } catch (e: any) {
      log(`${label} ▶ BLOCKED:`, e?.message || e);
      return false;
    }
  }
  return true;
}

// ── Main Headless Manager ──
export const GlobalAudioManager: React.FC = () => {
  const { currentArea, currentHotspot } = useVRStore();
  const { isPlaying, isMutedAll } = useAudioStore();

  const isPlayingRef = useRef(isPlaying);
  const isMutedAllRef = useRef(isMutedAll);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { isMutedAllRef.current = isMutedAll; }, [isMutedAll]);

  const bgMusicUrl = (currentArea as any)?.metadata?.bg_music_url as string | undefined;
  const hotspotAudioUrl = (currentHotspot as any)?.metadata?.audio_url as string | undefined;
  const hotspotId = currentHotspot?.hotspot_id as number | undefined;

  // ── 1. Interaction listener: resume anything paused (browser autoplay unlock) ──
  useEffect(() => {
    const tryResumeAll = () => {
      const s = useAudioStore.getState();
      if (s.isMutedAll || !s.isPlaying) return;
      const bg = _bgAudio;
      const sp = _speechAudio;
      if (bg && bg.paused) safePlay("BG (tap)", bg);
      if (sp && sp.paused) safePlay("Speech (tap)", sp);
    };

    window.addEventListener("click", tryResumeAll);
    window.addEventListener("touchstart", tryResumeAll);
    window.addEventListener("keydown", tryResumeAll);
    return () => {
      window.removeEventListener("click", tryResumeAll);
      window.removeEventListener("touchstart", tryResumeAll);
      window.removeEventListener("keydown", tryResumeAll);
    };
  }, []);

  // ── 2. BG music: create when URL appears / changes, NEVER destroy on hotspot switch ──
  useEffect(() => {
    if (!bgMusicUrl) {
      if (_bgAudio) {
        _bgAudio.pause();
        _bgAudio = null;
        log("BG removed (no URL)");
      }
      return;
    }

    // Only recreate if src actually changed (new area) or first time
    if (!_bgAudio || _bgAudio.src !== bgMusicUrl) {
      if (_bgAudio) {
        _bgAudio.pause();
        _bgAudio.removeAttribute("src");
      }
      const a = new Audio(bgMusicUrl);
      a.loop = true;
      a.volume = _speechAudio && !_speechAudio.paused ? BG_DUCKED : BG_VOLUME;
      _bgAudio = a;
      log("BG created:", bgMusicUrl);

      // Try auto-play (browser may block until interaction)
      if (!isMutedAllRef.current && isPlayingRef.current) {
        safePlay("BG (auto)", a);
      }
    }
  }, [bgMusicUrl]); // Only depends on URL change

  // ── 3. BG music: play / pause from user toggle ──
  useEffect(() => {
    const bg = _bgAudio;
    if (!bg) return;

    if (isMutedAll || !isPlaying) {
      log("BG ⏸ user pause/mute");
      bg.pause();
    } else {
      const sp = _speechAudio;
      bg.volume = sp && !sp.paused ? BG_DUCKED : BG_VOLUME;
      safePlay("BG", bg);
    }
  }, [isPlaying, isMutedAll]);

  // ── 4. Speech: create / switch / auto-play ──
  useEffect(() => {
    // ── No speech needed ──
    if (!hotspotId || !hotspotAudioUrl) {
      if (_activeSpeechHotspotId !== null) {
        // Save timestamp of old speech
        const sp = _speechAudio;
        if (sp) {
          useAudioStore.getState().updateSpeechTimestamp(
            _activeSpeechHotspotId,
            sp.currentTime || 0
          );
          log(`Speech timestamp saved: hotspot ${_activeSpeechHotspotId} @ ${sp.currentTime.toFixed(1)}s`);
        }
      }
      // Destroy speech
      if (_speechAudio) {
        _speechAudio.pause();
        _speechAudio.onended = null;
        _speechAudio.ontimeupdate = null;
        _speechAudio = null;
        _activeSpeechHotspotId = null;
        log("Speech destroyed");
      }
      // Restore BG volume (BG was ducked)
      const bg = _bgAudio;
      if (bg) {
        bg.volume = BG_VOLUME;
        log("BG volume restored to", BG_VOLUME);
      }
      return;
    }

    // ── Switching hotspot: save old speech timestamp ──
    if (_activeSpeechHotspotId !== null && _activeSpeechHotspotId !== hotspotId) {
      const sp = _speechAudio;
      if (sp) {
        useAudioStore.getState().updateSpeechTimestamp(
          _activeSpeechHotspotId,
          sp.currentTime || 0
        );
        log(`Speech timestamp saved: hotspot ${_activeSpeechHotspotId} @ ${sp.currentTime.toFixed(1)}s`);
      }
      // Destroy old speech
      if (_speechAudio) {
        _speechAudio.pause();
        _speechAudio.onended = null;
        _speechAudio.ontimeupdate = null;
        _speechAudio = null;
      }
      _activeSpeechHotspotId = null;
    }

    // ── Create new speech audio ──
    _activeSpeechHotspotId = hotspotId;
    const speech = new Audio(hotspotAudioUrl);
    _speechAudio = speech;
    log("Speech created:", hotspotAudioUrl, "for hotspot:", hotspotId);

    // Resume from saved timestamp
    const savedTime = useAudioStore.getState().speechTimestamps[hotspotId] || 0;
    if (savedTime > 0) {
      speech.currentTime = savedTime;
      log(`Speech resuming from ${savedTime.toFixed(1)}s`);
    }

    // Duck BG volume while speech plays
    const bg = _bgAudio;
    if (bg) {
      bg.volume = BG_DUCKED;
      log("BG ducked to", BG_DUCKED);
    }

    // On speech ended → restore BG volume (BG continues playing)
    speech.onended = () => {
      log("Speech ended");
      const b = _bgAudio;
      if (b) {
        b.volume = BG_VOLUME;
        log("BG volume restored to", BG_VOLUME);
      }
      // Clean up speech ref
      _speechAudio = null;
      _activeSpeechHotspotId = null;
      useAudioStore.getState().pauseCurrentSpeech();
    };

    // Track timestamp
    speech.ontimeupdate = () => {
      if (_speechAudio) {
        useAudioStore.getState().updateSpeechTimestamp(
          hotspotId,
          speech.currentTime
        );
      }
    };

    log(`Speech ready hotspot=${hotspotId}, isPlaying=${isPlayingRef.current}, isMuted=${isMutedAllRef.current}`);

    // Auto-play speech
    if (!isMutedAllRef.current && isPlayingRef.current) {
      safePlay("Speech", speech);
    }
  }, [hotspotId, hotspotAudioUrl]);

  // ── 5. Speech: play / pause from user toggle ──
  useEffect(() => {
    const sp = _speechAudio;
    if (!sp) return;

    if (isMutedAll || !isPlaying) {
      log("Speech ⏸ user pause/mute");
      sp.pause();
    } else {
      if (_bgAudio) _bgAudio.volume = BG_DUCKED;
      safePlay("Speech", sp);
    }
  }, [isPlaying, isMutedAll]);

  // ── 6. Debug: log on every state change ──
  useEffect(() => {
    log("State:", {
      bgUrl: bgMusicUrl?.substring(0, 50),
      speechUrl: hotspotAudioUrl?.substring(0, 50),
      hotspotId,
      isPlaying,
      isMutedAll,
      bgPaused: _bgAudio?.paused,
      bgVolume: _bgAudio?.volume,
      speechPaused: _speechAudio?.paused,
    });
  });

  return null;
};

// ── Bottom Bar Audio Control Pill ──
export const AudioControlPill: React.FC = () => {
  const { currentArea, currentHotspot } = useVRStore();
  const { isPlaying, togglePlayPause, isMutedAll, toggleMuteAll } = useAudioStore();

  const bgMusicUrl = (currentArea as any)?.metadata?.bg_music_url;
  const hotspotAudioUrl = (currentHotspot as any)?.metadata?.audio_url;

  if (!bgMusicUrl && !hotspotAudioUrl) return null;

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

      {/* Label */}
      <div
        className="flex items-center gap-1.5 cursor-pointer max-w-[140px] sm:max-w-[180px] truncate"
        onClick={togglePlayPause}
      >
        <span className="truncate text-white">Âm thanh</span>
      </div>

      {/* Pause/Play toggle */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          togglePlayPause();
        }}
        className="p-1.5 rounded-full glass text-white transition-colors cursor-pointer shrink-0 ml-0.5 flex items-center justify-center"
        title={isPlaying ? "Tạm dừng (Pause)" : "Tiếp tục (Play)"}
      >
        {isPlaying ? (
          <Pause className="w-3 h-3 fill-white" />
        ) : (
          <Play className="w-3 h-3 fill-white" />
        )}
      </button>
    </div>
  );
};

// ── Top Right Audio Circle Button ──
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
      title={isPlaying ? "Tạm dừng âm thanh (Pause)" : "Phát âm thanh (Play)"}
    >
      {isMutedAll ? (
        <VolumeX className="!size-5 sm:!size-6 xl:!size-8 text-red-400" />
      ) : isPlaying ? (
        <Pause className="!size-5 sm:!size-6 xl:!size-8 text-white fill-white" />
      ) : (
        <Play className="!size-5 sm:!size-6 xl:!size-8 text-white fill-white" />
      )}
    </Button>
  );
};

export default GlobalAudioManager;
