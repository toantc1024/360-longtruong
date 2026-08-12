import React from "react";
import { Button } from "../ui/button";
import { PiSpeakerHighFill, PiSpeakerSlashFill } from "react-icons/pi";
import { useAudioStore } from "@/store/audio.store";

interface AudioControlBlockProps {
  muteAllAudio?: () => void;
  unmuteAllAudio?: () => void;
  getAudioState?: () => Promise<any>;
}

const AudioControlBlock: React.FC<AudioControlBlockProps> = ({
  muteAllAudio,
  unmuteAllAudio,
}) => {
  const { isMutedAll, toggleMuteAll } = useAudioStore();

  const handleAudioToggle = () => {
    toggleMuteAll();
    if (!isMutedAll) {
      if (muteAllAudio) muteAllAudio();
    } else {
      if (unmuteAllAudio) unmuteAllAudio();
    }
  };

  return (
    <Button
      className="w-10 h-10 md:w-12 lg:w-14 md:h-12 lg:h-14 shadow-lg rounded-full glass-hover bg-white/10 flex items-center justify-center cursor-pointer"
      onClick={handleAudioToggle}
      aria-label={isMutedAll ? "Unmute all audio" : "Mute all audio"}
      title={isMutedAll ? "Bật âm thanh" : "Tắt / Dừng toàn bộ âm thanh"}
    >
      {isMutedAll ? (
        <PiSpeakerSlashFill className="!size-5 md:!size-7 lg:!size-9 text-red-400" />
      ) : (
        <PiSpeakerHighFill className="!size-5 md:!size-7 lg:!size-9 text-white" />
      )}
    </Button>
  );
};

export default AudioControlBlock;

