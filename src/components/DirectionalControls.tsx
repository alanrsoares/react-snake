import type { Direction } from "../types/game";
import { DIRECTIONS } from "../types/game";

interface DirectionalControlsProps {
  isPlaying: boolean;
  onDirectionChange: (direction: Direction) => void;
}

export function DirectionalControls({
  isPlaying,
  onDirectionChange,
}: DirectionalControlsProps) {
  const getDirectionArrow = (direction: string) => {
    switch (direction) {
      case "up":
        return "↑";
      case "right":
        return "→";
      case "down":
        return "↓";
      case "left":
        return "←";
      default:
        return "↑";
    }
  };

  const getButtonClasses = (direction: string) => {
    const baseClasses =
      "text-lg border-3 w-[70px] h-[70px] outline-none select-none active:transform absolute";

    switch (direction) {
      case "up":
        return `${baseClasses} border-t border-l rounded-tl-full active:translate-x-[-2px] active:translate-y-[-2px] top-0 left-0`;
      case "right":
        return `${baseClasses} border-t border-r rounded-tr-full active:translate-x-[2px] active:translate-y-[-2px] top-0 right-0`;
      case "down":
        return `${baseClasses} border-b border-r rounded-br-full active:translate-x-[2px] active:translate-y-[2px] bottom-0 right-0`;
      case "left":
        return `${baseClasses} border-b border-l rounded-bl-full active:translate-x-[-2px] active:translate-y-[2px] bottom-0 left-0`;
      default:
        return baseClasses;
    }
  };

  const getButtonStyle = () => ({
    borderColor: 'var(--gameboy-border)',
    backgroundColor: '#dedede'
  });

  return (
    <div className="border-4 rounded-full w-[140px] h-[140px] p-2 transform rotate-45 outline-none relative" style={{ backgroundColor: 'var(--gameboy-border)', borderColor: 'var(--gameboy-border)' }}>
      {Object.keys(DIRECTIONS).map((direction) => (
        <button
          key={direction}
          className={getButtonClasses(direction)}
          style={getButtonStyle()}
          disabled={!isPlaying}
          onClick={(e) => {
            e.preventDefault();
            onDirectionChange(direction as Direction);
          }}
        >
          <div className="text-transparent transform -rotate-45">
            {getDirectionArrow(direction)}
          </div>
        </button>
      ))}
    </div>
  );
}
