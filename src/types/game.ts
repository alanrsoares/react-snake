export interface Position {
  x: number;
  y: number;
}

export type Direction = 'up' | 'right' | 'left' | 'down';

export interface Block extends Position {
  direction: Direction;
  isCorner: boolean;
  radius: number | {
    tl: number;
    tr: number;
    bl: number;
    br: number;
  };
}

export interface Fruit extends Position {
  value: string;
}

export interface GameState {
  snake: Block[];
  moves: Direction[];
  fruit: Fruit;
  isPlaying: boolean;
  isGameOver: boolean;
  score: number;
  bestScore: number;
}

export const DIRECTIONS = {
  up: 'up' as const,
  right: 'right' as const,
  left: 'left' as const,
  down: 'down' as const,
} as const;

export const OPPOSITE_DIRECTIONS: Record<Direction, Direction> = {
  up: 'down',
  right: 'left',
  left: 'right',
  down: 'up',
} as const;
