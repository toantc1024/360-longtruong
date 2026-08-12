import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
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

// Monotonically increasing ID to prevent stale effects from acting
let _speechVersion = 0;

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

function destroySpeech() {
  if (_speechAudio) {
    _speechAudio.pause();
    _speechAudio.onended = null;
    _speechAudio.ontimeupdate = null;
    _speechAudio.removeAttribute("src");
    _speechAudio.load(); // Force release
    _speechAudio = null;
    _activeSpeechHotspotId = null;
    log("Speech destroyed");
  }
}

function saveSpeechTimestamp() {
  if (_speechAudio && _activeSpeechHotspotId !== null) {
    const time = _speechAudio.currentTime || 0;
    useAudioStore.getState().updateSpeechTimestamp(_activeSpeechHotspotId, time);
    log(`Timestamp saved: hotspot ${_activeSpeechHotspotId} @ ${time.toFixed(1)}s`);
  }
}

function stopAllSpeech() {
  saveSpeechTimestamp();
  destroySpeech();
  if (_bgAudio) {
    _bgAudio.volume = BG_VOLUME;
  }
}

// ── Main Headless Manager ──
export const GlobalAudioManager: React.FC = () => {
  const location = useLocation();
  const { currentArea, currentHotspot } = useVRStore();
  const { isPlaying, isMutedAll } = useAudioStore();

  const isPlayingRef = useRef(isPlaying);
  const isMutedAllRef = useRef(isMutedAll);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { isMutedAllRef.current = isMutedAll; }, [isMutedAll]);

  const bgMusicUrl = (currentArea as any)?.metadata?.bg_music_url as string | undefined;
  const hotspotAudioUrl = (currentHotspot as any)?.metadata?.audio_url as string | undefined;
  const hotspotId = currentHotspot?.hotspot_id as number | undefined;

  // ── 1d. In-app navigation: stop speech when user clicks Home or navigates ──
  const navigationVersion = useAudioStore((s) => s.navigationVersion);
  useEffect(() => {
    if (navigationVersion === 0) return; // skip initial mount
    log("Navigation detected (v" + navigationVersion + ") — stopping speech");
    stopAllSpeech();
  }, [navigationVersion]);

  // ── 1. Cleanup on unmount: stop everything ──
  useEffect(() => {
    return () => {
      log("Component unmounting — stopping all audio");
      stopAllSpeech();
      if (_bgAudio) {
        _bgAudio.pause();
      }
    };
  }, []);

  // ── 1b. Route change: stop speech when navigating away from /app ──
  useEffect(() => {
    if (location.pathname !== "/app") {
      log("Navigated away from /app — stopping speech");
      stopAllSpeech();
    }
  }, [location.pathname]);

  // ── 1c. Page unload / tab close: stop speech ──
  useEffect(() => {
    const handleBeforeUnload = () => {
      log("Page unloading — stopping speech");
      stopAllSpeech();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // ── 2. Interaction listener: resume anything paused (browser autoplay unlock) ──
  useEffect(() => {
    const tryResumeAll = () => {
      const s = useAudioStore.getState();
      if (s.isMutedAll || !s.isPlaying) return;
      if (_bgAudio && _bgAudio.paused) safePlay("BG (tap)", _bgAudio);
      if (_speechAudio && _speechAudio.paused) safePlay("Speech (tap)", _speechAudio);
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

  // ── 3. BG music: create when URL appears / changes ──
  useEffect(() => {
    if (!bgMusicUrl) {
      if (_bgAudio) {
        _bgAudio.pause();
        _bgAudio = null;
        log("BG removed (no URL)");
      }
      return;
    }

    if (!_bgAudio || _bgAudio.src !== bgMusicUrl) {
      if (_bgAudio) _bgAudio.pause();
      const a = new Audio(bgMusicUrl);
      a.loop = true;
      a.volume = _speechAudio && !_speechAudio.paused ? BG_DUCKED : BG_VOLUME;
      _bgAudio = a;
      log("BG created:", bgMusicUrl);

      if (!isMutedAllRef.current && isPlayingRef.current) {
        safePlay("BG (auto)", a);
      }
    }
  }, [bgMusicUrl]);

  // ── 4. BG music: play / pause from user toggle ──
  useEffect(() => {
    if (!_bgAudio) return;

    if (isMutedAll || !isPlaying) {
      log("BG ⏸ user pause/mute");
      _bgAudio.pause();
    } else {
      const sp = _speechAudio;
      _bgAudio.volume = sp && !sp.paused ? BG_DUCKED : BG_VOLUME;
      safePlay("BG", _bgAudio);
    }
  }, [isPlaying, isMutedAll]);

  // ── 5. Speech: manage lifecycle with version guard ──
  useEffect(() => {
    const myVersion = ++_speechVersion;

    // ── No speech needed ──
    if (!hotspotId || !hotspotAudioUrl) {
      stopAllSpeech();
      log("BG volume restored (no speech needed)");
      return;
    }

    // ── Same hotspot + same URL → no-op (don't recreate) ──
    if (_activeSpeechHotspotId === hotspotId && _speechAudio && _speechAudio.src === hotspotAudioUrl) {
      log("Speech already active for this hotspot, skipping");
      return;
    }

    // ── Switching: save old + destroy ──
    stopAllSpeech();

    // ── Create new ──
    _activeSpeechHotspotId = hotspotId;
    const speech = new Audio(hotspotAudioUrl);
    _speechAudio = speech;
    log("Speech created:", hotspotAudioUrl, "hotspot:", hotspotId);

    // Resume from saved timestamp
    const savedTime = useAudioStore.getState().speechTimestamps[hotspotId] || 0;
    if (savedTime > 0) {
      speech.currentTime = savedTime;
      log(`Speech resuming from ${savedTime.toFixed(1)}s`);
    }

    // Duck BG
    if (_bgAudio) {
      _bgAudio.volume = BG_DUCKED;
      log("BG ducked to", BG_DUCKED);
    }

    // On speech ended → clear timestamp, restore BG
    speech.onended = () => {
      if (myVersion !== _speechVersion) return;
      log("Speech ended — clearing timestamp, restoring BG");
      useAudioStore.getState().clearSpeechTimestamp(hotspotId);
      if (_bgAudio) {
        _bgAudio.volume = BG_VOLUME;
        log("BG volume restored to", BG_VOLUME);
      }
      _speechAudio = null;
      _activeSpeechHotspotId = null;
      useAudioStore.getState().pauseCurrentSpeech();
    };

    // On error → log and restore BG
    speech.onerror = (e) => {
      if (myVersion !== _speechVersion) return;
      log("Speech error:", e);
      if (_bgAudio) {
        _bgAudio.volume = BG_VOLUME;
      }
      _speechAudio = null;
      _activeSpeechHotspotId = null;
    };

    // Track timestamp continuously
    speech.ontimeupdate = () => {
      if (myVersion !== _speechVersion) return;
      useAudioStore.getState().updateSpeechTimestamp(hotspotId, speech.currentTime);
    };

    log(`Speech ready hotspot=${hotspotId}, isPlaying=${isPlayingRef.current}, isMuted=${isMutedAllRef.current}`);

    // Auto-play speech
    if (!isMutedAllRef.current && isPlayingRef.current) {
      safePlay("Speech", speech);
    }
  }, [hotspotId, hotspotAudioUrl]);

  // ── 6. Speech: play / pause from user toggle ──
  useEffect(() => {
    if (!_speechAudio) return;

    if (isMutedAll || !isPlaying) {
      log("Speech ⏸ user pause/mute");
      _speechAudio.pause();
    } else {
      if (_bgAudio) _bgAudio.volume = BG_DUCKED;
      safePlay("Speech", _speechAudio);
    }
  }, [isPlaying, isMutedAll]);

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
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); toggleMuteAll(); }}
        className="p-1 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
        title={isMutedAll ? "Bật âm thanh" : "Tắt âm thanh"}
      >
        {isMutedAll ? (
          <VolumeX className="w-3.5 h-3.5 text-red-400" />
        ) : (
          <Volume2 className="w-3.5 h-3.5 text-blue-300" />
        )}
      </button>

      <div
        className="flex items-center cursor-pointer max-w-[140px] sm:max-w-[180px] truncate"
        onClick={togglePlayPause}
      >
        <span className="truncate text-white">Âm thanh</span>
      </div>

      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); togglePlayPause(); }}
        className="p-1.5 rounded-full glass text-white transition-colors cursor-pointer shrink-0 ml-0.5 flex items-center justify-center"
        title={isPlaying ? "Tạm dừng" : "Tiếp tục"}
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
      title={isPlaying ? "Tạm dừng âm thanh" : "Phát âm thanh"}
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
