import type { FC } from "react";
import { GameContainer } from "./components/GameContainer";
import { useGameLogic } from "./hooks/useGameLogic";

const App: FC = () => {
  const [{ gameState, animationFrameId, activePressedKey }, actions] = useGameLogic();

  return (
    <div
      className="flex justify-center items-center min-h-screen p-4"
      style={{ backgroundColor: "#ececec" }}
    >
      <GameContainer
        snake={gameState.snake}
        fruit={gameState.fruit}
        score={gameState.score}
        bestScore={gameState.bestScore}
        isPlaying={gameState.isPlaying}
        isGameOver={gameState.isGameOver}
        animationFrameId={animationFrameId}
        activePressedKey={activePressedKey}
        onTogglePlay={actions.togglePlay}
        onStart={actions.start}
        onReset={actions.reset}
        onDirectionChange={actions.setDirection}
      />
    </div>
  );
};

export default App;
