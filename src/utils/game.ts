import type { Block, Direction, Fruit, Position } from '../types/game';

export const hasCollidedWith = (a: Position) => (b: Position) =>
  a.x === b.x && a.y === b.y;

export function safeIndex(x: number, sizes: { board: number; pixel: number }) {
  if (x < 0) {
    return sizes.board / sizes.pixel - 1;
  }
  return x * sizes.pixel >= sizes.board ? 0 : x;
}

export function moveBlock(
  direction: Direction,
  block: Block,
  sizes: { board: number; pixel: number }
): Block {
  const { up, down, right, left } = {
    up: 'up' as const,
    down: 'down' as const,
    right: 'right' as const,
    left: 'left' as const,
  };
  
  const patches = {
    [up]: { y: safeIndex(block.y - 1, sizes) },
    [down]: { y: safeIndex(block.y + 1, sizes) },
    [right]: { x: safeIndex(block.x + 1, sizes) },
    [left]: { x: safeIndex(block.x - 1, sizes) }
  };

  if (block.direction !== direction) {
    block.isCorner = true;
    block.radius = {
      tl:
        (direction === right && block.direction === up) ||
        (direction === down && block.direction === left)
          ? sizes.pixel / 2
          : 0,
      tr:
        (direction === down && block.direction === right) ||
        (direction === left && block.direction === up)
          ? sizes.pixel / 2
          : 0,
      br:
        (direction === left && block.direction === down) ||
        (direction === up && block.direction === right)
          ? sizes.pixel / 2
          : 0,
      bl:
        (direction === up && block.direction === left) ||
        (direction === right && block.direction === down)
          ? sizes.pixel / 2
          : 0
    };
  }

  return {
    ...block,
    ...patches[direction],
    isCorner: false,
    radius: 0
  };
}

export const makeRandomFruit = (pixels: number, fruits: string[]) => ({
  value: fruits[Math.floor(Math.random() * fruits.length)],
  y: Math.floor(Math.random() * pixels) + 1,
  x: Math.floor(Math.random() * pixels) + 1
});

export const randomFruit = (
  snake: Block[],
  pixels: number,
  fruits: string[]
): Fruit => {
  let fruit = makeRandomFruit(pixels, fruits);

  while (snake.some(hasCollidedWith(fruit))) {
    fruit = makeRandomFruit(pixels, fruits);
  }

  return fruit;
};

export function decodeDirectionKey(keyCode: string): Direction | null {
  switch (keyCode) {
    case 'KeyW':
    case 'ArrowUp':
      return 'up';
    case 'KeyS':
    case 'ArrowDown':
      return 'down';
    case 'KeyA':
    case 'ArrowLeft':
      return 'left';
    case 'KeyD':
    case 'ArrowRight':
      return 'right';
    default:
      return null;
  }
}
