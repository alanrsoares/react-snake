import type { Direction } from "../types/game";
import { DIRECTIONS } from "../types/game";

interface DirectionalControlsProps {
  isPlaying: boolean;
  activePressedKey: Direction | null;
  onDirectionChange: (direction: Direction) => void;
}

export function DirectionalControls({
  isPlaying,
  activePressedKey,
  onDirectionChange,
}: DirectionalControlsProps) {
  return (
    <div className="directional-buttons">
      {Object.keys(DIRECTIONS).map((direction) => (
        <button
          key={direction}
          className={`direction-button ${direction} ${
            activePressedKey === direction ? "key-pressed" : ""
          }`}
          disabled={!isPlaying}
          onClick={(e) => {
            e.preventDefault();
            onDirectionChange(direction as Direction);
          }}
        >
          <span className="visually-hidden">{direction}</span>
        </button>
      ))}
    </div>
  );
}
