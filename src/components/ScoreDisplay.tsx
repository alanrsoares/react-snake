interface ScoreDisplayProps {
  score: number;
  bestScore: number;
  isPlaying: boolean;
}

export function ScoreDisplay({
  score,
  bestScore,
  isPlaying,
}: ScoreDisplayProps) {
  const hasBeatenBestScore = score >= bestScore;

  return (
    <div className="flex flex-col items-center space-y-2">
      {/* Main Score Display */}
      <div
        className="relative px-4 py-3 rounded-lg border-2 shadow-lg"
        style={{
          backgroundColor: isPlaying ? "#85bb04" : "#a2b043",
          borderColor: "#7b973a",
          boxShadow:
            "0 4px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)",
        }}
      >
        <div className="text-center">
          <div
            className="text-2xl font-bold"
            style={{
              color: hasBeatenBestScore ? "#ff5023" : "#ffffff",
              textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
            }}
          >
            {score}
          </div>
          <div
            className="text-xs uppercase tracking-wider"
            style={{ color: "#ffffff" }}
          >
            score
          </div>
        </div>
      </div>

      {/* Best Score Display */}
      <div
        className="px-3 py-2 rounded border"
        style={{
          backgroundColor: hasBeatenBestScore ? "#ff5023" : "#615349",
          borderColor: hasBeatenBestScore ? "#ff5023" : "#7b973a",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <div className="flex items-center space-x-1">
          <span className="text-xs font-medium" style={{ color: "#ffffff" }}>
            best:
          </span>
          <span className="text-sm font-bold" style={{ color: "#ffffff" }}>
            {bestScore}
          </span>
        </div>
      </div>
    </div>
  );
}
