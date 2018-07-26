import * as React from "react";

import "./App.css";

import * as utils from "./utils";

const areSamePosition = (a: IPosition) => (b: IPosition) =>
  a.x === b.x && a.y === b.y;

const getTurn = (b: Block, turns: ITurns) => turns[`${b.y}_${b.x}`];

function safeIndex(x: number) {
  if (x < 0) {
    return BOARD_SIZE / PIXEL_SIZE - 1;
  }
  return x * 10 >= BOARD_SIZE ? 0 : x;
}

function moveBlock(direction: Direction, block: Block): Block {
  const patches = {
    [DIRECTIONS.up]: { y: safeIndex(block.y - 1) },
    [DIRECTIONS.down]: { y: safeIndex(block.y + 1) },
    [DIRECTIONS.right]: { x: safeIndex(block.x + 1) },
    [DIRECTIONS.left]: { x: safeIndex(block.x - 1) }
  };

  return { ...block, ...patches[direction] };
}

const randomFruit = (): Fruit => ({
  value: FRUITS[utils.randomInt(0, FRUITS.length - 1)],
  y: utils.randomInt(0, PIXELS),
  x: utils.randomInt(0, PIXELS)
});

interface IPosition {
  x: number;
  y: number;
}

interface ITurns {
  [index: string]: Direction;
}

type Direction = "up" | "down" | "left" | "right";

type Block = IPosition & {
  direction: Direction;
};

type Fruit = IPosition & { value: string };

interface IState {
  animationFrameId: number;
  snake: Block[];
  turns: ITurns;
  fruit: Fruit;
  isPlaying: boolean;
  isGameOver: boolean;
  score: number;
}

interface IDirections {
  [direction: string]: Direction;
}

const BOARD_SIZE = 330;
const PIXEL_SIZE = 10;
const PIXELS = Math.floor(BOARD_SIZE / PIXEL_SIZE) - 2;
const SPEED = 100;

const DIRECTIONS: IDirections = {
  up: "up",
  right: "right",
  left: "left",
  down: "down"
};

const OPPOSITE_DIRECTION: IDirections = {
  [DIRECTIONS.up]: DIRECTIONS.down,
  [DIRECTIONS.right]: DIRECTIONS.left,
  [DIRECTIONS.left]: DIRECTIONS.right,
  [DIRECTIONS.down]: DIRECTIONS.up
};

const FRUITS = ["🍑", "🍎", "🍏", "🍐", "🍑", "🍓", "🥝"];

const INITIAL_STATE: IState = {
  animationFrameId: 0,
  snake: [{ x: 5, y: 0, direction: "right" }],
  turns: {},
  fruit: randomFruit(),
  isPlaying: false,
  isGameOver: false,
  score: 0
};

export default class App extends React.Component<{}, IState> {
  public state: IState = INITIAL_STATE;

  get ctx() {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;

    return canvas.getContext("2d") as CanvasRenderingContext2D;
  }

  public componentWillMount() {
    document.addEventListener("keyup", this.handleKeyUp);
  }

  public componentWillUnMount() {
    document.removeEventListener("keyup", this.handleKeyUp);
    window.cancelAnimationFrame(this.state.animationFrameId);
  }

  public componentDidMount() {
    this.draw();
  }

  public render() {
    return (
      <div className="game">
        <div
          className="canvas-container"
          style={{ width: BOARD_SIZE, height: BOARD_SIZE }}
        >
          {this.renderOverlay()}

          <canvas id="canvas" width={BOARD_SIZE} height={BOARD_SIZE} />
          <div className="under-canvas">REACT SNAKE 1998</div>

          {this.renderControls()}
        </div>
      </div>
    );
  }

  private renderOverlay() {
    if (!this.state.isGameOver && this.state.isPlaying) {
      return null;
    }

    return (
      <div>
        <div className="canvas-overlay" />
        <div className="overlay-message">
          {!this.state.isGameOver && (
            <img
              src="mstile-150x150.png"
              alt="snake logo"
              className="snake-img"
            />
          )}
          <div>{this.state.isGameOver ? "GAME OVER" : "REACT SNAKE"}</div>
          <div>
            {this.state.isGameOver ? (
              <button className="overlay-button" onClick={this.reset}>
                NEW GAME
              </button>
            ) : (
              <button className="overlay-button" onClick={this.start}>
                START
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  private renderControls() {
    const directions = Object.keys(OPPOSITE_DIRECTION) as Direction[];

    return (
      <div className="controls">
        <div className="score">{this.state.score}</div>
        <div className="directional-container">
          {directions.map(d => (
            <button
              key={d}
              className={`control ${d}`}
              disabled={!this.state.isPlaying}
              onClick={this.handleJoyStickClick(d)}
            >
              <div className="control-text">↑</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  private setDirection(move: Direction) {
    const { direction } = this.state.snake[0];

    const isIllegalMove =
      direction === move || direction === OPPOSITE_DIRECTION[move];

    if (isIllegalMove) {
      return;
    }

    this.setState(({ turns, snake: [head, ...rest] }) => ({
      turns: {
        ...turns,
        [`${head.y}_${head.x}`]: move
      },
      snake: [{ ...head, direction: move }, ...rest]
    }));
  }

  private handleKeyUp = ({ code }: KeyboardEvent) => {
    const prefix = "Arrow";
    const move: Direction | null = code.startsWith(prefix)
      ? (code.replace(prefix, "").toLowerCase() as Direction)
      : null;

    if (move) {
      this.setDirection(move);
    }
  };

  private handleJoyStickClick = (direction: Direction) => (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    this.setDirection(direction);
  };

  private drawPixel = (position: IPosition) =>
    this.ctx.fillRect(
      position.x * PIXEL_SIZE,
      position.y * PIXEL_SIZE,
      PIXEL_SIZE,
      PIXEL_SIZE
    );

  private draw = () => {
    this.clear();

    this.ctx.font = `${PIXEL_SIZE * 1.8}px Segoe UI Emoji`;
    this.ctx.fillText(
      this.state.fruit.value,
      this.state.fruit.x * PIXEL_SIZE - 6, // arbitrary
      this.state.fruit.y * PIXEL_SIZE + 12 // adjustments
    );

    this.state.snake.forEach((p: Block, i: number) => {
      const isHead = !i;

      this.ctx.fillStyle = isHead ? "#011627" : i % 2 ? "#E71D36" : "#FF9F1C";
      this.drawPixel({ y: p.y, x: p.x });
    });
  };

  private play = () =>
    utils.delay(SPEED)(() => {
      if (this.state.isPlaying && !this.state.isGameOver) {
        this.move();
        this.state.animationFrameId = window.requestAnimationFrame(this.play);
      }
    });

  private clear = () => this.ctx.clearRect(0, 0, BOARD_SIZE, BOARD_SIZE);

  private reset = () => this.setState(INITIAL_STATE, this.draw);

  private start = () => this.setState({ isPlaying: true }, this.play);

  private move = () => {
    this.setState(state => {
      const turns = state.turns;

      let fruit = state.fruit;
      let isPlaying = state.isPlaying;
      let isGameOver = state.isGameOver;
      let score = state.score;

      let hasEaten = false;

      const snake = state.snake.map((block, i, xs) => {
        const turn = getTurn(block, state.turns);

        if (i === xs.length - 1) {
          delete turns[`${block.y}_${block.x}`];
        }

        if (!i /* is head */) {
          if (areSamePosition(block)(fruit)) {
            hasEaten = true;
            score++;
            fruit = randomFruit();
          }
          if (xs.slice(1).some(areSamePosition(block))) {
            isPlaying = false;
            isGameOver = true;
            window.cancelAnimationFrame(this.state.animationFrameId);
          }
        }

        const direction = turn || block.direction;

        return moveBlock(direction, { ...block, direction });
      });

      if (hasEaten) {
        const last = snake[snake.length - 1];
        snake.push(moveBlock(OPPOSITE_DIRECTION[last.direction], last));
      }

      return { snake, turns, fruit, isPlaying, isGameOver, score };
    }, this.draw);
  };
}
