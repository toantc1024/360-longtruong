import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { PiSpeakerHighFill, PiSpeakerSlashFill } from "react-icons/pi";

interface AudioControlBlockProps {
  muteAllAudio: () => void;
  unmuteAllAudio: () => void;
  getAudioState: () => Promise<any>;
}

const AudioControlBlock: React.FC<AudioControlBlockProps> = ({
  muteAllAudio,
  unmuteAllAudio,
  getAudioState,
}) => {
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  useEffect(() => {
    const checkAudioState = async () => {
      try {
        const audioState = await getAudioState();
        setIsAudioMuted(!audioState?.isPlaying || false);
      } catch (error) {
        console.error("Failed to get audio state:", error);
      }
    };

    // Check initial audio state
    checkAudioState();

    // Optional: Set up periodic checking (every 5 seconds)
    const interval = setInterval(checkAudioState, 5000);

    return () => clearInterval(interval);
  }, [getAudioState]);

  const handleAudioToggle = async () => {
    try {
      if (isAudioMuted) {
        unmuteAllAudio();
        setIsAudioMuted(false);
      } else {
        muteAllAudio();
        setIsAudioMuted(true);
      }
    } catch (error) {
      console.error("Failed to toggle audio:", error);
    }
  };

  return (
    <Button
      className="w-10 h-10 md:w-12 lg:w-14 md:h-12 lg:h-14 shadow-lg rounded-full glass-hover bg-white/10 flex items-center justify-center cursor-pointer"
      onClick={handleAudioToggle}
      aria-label={isAudioMuted ? "Unmute audio" : "Mute audio"}
    >
      {isAudioMuted ? (
        <PiSpeakerSlashFill className="!size-5 md:!size-7 lg:!size-9" />
      ) : (
        <PiSpeakerHighFill className="!size-5 md:!size-7 lg:!size-9" />
      )}
    </Button>
  );
};

export default AudioControlBlock;
