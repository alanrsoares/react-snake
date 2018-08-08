import cn from "classnames";
import * as React from "react";

import "./App.css";

import * as utils from "./utils";

const hasCollidedWith = (a: IPosition) => (b: IPosition) =>
  a.x === b.x && a.y === b.y;

function safeIndex(x: number) {
  if (x < 0) {
    return BOARD_SIZE / PIXEL_SIZE - 1;
  }
  return x * 10 >= BOARD_SIZE ? 0 : x;
}

function decodeDirectionKey(keyCode: string) {
  switch (keyCode) {
    case "KeyW":
    case "ArrowUp":
      return DIRECTIONS.up;
    case "KeyS":
    case "ArrowDown":
      return DIRECTIONS.down;
    case "KeyA":
    case "ArrowLeft":
      return DIRECTIONS.left;
    case "KeyD":
    case "ArrowRight":
      return DIRECTIONS.right;
    default:
      return null;
  }
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

function timeElapsed(timeStamp: number) {
  return Date.now() - (timeStamp || Date.now());
}

const makeRandomFruit = () => ({
  value: FRUITS[utils.randomInt(0, FRUITS.length - 1)],
  y: utils.randomInt(0, PIXELS),
  x: utils.randomInt(0, PIXELS)
});

const randomFruit = (snake: Block[]): Fruit => {
  let fruit = makeRandomFruit();

  while (snake.some(hasCollidedWith(fruit))) {
    fruit = makeRandomFruit();
  }

  return fruit;
};

interface IPosition {
  x: number;
  y: number;
}

type Direction = "up" | "down" | "left" | "right";

type Block = IPosition & {
  direction: Direction;
};

type Fruit = IPosition & { value: string };

interface IDirections {
  [direction: string]: Direction;
}

interface IState {
  snake: Block[];
  move: {
    direction: Direction;
    processed: boolean;
  };
  fruit: Fruit;
  isPlaying: boolean;
  isGameOver: boolean;
  score: number;
  bestScore: number;
  animationFrameId: number;
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

const LS_KEY = "react-snake-best-score";

const SNAKE: Block[] = [{ x: 5, y: 0, direction: "right" }];

const INITIAL_STATE: IState = {
  snake: SNAKE,
  move: {
    direction: DIRECTIONS.right,
    processed: false
  },
  fruit: randomFruit(SNAKE),
  isPlaying: false,
  isGameOver: false,
  score: 0,
  bestScore: JSON.parse(localStorage.getItem(LS_KEY) || "0"),
  animationFrameId: 0
};

export default class App extends React.Component<{}, IState> {
  public state: IState = INITIAL_STATE;
  private lastMoved: number | null = null;

  get ctx() {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;

    return canvas.getContext("2d") as CanvasRenderingContext2D;
  }

  public componentWillMount() {
    document.addEventListener("keyup", this.handleKeyUp);
  }

  public componentWillUnMount() {
    document.removeEventListener("keyup", this.handleKeyUp);
    this.stop();
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

          <div onClick={this.togglePlay}>
            <canvas id="canvas" width={BOARD_SIZE} height={BOARD_SIZE} />
          </div>
          <div className="under-canvas">REACT SNAKE 1978</div>

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
                {this.state.animationFrameId ? "RESUME" : "START"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  private renderControls() {
    const directions = Object.keys(DIRECTIONS) as Direction[];
    const hasBeatenBestScore = this.state.score >= this.state.bestScore;

    return (
      <div className="controls">
        <div>
          <div
            className={cn("score", {
              "score--best": hasBeatenBestScore
            })}
            style={{
              background: this.state.isPlaying ? "#2EC4B6" : "#accac7"
            }}
          >
            {this.state.score}
          </div>
          <div
            className={cn("best-score", {
              "best-score--beaten": hasBeatenBestScore
            })}
          >
            <span className="best-score-label">best: </span>
            <span>{this.state.bestScore}</span>
          </div>
        </div>
        <div className="directional-container">
          {directions.map(direction => (
            <button
              key={direction}
              className={`control ${direction}`}
              disabled={!this.state.isPlaying}
              onClick={this.handleJoyStickClick(direction)}
            >
              <div className="control-text">↑</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  private setDirection(moveDirection: Direction) {
    const { move } = this.state;

    const isIllegalMove =
      !move.processed ||
      move.direction === moveDirection ||
      move.direction === OPPOSITE_DIRECTION[moveDirection];

    if (isIllegalMove) {
      return;
    }

    this.setState(
      { move: { direction: moveDirection, processed: false } },
      this.move
    );
  }

  private handleKeyUp = ({ code }: KeyboardEvent) => {
    const move = decodeDirectionKey(code);

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

    this.state.snake.forEach((block, i) => {
      const isHead = !i;

      this.ctx.fillStyle = isHead ? "#011627" : i % 2 ? "#E71D36" : "#FF9F1C";
      this.drawPixel(block);
    });

    this.ctx.font = `${PIXEL_SIZE * 1.8}px Segoe UI Emoji`;
    this.ctx.fillText(
      this.state.fruit.value,
      this.state.fruit.x * PIXEL_SIZE - 6,
      this.state.fruit.y * PIXEL_SIZE + 12
    );
  };

  private play = () => {
    if (this.state.isPlaying && !this.state.isGameOver) {
      this.move();
    }

    this.state.animationFrameId = window.requestAnimationFrame(this.play);
  };

  private togglePlay = () => {
    if (this.state.isGameOver || !this.state.animationFrameId) {
      return;
    }

    this.setState({
      isPlaying: !this.state.isPlaying
    });
  };

  private clear = () => this.ctx.clearRect(0, 0, BOARD_SIZE, BOARD_SIZE);

  private reset = () => {
    this.setState(
      {
        ...INITIAL_STATE,
        bestScore: JSON.parse(localStorage.getItem(LS_KEY) || "0")
      },
      this.draw
    );
  };

  private stop = () => {
    window.cancelAnimationFrame(this.state.animationFrameId);

    this.state.animationFrameId = 0;
  };

  private start = () => {
    if (this.state.animationFrameId) {
      this.stop();
    }

    this.setState({ isPlaying: true }, this.play);
  };

  private move = () => {
    if (this.lastMoved && timeElapsed(this.lastMoved) < SPEED) {
      return;
    }
    this.lastMoved = Date.now();
    this.setState(state => {
      // move snake
      const move = { ...state.move, processed: true };
      const snake = [
        {
          ...moveBlock(state.move.direction, state.snake[0]),
          direction: state.move.direction
        },
        ...state.snake
      ];
      snake.pop();

      const [head, ...tail] = snake;
      const isCollision = hasCollidedWith(head);

      // collided with self
      if (tail.some(isCollision)) {
        this.stop();

        return { ...state, snake, move, isPlaying: false, isGameOver: true };
      }

      // collided with fruit
      if (isCollision(state.fruit)) {
        // add new block to snake's end
        const last = snake[snake.length - 1];
        snake.push(moveBlock(OPPOSITE_DIRECTION[last.direction], last));

        // increment score
        const score = state.score + 1;
        const bestScore = score > state.bestScore ? score : state.bestScore;

        // persist best score to localstorage
        if (score > bestScore) {
          localStorage.setItem(LS_KEY, JSON.stringify(score));
        }

        return {
          ...state,
          snake,
          move,
          score,
          bestScore,
          fruit: randomFruit(snake)
        };
      }

      // just moved
      return { ...state, snake, move };
    }, this.draw);
  };
}
