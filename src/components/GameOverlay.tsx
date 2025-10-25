import snakeSvg from "../assets/snake.svg";

interface GameOverlayProps {
  isGameOver: boolean;
  isPlaying: boolean;
  onStart: () => void;
  onReset: () => void;
  animationFrameId: number;
}

export function GameOverlay({
  isGameOver,
  isPlaying,
  onStart,
  onReset,
  animationFrameId,
}: GameOverlayProps) {
  if (isPlaying && !isGameOver) {
    return null;
  }

  return (
    <div>
      <div
        className="absolute inset-0 opacity-80 flex justify-center items-center"
        style={{ backgroundColor: "var(--gameboy-border)" }}
      />
      <div
        className="absolute inset-0 flex flex-col justify-center items-center opacity-100 text-center text-[30px] [text-shadow:-1px_0_white,0_1px_white,1px_0_white,0_-1px_white]"
        style={{ color: "var(--snake-head)" }}
      >
        {!isGameOver && (
          <div
            className="w-[150px] h-[150px] mb-[-50px] rounded-full flex items-center justify-center animate-fruit-sparkle"
            style={{ backgroundColor: "var(--snake-body-medium)" }}
          >
            <img src={snakeSvg} alt="Snake" className="w-20 h-20" />
          </div>
        )}
        <div className="text-4xl font-bold">
          {isGameOver ? "GAME OVER" : "REACT SNAKE"}
        </div>
        <div className="mt-5">
          {isGameOver ? (
            <button
              className="border-2 px-3 py-2 mt-5 rounded-lg text-lg cursor-pointer outline-none active:translate-y-0.5"
              style={{
                borderColor: "#7b973a",
                backgroundColor: "#a2b043",
                color: "#ffffff",
              }}
              onClick={onReset}
            >
              NEW GAME
            </button>
          ) : (
            <button
              className="border-2 px-3 py-2 mt-5 rounded-lg text-lg cursor-pointer outline-none active:translate-y-0.5"
              style={{
                borderColor: "#7b973a",
                backgroundColor: "#a2b043",
                color: "#ffffff",
              }}
              onClick={onStart}
            >
              {animationFrameId ? "RESUME" : "START"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
