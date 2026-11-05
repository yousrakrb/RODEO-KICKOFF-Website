
import { useRef, useState } from "react";
import "./MusicPlayer.css";

export default function MusicPlayer() {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleMusic = async () => {
    const audio = audioRef.current;

    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Unable to play audio:", error);
      }
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        src="/assets/audio/footloose.mp3"
        loop
        preload="none"
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      />

      <button
        className={`music-player ${isPlaying ? "playing" : ""}`}
        onClick={toggleMusic}
        aria-label={isPlaying ? "Turn music off" : "Turn music on"}
      >
        <span className="music-icon">
          {isPlaying ? "♫" : "♪"}
        </span>

        <span className="music-label">
          {isPlaying ? "MUSIC ON" : "MUSIC OFF"}
        </span>

        <span className="music-indicator">
          {isPlaying ? "Ⅱ" : "▶"}
        </span>
      </button>
    </>
  );
}
