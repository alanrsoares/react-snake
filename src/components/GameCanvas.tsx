import { useCallback, useEffect, useRef } from "react";
import type { Block } from "../types/game";
import { DIRECTIONS } from "../types/game";
import { roundRect } from "../utils/helpers";

interface GameCanvasProps {
  snake: Block[];
  fruit: { x: number; y: number; value: string };
  onTogglePlay: () => void;
}

const BOARD_SIZE = 330;
const PIXEL_SIZE = BOARD_SIZE / 30;
const PIXEL_RADIUS = PIXEL_SIZE / 2;

export function GameCanvas({ snake, fruit, onTogglePlay }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawPixel = useCallback((block: Block, i: number, snake: Block[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { direction } = block;
    const { up, down, left, right } = DIRECTIONS;
    const isHead = i === 0;
    const isLast = i === snake.length - 1;

    if (isHead) {
      return roundRect(
        ctx,
        block.x * PIXEL_SIZE,
        block.y * PIXEL_SIZE,
        PIXEL_SIZE,
        PIXEL_SIZE,
        {
          tl: direction === up || direction === left ? PIXEL_RADIUS : 0,
          tr: direction === up || direction === right ? PIXEL_RADIUS : 0,
          bl: direction === down || direction === left ? PIXEL_RADIUS : 0,
          br: direction === down || direction === right ? PIXEL_RADIUS : 0,
        },
        true,
        false
      );
    }

    if (block.isCorner && typeof block.radius === "object") {
      return roundRect(
        ctx,
        block.x * PIXEL_SIZE,
        block.y * PIXEL_SIZE,
        PIXEL_SIZE,
        PIXEL_SIZE,
        block.radius,
        true,
        false
      );
    }

    if (isLast) {
      return roundRect(
        ctx,
        block.x * PIXEL_SIZE,
        block.y * PIXEL_SIZE,
        PIXEL_SIZE,
        PIXEL_SIZE,
        {
          tl: direction === down || direction === right ? PIXEL_RADIUS : 0,
          tr: direction === down || direction === left ? PIXEL_RADIUS : 0,
          bl: direction === up || direction === right ? PIXEL_RADIUS : 0,
          br: direction === up || direction === left ? PIXEL_RADIUS : 0,
        },
        true,
        false
      );
    }

    ctx.fillRect(
      block.x * PIXEL_SIZE,
      block.y * PIXEL_SIZE,
      PIXEL_SIZE,
      PIXEL_SIZE
    );
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, BOARD_SIZE, BOARD_SIZE);

    snake.forEach((block, i) => {
      const isHead = !i;
      // Use actual color values instead of CSS variables for canvas
      ctx.fillStyle = isHead
        ? "#85bb04" // --snake-body-bright
        : i % 2
        ? "#7b973a" // --snake-body-dark
        : "#a2b043"; // --snake-body-medium
      drawPixel(block, i, snake);
    });

    ctx.font = `${PIXEL_SIZE * 1.4}px Segoe UI Emoji`;
    ctx.fillText(
      fruit.value,
      fruit.x * PIXEL_SIZE - 6,
      fruit.y * PIXEL_SIZE + 12
    );
  }, [snake, fruit, drawPixel]);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <div onClick={onTogglePlay}>
      <canvas
        ref={canvasRef}
        width={BOARD_SIZE}
        height={BOARD_SIZE}
        className="cursor-pointer"
        style={{ backgroundColor: "var(--snake-body-accent)" }}
      />
    </div>
  );
}
