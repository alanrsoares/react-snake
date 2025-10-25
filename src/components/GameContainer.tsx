import { GameCanvas } from "./GameCanvas";
import { GameOverlay } from "./GameOverlay";
import { ScoreDisplay } from "./ScoreDisplay";
import { DirectionalControls } from "./DirectionalControls";
import type { Block, Direction } from "../types/game";

interface GameContainerProps {
  snake: Block[];
  fruit: { x: number; y: number; value: string };
  score: number;
  bestScore: number;
  isPlaying: boolean;
  isGameOver: boolean;
  animationFrameId: number;
  onTogglePlay: () => void;
  onStart: () => void;
  onReset: () => void;
  onDirectionChange: (direction: Direction) => void;
}

const BOARD_SIZE = 330;

export function GameContainer({
  snake,
  fruit,
  score,
  bestScore,
  isPlaying,
  isGameOver,
  animationFrameId,
  onTogglePlay,
  onStart,
  onReset,
  onDirectionChange,
}: GameContainerProps) {
  return (
    <div
      className="border-4 h-[620px] w-[380px] rounded-br-[15%_10%] rounded-bl-[7.5%_5%]"
      style={{
        borderColor: "var(--gameboy-border)",
        backgroundColor: "var(--gameboy-background)",
        boxShadow: `
          12px 12px 0px 0px #2c2c2c,
          inset 2px 2px 4px rgba(255,255,255,0.1),
          inset -2px -2px 4px rgba(0,0,0,0.2)
        `,
        transform: "translate(-6px, -6px)",
        transition: "all 0.1s ease-out",
      }}
    >
      <div
        className="relative m-5 border inset-ring-2"
        style={{
          width: BOARD_SIZE,
          height: BOARD_SIZE,
          borderColor: "var(--gameboy-border)",
          borderStyle: "inset",
        }}
      >
        <GameOverlay
          isGameOver={isGameOver}
          isPlaying={isPlaying}
          onStart={onStart}
          onReset={onReset}
          animationFrameId={animationFrameId}
        />

        <GameCanvas snake={snake} fruit={fruit} onTogglePlay={onTogglePlay} />

        <div
          className="text-center text-white py-0.5 text-sm"
          style={{ backgroundColor: "var(--gameboy-border)" }}
        >
          REACT SNAKE
        </div>

        <div className="flex justify-between items-center m-3 p-0.5">
          <ScoreDisplay
            score={score}
            bestScore={bestScore}
            isPlaying={isPlaying}
          />

          <DirectionalControls
            isPlaying={isPlaying}
            onDirectionChange={onDirectionChange}
          />
        </div>
      </div>
    </div>
  );
}
