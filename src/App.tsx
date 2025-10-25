import { GameContainer } from "./components/GameContainer";
import { useGameLogic } from "./hooks/useGameLogic";

function App() {
  const {
    gameState,
    animationFrameId,
    setDirection,
    start,
    reset,
    togglePlay,
  } = useGameLogic();

  return (
    <div className="flex justify-center items-center min-h-screen p-4" style={{ backgroundColor: 'var(--gameboy-background)' }}>
      <GameContainer
        snake={gameState.snake}
        fruit={gameState.fruit}
        score={gameState.score}
        bestScore={gameState.bestScore}
        isPlaying={gameState.isPlaying}
        isGameOver={gameState.isGameOver}
        animationFrameId={animationFrameId}
        onTogglePlay={togglePlay}
        onStart={start}
        onReset={reset}
        onDirectionChange={setDirection}
      />
    </div>
  );
}

export default App;
