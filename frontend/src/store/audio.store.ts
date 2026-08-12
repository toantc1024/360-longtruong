import { create } from "zustand";

export const DEFAULT_BG_MUSIC_URL =
  "https://jmeiegtjrrdeubwzgder.supabase.co/storage/v1/object/public/APP_IMAGES/base/audio/c921b03879254c719617a0aecf004069.mp3";

interface AudioSessionStoreState {
  isMutedAll: boolean;
  bgMusicUrl: string | null;
  currentSpeechUrl: string | null;
  currentHotspotId: number | null;
  speechTimestamps: Record<number, number>; // hotspot_id -> timestamp (sec)
}

interface AudioSessionStoreActions {
  setBgMusicUrl: (url: string | null) => void;
  playSpeechForHotspot: (hotspotId: number, audioUrl: string) => void;
  pauseCurrentSpeech: () => void;
  setMuteAll: (muted: boolean) => void;
  toggleMuteAll: () => void;
  updateSpeechTimestamp: (hotspotId: number, time: number) => void;
}

type AudioSessionStore = AudioSessionStoreState & AudioSessionStoreActions;

export const useAudioStore = create<AudioSessionStore>((set) => ({
  isMutedAll: false,
  bgMusicUrl: DEFAULT_BG_MUSIC_URL,
  currentSpeechUrl: null,
  currentHotspotId: null,
  speechTimestamps: {},

  setBgMusicUrl: (url) => set({ bgMusicUrl: url || DEFAULT_BG_MUSIC_URL }),

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
}));
