import { create } from "zustand";

// Real instrumental ambient background music track
export const DEFAULT_BG_MUSIC_URL =
  "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3";

interface AudioSessionStoreState {
  isPlaying: boolean;
  isMutedAll: boolean;
  bgMusicUrl: string | null;
  currentSpeechUrl: string | null;
  currentHotspotId: number | null;
  speechTimestamps: Record<number, number>; // hotspot_id -> timestamp (sec)
}

interface AudioSessionStoreActions {
  setIsPlaying: (playing: boolean) => void;
  togglePlayPause: () => void;
  setBgMusicUrl: (url: string | null) => void;
  playSpeechForHotspot: (hotspotId: number, audioUrl: string) => void;
  pauseCurrentSpeech: () => void;
  setMuteAll: (muted: boolean) => void;
  toggleMuteAll: () => void;
  updateSpeechTimestamp: (hotspotId: number, time: number) => void;
  clearSpeechTimestamp: (hotspotId: number) => void;
  /** Signal that user is navigating — GlobalAudioManager watches this */
  navigationVersion: number;
  bumpNavigation: () => void;
}

type AudioSessionStore = AudioSessionStoreState & AudioSessionStoreActions;

export const useAudioStore = create<AudioSessionStore>((set) => ({
  isPlaying: true,
  isMutedAll: false,
  bgMusicUrl: null,
  currentSpeechUrl: null,
  currentHotspotId: null,
  speechTimestamps: {},

  setIsPlaying: (playing) => set({ isPlaying: playing }),
  togglePlayPause: () => set((state) => ({ isPlaying: !state.isPlaying })),

  setBgMusicUrl: (url) => set({ bgMusicUrl: url }),

  playSpeechForHotspot: (hotspotId, audioUrl) => {
    set({
      currentHotspotId: hotspotId,
      currentSpeechUrl: audioUrl,
    });
  },

  pauseCurrentSpeech: () => {
    set({ currentSpeechUrl: null });
  },

  setMuteAll: (muted) => set({ isMutedAll: muted }),

  toggleMuteAll: () => set((state) => ({ isMutedAll: !state.isMutedAll })),

  updateSpeechTimestamp: (hotspotId, time) => {
    set((state) => ({
      speechTimestamps: {
        ...state.speechTimestamps,
        [hotspotId]: time,
      },
    }));
  },

  clearSpeechTimestamp: (hotspotId) => {
    set((state) => {
      const next = { ...state.speechTimestamps };
      delete next[hotspotId];
      return { speechTimestamps: next };
    });
  },

  navigationVersion: 0,
  bumpNavigation: () => set((state) => ({ navigationVersion: state.navigationVersion + 1 })),
}));
