import * as React from "react";
import { render } from "react-dom";

import "./index.css";

const delay = (time: number) => (fn: Function) => window.setTimeout(fn, time);

const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const areSamePosition = (a: Position) => (b: Position) =>
  a.x === b.x && a.y === b.y;

const getTurn = (b: Block, state: State) => state.turns[`${b.y}_${b.x}`];

function moveBlock(direction: Direction, block: Block) {
  const safe = (x: number) => {
    if (x < 0) {
      return BOARD_SIZE / PIXEL_SIZE - 1;
    }
    return x * 10 >= BOARD_SIZE ? 0 : x;
  };

  const patches = {
    up: { y: safe(block.y - 1) },
    right: { x: safe(block.x + 1) },
    left: { x: safe(block.x - 1) },
    down: { y: safe(block.y + 1) }
  };

  return { ...block, ...patches[direction] };
}

type Position = {
  x: number;
  y: number;
};

type Direction = "up" | "down" | "left" | "right";

type Block = Position & {
  direction: Direction;
};

interface Props {}

interface State {
  animationFrameId: number;
  snake: Block[];
  turns: { [index: string]: Direction };
  fruit: Position & { value: string };
  isPlaying: boolean;
  isGameOver: boolean;
}

const BOARD_SIZE = 330;
const PIXEL_SIZE = 10;
const PIXELS = Math.floor(BOARD_SIZE / PIXEL_SIZE) - 2;
const SPEED = 100;

const OPPOSITE_DIRECTION: { [direction: string]: Direction } = {
  up: "down",
  right: "left",
  left: "right",
  down: "up"
};

const FRUITS = ["🍑", "🍎", "🍏", "🍐", "🍑", "🍓", "🥝"];

const INITIAL_STATE: State = {
  animationFrameId: 0,
  snake: [{ x: 5, y: 0, direction: "right" }],
  turns: {},
  fruit: {
    value: FRUITS[randomInt(0, FRUITS.length - 1)],
    y: randomInt(0, PIXELS),
    x: randomInt(0, PIXELS)
  },
  isPlaying: false,
  isGameOver: false
};

class App extends React.Component<Props, State> {
  state: State = INITIAL_STATE;

  get ctx() {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;

    return canvas.getContext("2d") as CanvasRenderingContext2D;
  }

  get shouldRenderOverlay() {
    return this.state.isGameOver || !this.state.isPlaying;
  }

  componentWillMount() {
    document.addEventListener("keyup", this.handleKeyUp);
  }

  componentWillUnMount() {
    document.removeEventListener("keyup", this.handleKeyUp);
    window.cancelAnimationFrame(this.state.animationFrameId);
  }

  componentDidMount() {
    this.draw();
  }

  setDirection(move: Direction) {
    const { direction } = this.state.snake[0];

    if (direction !== move && direction !== OPPOSITE_DIRECTION[move]) {
      this.setState(({ turns, snake: [head, ...rest] }) => ({
        turns: {
          ...turns,
          [`${head.y}_${head.x}`]: move
        },
        snake: [{ ...head, direction: move }, ...rest]
      }));
    }
  }

  handleKeyUp = ({ code }: KeyboardEvent) => {
    const prefix = "Arrow";
    const move: Direction | null = code.startsWith(prefix)
      ? (code.replace(prefix, "").toLowerCase() as Direction)
      : null;

    if (move) {
      this.setDirection(move);
    }
  };

  drawPixel = (p: Position) =>
    this.ctx.fillRect(
      p.x * PIXEL_SIZE,
      p.y * PIXEL_SIZE,
      PIXEL_SIZE,
      PIXEL_SIZE
    );

  draw = () => {
    this.clear();

    this.ctx.font = `${PIXEL_SIZE * 1.8}px Segoe UI Emoji`;
    this.ctx.fillText(
      this.state.fruit.value,
      this.state.fruit.x * PIXEL_SIZE - 6,
      this.state.fruit.y * PIXEL_SIZE + 12
    );

    this.state.snake.forEach((p: Block, i: number) => {
      this.ctx.fillStyle = !i ? "#011627" : i % 2 ? "#E71D36" : "#FF9F1C";
      this.drawPixel({ y: p.y, x: p.x });
    });
  };

  clear = () => this.ctx.clearRect(0, 0, BOARD_SIZE, BOARD_SIZE);

  play = () => {
    this.state.animationFrameId = window.requestAnimationFrame(() => {
      delay(SPEED)(() => {
        if (this.state.isPlaying && !this.state.isGameOver) {
          this.move();
        }
        this.play();
      });
    });
  };

  reset = () => {
    this.setState(INITIAL_STATE, this.draw);
  };

  start = () => {
    this.setState(
      {
        isPlaying: true
      },
      this.play
    );
  };

  move = () => {
    this.setState(state => {
      let turns = state.turns;
      let fruit = state.fruit;
      let isPlaying = state.isPlaying;
      let isGameOver = state.isGameOver;

      let hasEaten = false;

      const snake = state.snake.map((p, i, xs) => {
        const turn = getTurn(p, state);

        if (i === xs.length - 1) {
          delete turns[`${p.y}_${p.x}`];
        }

        if (!i) {
          if (areSamePosition(p)(fruit)) {
            hasEaten = true;
            fruit = {
              value: FRUITS[randomInt(0, FRUITS.length - 1)],
              y: randomInt(0, PIXELS),
              x: randomInt(0, PIXELS)
            };
          }
          if (xs.slice(1).some(areSamePosition(p))) {
            isPlaying = false;
            isGameOver = true;
            window.cancelAnimationFrame(this.state.animationFrameId);
          }
        }

        const direction = turn || p.direction;
        const block = { ...p, direction };

        return moveBlock(direction, block);
      });

      if (hasEaten) {
        const last = snake[snake.length - 1];
        snake.push(moveBlock(OPPOSITE_DIRECTION[last.direction], last));
      }

      return { snake, turns, fruit, isPlaying, isGameOver };
    }, this.draw);
  };

  render() {
    return (
      <div
        className="canvas-container"
        style={{
          width: BOARD_SIZE,
          height: BOARD_SIZE
        }}
      >
        {this.shouldRenderOverlay && (
          <div>
            <div className="canvas-overlay" />
            <div className="overlay-message">
              {this.state.isGameOver && <div>GAME OVER</div>}
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
        )}

        <canvas id="canvas" width={BOARD_SIZE} height={BOARD_SIZE} />

        <div className="controls">
          <div className="directional-container">
            {Object.keys(OPPOSITE_DIRECTION).map((d: Direction) => (
              <button
                key={d}
                className={`control ${d}`}
                disabled={!this.state.isPlaying}
                onClick={e => {
                  e.preventDefault();
                  this.setDirection(d);
                }}
              >
                <div className="control-text">↑</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }
}

render(<App />, document.getElementById("root"));