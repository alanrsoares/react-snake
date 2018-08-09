import * as utils from "./utils";

export interface IPosition {
  x: number;
  y: number;
}

export enum Directions {
  up = "up",
  right = "right",
  left = "left",
  down = "down"
}

export enum OppositeDirections {
  up = Directions.down,
  ight = Directions.left,
  left = Directions.right,
  down = Directions.up
}

export type Direction = keyof typeof Directions;

export type Block = IPosition & {
  direction: Direction;
};

export type Fruit = IPosition & { value: string };

const FRUITS = ["🍑", "🍎", "🍏", "🍐", "🍓", "🥝"];

export const hasCollidedWith = (a: IPosition) => (b: IPosition) =>
  a.x === b.x && a.y === b.y;

export function safeIndex(x: number, sizes: { board: number; pixel: number }) {
  if (x < 0) {
    return sizes.board / sizes.pixel - 1;
  }
  return x * 10 >= sizes.board ? 0 : x;
}

export function moveBlock(
  direction: Direction,
  block: Block,
  sizes: { board: number; pixel: number }
): Block {
  const patches = {
    [Directions.up]: { y: safeIndex(block.y - 1, sizes) },
    [Directions.down]: { y: safeIndex(block.y + 1, sizes) },
    [Directions.right]: { x: safeIndex(block.x + 1, sizes) },
    [Directions.left]: { x: safeIndex(block.x - 1, sizes) }
  };

  return { ...block, ...patches[direction] };
}

export const makeRandomFruit = (pixels: number) => ({
  value: FRUITS[utils.randomInt(0, FRUITS.length - 1)],
  y: utils.randomInt(0, pixels),
  x: utils.randomInt(0, pixels)
});

export const randomFruit = (snake: Block[], pixels: number): Fruit => {
  let fruit = makeRandomFruit(pixels);

  while (snake.some(hasCollidedWith(fruit))) {
    fruit = makeRandomFruit(pixels);
  }

  return fruit;
};

export function decodeDirectionKey(keyCode: string) {
  switch (keyCode) {
    case "KeyW":
    case "ArrowUp":
      return Directions.up;
    case "KeyS":
    case "ArrowDown":
      return Directions.down;
    case "KeyA":
    case "ArrowLeft":
      return Directions.left;
    case "KeyD":
    case "ArrowRight":
      return Directions.right;
    default:
      return null;
  }
}
