import { useCallback, useEffect, useRef, useState } from "react";
import type { Block, Direction, GameState } from "../types/game";
import { OPPOSITE_DIRECTIONS } from "../types/game";
import * as gameUtils from "../utils/game";
import { throttle, head, last } from "../utils/helpers";

// Game configuration
const LS_KEY = "react-snake-best-score";
const BOARD_SIZE = 330;
const PIXEL_SIZE = BOARD_SIZE / 30;
const PIXELS = Math.floor(BOARD_SIZE / PIXEL_SIZE) - 2;
const FRUITS = ["🍑", "🍎", "🍏", "🍐", "🍓", "🥝"];
const SNAKE_SPEED = 100; // speed in ms

// Initial snake
const INITIAL_SNAKE: Block[] = [
  { x: 5, y: 1, direction: "right", isCorner: false, radius: 0 },
  { x: 4, y: 1, direction: "right", isCorner: false, radius: 0 },
  { x: 3, y: 1, direction: "right", isCorner: false, radius: 0 },
];

const INITIAL_STATE: GameState = {
  snake: INITIAL_SNAKE,
  moves: ["right"],
  fruit: gameUtils.randomFruit(INITIAL_SNAKE, PIXELS, FRUITS),
  isPlaying: false,
  isGameOver: false,
  score: 0,
  bestScore: JSON.parse(localStorage.getItem(LS_KEY) || "0"),
};

export function useGameLogic() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [activePressedKey, setActivePressedKey] = useState<Direction | null>(null);
  const animationFrameRef = useRef<number>(0);

  const move = useCallback(() => {
    setGameState((state) => {
      const [nextMove, ...remainingMoves] = state.moves;
      const snake = [...state.snake];
      const direction = nextMove || head(state.snake).direction;

      snake.unshift({
        ...gameUtils.moveBlock(direction, head(state.snake), {
          board: BOARD_SIZE,
          pixel: PIXEL_SIZE,
        }),
        direction,
      });
      snake.pop();

      const [headBlock, ...tail] = snake;
      const isCollision = gameUtils.hasCollidedWith(headBlock);

      // Collided with self
      if (tail.some(isCollision)) {
        return {
          ...state,
          snake,
          moves: remainingMoves,
          isPlaying: false,
          isGameOver: true,
        };
      }

      // Collided with fruit
      if (isCollision(state.fruit)) {
        const lastBlock = last(snake);
        snake.push(
          gameUtils.moveBlock(
            OPPOSITE_DIRECTIONS[lastBlock.direction],
            lastBlock,
            {
              board: BOARD_SIZE,
              pixel: PIXEL_SIZE,
            }
          )
        );

        const score = state.score + 1;
        const bestScore = score > state.bestScore ? score : state.bestScore;

        if (score >= bestScore) {
          localStorage.setItem(LS_KEY, JSON.stringify(score));
        }

        return {
          ...state,
          snake,
          moves: remainingMoves,
          score,
          bestScore,
          fruit: gameUtils.randomFruit(snake, PIXELS, FRUITS),
        };
      }

      return { ...state, snake, moves: remainingMoves };
    });
  }, []);

  const setDirection = useCallback((direction: Direction) => {
    setGameState((state) => {
      const move = last(state.moves) || head(state.snake).direction;
      const isIllegalMove =
        move === direction || move === OPPOSITE_DIRECTIONS[direction];

      if (isIllegalMove) {
        return state;
      }

      return { ...state, moves: state.moves.concat(direction) };
    });
  }, []);

  const handleKeyDown = useCallback(
    ({ code }: KeyboardEvent) => {
      const move = gameUtils.decodeDirectionKey(code);
      if (move) {
        setActivePressedKey(move);
      }
    },
    []
  );

  const handleKeyUp = useCallback(
    ({ code }: KeyboardEvent) => {
      const move = gameUtils.decodeDirectionKey(code);
      if (move) {
        setActivePressedKey(null);
      }

      if (code === "Space" && gameState.isPlaying) {
        setGameState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
      } else if (move) {
        setDirection(move);
      }
    },
    [gameState.isPlaying, setDirection]
  );

  const start = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setGameState((prev) => ({ ...prev, isPlaying: true }));
  }, []);

  const reset = useCallback(() => {
    setGameState({
      ...INITIAL_STATE,
      bestScore: JSON.parse(localStorage.getItem(LS_KEY) || "0"),
    });
  }, []);

  const togglePlay = useCallback(() => {
    if (gameState.isGameOver || !animationFrameRef.current) {
      return;
    }
    setGameState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
  }, [gameState.isGameOver]);

  // Throttled functions
  const throttledMove = useRef(throttle(SNAKE_SPEED, move));
  const play = useCallback(() => {
    if (gameState.isPlaying && !gameState.isGameOver) {
      throttledMove.current();
    }
    animationFrameRef.current = requestAnimationFrame(play);
  }, [gameState.isPlaying, gameState.isGameOver]);

  useEffect(() => {
    throttledMove.current = throttle(SNAKE_SPEED, move);
  }, [move]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  useEffect(() => {
    if (gameState.isPlaying) {
      animationFrameRef.current = requestAnimationFrame(play);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState.isPlaying, play]);

  return [
    {
      gameState,
      animationFrameId: animationFrameRef.current,
      activePressedKey,
    },
    {
      setDirection,
      start,
      reset,
      togglePlay,
    },
  ] as const;
}
