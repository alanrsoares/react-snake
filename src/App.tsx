import cn from "classnames";
import * as React from "react";

import "./App.css";

import * as game from "./game";
import * as utils from "./utils";

interface IState {
  snake: game.Block[];
  moves: game.Direction[];
  fruit: game.Fruit;
  isPlaying: boolean;
  isGameOver: boolean;
  score: number;
  bestScore: number;
  animationFrameId: number;
}

// config
const LS_KEY = "react-snake-best-score";
const BOARD_SIZE = 330;
const PIXEL_SIZE = 10;
const PIXELS = Math.floor(BOARD_SIZE / PIXEL_SIZE) - 2;
const FRUITS = ["🍑", "🍎", "🍏", "🍐", "🍓", "🥝"];

const SNAKE_SPEED = 100; // speed in ms
const OPTIMAL_FRAME_RATE = (1 / 60) * 1000; // 60fps

// initial state
const SNAKE: game.Block[] = [
  { x: 5, y: 1, direction: "right", isCorner: false, radius: 0 },
  { x: 4, y: 1, direction: "right", isCorner: false, radius: 0 },
  { x: 3, y: 1, direction: "right", isCorner: false, radius: 0 }
];

const INITIAL_STATE: IState = {
  snake: SNAKE,
  moves: [game.Directions.right],
  fruit: game.randomFruit(SNAKE, PIXELS, FRUITS),
  isPlaying: false,
  isGameOver: false,
  score: 0,
  bestScore: JSON.parse(localStorage.getItem(LS_KEY) || "0"),
  animationFrameId: 0
};

export default class App extends React.Component<{}, IState> {
  public state: IState = INITIAL_STATE;

  get ctx() {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;

    return canvas.getContext("2d") as CanvasRenderingContext2D;
  }

  get isPaused() {
    return !this.state.isPlaying && !this.state.isGameOver;
  }

  constructor(props: {}) {
    super(props);

    this.move = utils.throttle(SNAKE_SPEED, this.move);
    this.draw = utils.throttle(OPTIMAL_FRAME_RATE, this.draw);

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
          <div className="under-canvas">REACT SNAKE 1987</div>

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
    const directions = Object.keys(game.Directions) as game.Direction[];
    const hasBeatenBestScore = this.state.score >= this.state.bestScore;

    return (
      <div className="controls">
        <div>
          <div
            className={cn("score", {
              "score--best": hasBeatenBestScore
            })}
            style={{ background: this.state.isPlaying ? "#2EC4B6" : "#accac7" }}
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

  private setDirection(direction: game.Direction) {
    const move =
      utils.last(this.state.moves) || utils.head(this.state.snake).direction;

    const isIllegalMove =
      move === direction || move === game.OppositeDirections[direction];

    if (isIllegalMove) {
      return;
    }

    this.setState(
      state => ({ moves: state.moves.concat(direction) }),
      this.move
    );
  }

  private handleKeyUp = ({ code }: KeyboardEvent) => {
    if (code === "Space" && this.state.isPlaying) {
      if (!this.isPaused) {
        this.togglePlay();
      }
    } else {
      const move = game.decodeDirectionKey(code);

      if (move) {
        this.setDirection(move);
      }
    }
  };

  private handleJoyStickClick = (direction: game.Direction) => (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    this.setDirection(direction);
  };

  private drawPixel = (block: game.Block, i: number, snake: game.Block[]) => {
    if (i === 0) {
      utils.roundRect(
        this.ctx,
        block.x * PIXEL_SIZE,
        block.y * PIXEL_SIZE,
        PIXEL_SIZE,
        PIXEL_SIZE,
        3,
        true,
        false
      );
    } else if (block.isCorner) {
      utils.roundRect(
        this.ctx,
        block.x * PIXEL_SIZE,
        block.y * PIXEL_SIZE,
        PIXEL_SIZE,
        PIXEL_SIZE,
        block.radius,
        true,
        false
      );
    } else {
      this.ctx.fillRect(
        block.x * PIXEL_SIZE,
        block.y * PIXEL_SIZE,
        PIXEL_SIZE,
        PIXEL_SIZE
      );
    }
  };

  private draw = () => {
    this.clear();

    this.state.snake.forEach((block, i) => {
      const isHead = !i;

      this.ctx.fillStyle = isHead ? "#011627" : i % 2 ? "#E71D36" : "#FF9F1C";
      this.drawPixel(block, i, this.state.snake);
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
      this.draw();
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
    this.setState(state => {
      // move snake

      const move = state.moves.shift();
      const snake = [...state.snake];
      const direction = move || utils.head(state.snake).direction;

      snake.unshift({
        ...game.moveBlock(direction, utils.head(state.snake), {
          board: BOARD_SIZE,
          pixel: PIXEL_SIZE
        }),
        direction
      });
      snake.pop();

      const [head, ...tail] = snake;
      const isCollision = game.hasCollidedWith(head);

      // collided with self
      if (tail.some(isCollision)) {
        this.stop();

        return { ...state, snake, move, isPlaying: false, isGameOver: true };
      }

      // collided with fruit
      if (isCollision(state.fruit)) {
        // add new block to snake's end
        const last = utils.last(snake);
        snake.push(
          game.moveBlock(game.OppositeDirections[last.direction], last, {
            board: BOARD_SIZE,
            pixel: PIXEL_SIZE
          })
        );

        // increment score
        const score = state.score + 1;
        const bestScore = score > state.bestScore ? score : state.bestScore;

        // persist best score to localstorage
        if (score >= bestScore) {
          localStorage.setItem(LS_KEY, JSON.stringify(score));
        }

        return {
          ...state,
          snake,
          move,
          score,
          bestScore,
          fruit: game.randomFruit(snake, PIXELS, FRUITS)
        };
      }

      // just moved
      return { ...state, snake, move };
    });
  };
}
