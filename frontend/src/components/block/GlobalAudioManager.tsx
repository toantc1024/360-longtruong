import React, { useEffect, useRef } from "react";
import useVRStore from "@/store/vr.store";
import { useAudioStore } from "@/store/audio.store";
import { Volume2, VolumeX, Play, Pause, Music, Mic } from "lucide-react";
import { Button } from "../ui/button";

// ── Debug helper ──
const TAG = "[AudioMgr]";
const log = (...args: any[]) => console.log(TAG, ...args);

// ── Global singleton audio elements (survive React re-renders) ──
let _bgAudio: HTMLAudioElement | null = null;
let _speechAudio: HTMLAudioElement | null = null;
let _activeSpeechHotspotId: number | null = null;

function getBgAudio(): HTMLAudioElement | null {
  return _bgAudio;
}

function createBgAudio(url: string): HTMLAudioElement {
  if (_bgAudio) {
    _bgAudio.pause();
    _bgAudio.removeAttribute("src");
  }
  const a = new Audio(url);
  a.loop = true;
  a.volume = 0.8;
  _bgAudio = a;
  log("BG audio created:", url);
  return a;
}

function getSpeechAudio(): HTMLAudioElement | null {
  return _speechAudio;
}

function createSpeechAudio(url: string): HTMLAudioElement {
  if (_speechAudio) {
    _speechAudio.pause();
    _speechAudio.removeAttribute("src");
    _speechAudio.onended = null;
    _speechAudio.ontimeupdate = null;
  }
  const a = new Audio(url);
  _speechAudio = a;
  log("Speech audio created:", url);
  return a;
}

function destroySpeechAudio() {
  if (_speechAudio) {
    _speechAudio.pause();
    _speechAudio.onended = null;
    _speechAudio.ontimeupdate = null;
    _speechAudio = null;
    _activeSpeechHotspotId = null;
    log("Speech audio destroyed");
  }
}

async function safePlay(label: string, audio: HTMLAudioElement): Promise<boolean> {
  if (audio.paused) {
    try {
      await audio.play();
      log(`${label} playing OK`);
      return true;
    } catch (e: any) {
      log(`${label} play BLOCKED:`, e?.message || e);
      return false;
    }
  }
  return true; // already playing
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

  // ── 1. Keep a persistent interaction listener that tries to play anything paused ──
  useEffect(() => {
    const tryResumeAll = () => {
      const s = useAudioStore.getState();
      if (s.isMutedAll || !s.isPlaying) return;
      const bg = getBgAudio();
      const sp = getSpeechAudio();
      if (bg && bg.paused) safePlay("BG (interaction)", bg);
      if (sp && sp.paused) safePlay("Speech (interaction)", sp);
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

  // ── 2. BG music: create / switch source ──
  useEffect(() => {
    if (!bgMusicUrl) {
      if (_bgAudio) {
        _bgAudio.pause();
        _bgAudio = null;
        log("BG audio removed (no URL)");
      }
      return;
    }

    // Source changed → recreate
    if (!_bgAudio || _bgAudio.src !== bgMusicUrl) {
      const audio = createBgAudio(bgMusicUrl);
      // Duck if speech is active
      const sp = getSpeechAudio();
      audio.volume = sp && !sp.paused ? 0.15 : 0.8;
    }
  }, [bgMusicUrl]);

  // ── 3. BG music: play / pause based on isPlaying & isMutedAll ──
  useEffect(() => {
    const bg = getBgAudio();
    if (!bg) return;

    if (isMutedAll || !isPlaying) {
      log("BG pausing (muted or paused state)");
      bg.pause();
    } else {
      // Check if speech is active → duck volume
      const sp = getSpeechAudio();
      bg.volume = sp && !sp.paused ? 0.15 : 0.8;
      safePlay("BG", bg);
    }
  }, [isPlaying, isMutedAll]);

  // ── 4. Speech: create / switch / destroy ──
  useEffect(() => {
    // No hotspot audio → destroy any speech
    if (!hotspotId || !hotspotAudioUrl) {
      if (_activeSpeechHotspotId !== null) {
        // Save timestamp before destroying
        const sp = getSpeechAudio();
        if (sp) {
          useAudioStore.getState().updateSpeechTimestamp(
            _activeSpeechHotspotId,
            sp.currentTime || 0
          );
        }
      }
      destroySpeechAudio();
      // Restore BG volume
      const bg = getBgAudio();
      if (bg && !isMutedAllRef.current && isPlayingRef.current) {
        bg.volume = 0.8;
        safePlay("BG (restore after speech)", bg);
      }
      return;
    }

    // Switching to a different hotspot
    if (_activeSpeechHotspotId !== null && _activeSpeechHotspotId !== hotspotId) {
      const sp = getSpeechAudio();
      if (sp) {
        useAudioStore.getState().updateSpeechTimestamp(
          _activeSpeechHotspotId,
          sp.currentTime || 0
        );
      }
      destroySpeechAudio();
    }

    // Create new speech audio
    _activeSpeechHotspotId = hotspotId;
    const speech = createSpeechAudio(hotspotAudioUrl);

    // Resume from saved timestamp
    const savedTime = useAudioStore.getState().speechTimestamps[hotspotId] || 0;
    if (savedTime > 0) {
      speech.currentTime = savedTime;
      log(`Speech resuming from ${savedTime.toFixed(1)}s`);
    }

    // Duck BG
    const bg = getBgAudio();
    if (bg) bg.volume = 0.15;

    // On speech ended → restore BG
    speech.onended = () => {
      log("Speech ended");
      const b = getBgAudio();
      if (b && !isMutedAllRef.current && isPlayingRef.current) {
        b.volume = 0.8;
        safePlay("BG (after speech ended)", b);
      }
      destroySpeechAudio();
      // Notify store
      useAudioStore.getState().pauseCurrentSpeech();
    };

    // Track timestamp
    speech.ontimeupdate = () => {
      useAudioStore.getState().updateSpeechTimestamp(
        hotspotId,
        speech.currentTime
      );
    };

    log(`Speech ready for hotspot ${hotspotId}, isPlaying=${isPlayingRef.current}, isMutedAll=${isMutedAllRef.current}`);

    // Auto-play speech if allowed
    if (!isMutedAllRef.current && isPlayingRef.current) {
      safePlay("Speech", speech);
    }
  }, [hotspotId, hotspotAudioUrl]);

  // ── 5. Speech: play / pause based on isPlaying & isMutedAll ──
  useEffect(() => {
    const sp = getSpeechAudio();
    if (!sp) return;

    if (isMutedAll || !isPlaying) {
      log("Speech pausing (muted or paused state)");
      sp.pause();
    } else {
      const bg = getBgAudio();
      if (bg) bg.volume = 0.15;
      safePlay("Speech", sp);
    }
  }, [isPlaying, isMutedAll]);

  // ── 6. Debug: log current audio state on every render ──
  useEffect(() => {
    log("State changed:", {
      bgUrl: bgMusicUrl?.substring(0, 60),
      speechUrl: hotspotAudioUrl?.substring(0, 60),
      hotspotId,
      isPlaying,
      isMutedAll,
      bgPaused: _bgAudio?.paused,
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
