import React, { useEffect, useRef } from "react";
import useVRStore from "@/store/vr.store";
import { useAudioStore } from "@/store/audio.store";

export const GlobalAudioManager: React.FC = () => {
  const { currentArea, currentHotspot } = useVRStore();
  const { isMutedAll, speechTimestamps, updateSpeechTimestamp } = useAudioStore();

  const bgAudioRef = useRef<HTMLAudioElement | null>(null);
  const speechAudioRef = useRef<HTMLAudioElement | null>(null);
  const activeHotspotIdRef = useRef<number | null>(null);

  // Background Music loop setup
  const bgMusicUrl = (currentArea as any)?.metadata?.bg_music_url;

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
      audio.volume = 0.8;
      bgAudioRef.current = audio;

      if (!isMutedAll) {
        audio.play().catch(console.warn);
      }
    }
  }, [bgMusicUrl]);

  // Hotspot EdgeTTS Thuyết Minh speech setup & switching
  const hotspotAudioUrl = (currentHotspot as any)?.metadata?.audio_url;
  const hotspotId = currentHotspot?.hotspot_id;

  useEffect(() => {
    if (!hotspotId || !hotspotAudioUrl) {
      if (speechAudioRef.current) {
        // Save timestamp before stopping
        if (activeHotspotIdRef.current) {
          updateSpeechTimestamp(
            activeHotspotIdRef.current,
            speechAudioRef.current.currentTime || 0
          );
        }
        speechAudioRef.current.pause();
        speechAudioRef.current = null;
      }
      // Restore bg audio volume
      if (bgAudioRef.current && !isMutedAll) {
        bgAudioRef.current.volume = 0.8;
        bgAudioRef.current.play().catch(console.warn);
      }
      return;
    }

    // Save previous speech timestamp if changing hotspot
    if (speechAudioRef.current && activeHotspotIdRef.current && activeHotspotIdRef.current !== hotspotId) {
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

      // Lower bg audio volume while speech is playing
      if (bgAudioRef.current) {
        bgAudioRef.current.volume = 0.15;
      }

      speech.onended = () => {
        if (bgAudioRef.current && !isMutedAll) {
          bgAudioRef.current.volume = 0.8;
        }
      };

      speech.ontimeupdate = () => {
        if (speechAudioRef.current) {
          updateSpeechTimestamp(hotspotId, speechAudioRef.current.currentTime);
        }
      };

      if (!isMutedAll) {
        speech.play().catch(console.warn);
      }
    }
  }, [hotspotId, hotspotAudioUrl]);

  // Handle Mute All / Global Audio Toggle
  useEffect(() => {
    if (isMutedAll) {
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
  }, [isMutedAll]);

  return null;
};

export default GlobalAudioManager;
