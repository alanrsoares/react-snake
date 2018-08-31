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

export const OppositeDirections = {
  up: Directions.down,
  right: Directions.left,
  left: Directions.right,
  down: Directions.up
};

export type Direction = keyof typeof Directions;

export type Block = IPosition & {
  direction: Direction;
  isCorner: boolean;
  radius:
    | number
    | {
        tl: number;
        tr: number;
        bl: number;
        br: number;
      };
};

export type Fruit = IPosition & { value: string };

export const hasCollidedWith = (a: IPosition) => (b: IPosition) =>
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
  const { up, down, right, left } = Directions;
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
  value: fruits[utils.randomInt(0, fruits.length - 1)],
  y: utils.randomInt(1, pixels),
  x: utils.randomInt(1, pixels)
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
