import * as React from "react";
import { render } from "react-dom";

import "./index.css";

const delay = (time: number) => (fn: Function) => window.setTimeout(fn, time);

const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

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
  snake: Block[];
  turns: { [index: string]: Direction };
  isMoving: boolean;
  fruit: Position & { value: string };
}

const BOARD_SIZE = 450;
const PIXEL_SIZE = 10;
const PIXELS = Math.floor(BOARD_SIZE / PIXEL_SIZE) - 1;
const SPEED = 100;

const OPPOSITE_DIRECTION: { [direction: string]: Direction } = {
  left: "right",
  right: "left",
  up: "down",
  down: "up"
};

const FRUITS = ["🍑", "🍎", "🍏", "🍐", "🍑", "🍒", "🍓", "🥝"];

class App extends React.Component<Props, State> {
  state: State = {
    snake: [
      { x: 5, y: 0, direction: "right" },
      { x: 4, y: 0, direction: "right" }
    ],
    turns: {},
    isMoving: false,
    fruit: {
      value: FRUITS[randomInt(0, FRUITS.length - 1)],
      y: randomInt(0, PIXELS),
      x: randomInt(0, PIXELS)
    }
  };

  get ctx() {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;

    return canvas.getContext("2d") as CanvasRenderingContext2D;
  }

  componentWillMount() {
    document.addEventListener("keyup", this.handleKeyUp);
  }

  componentWillUnMount() {
    document.removeEventListener("keyup", this.handleKeyUp);
    this.setState({ isMoving: false });
  }

  componentDidMount() {
    this.draw();
    this.play();
  }

  setDirection(direction: Direction) {
    this.setState(({ turns, snake: [head, ...rest] }) => ({
      turns: {
        ...turns,
        [`${head.y}_${head.x}`]: direction
      },
      snake: [{ ...head, direction }, ...rest],
      isMoving: true
    }));
  }

  spawnFruit() {
    this.setState({
      fruit: {
        value: FRUITS[randomInt(0, FRUITS.length - 1)],
        y: randomInt(0, PIXELS),
        x: randomInt(0, PIXELS)
      }
    });
  }

  handleKeyUp = ({ code }: KeyboardEvent) => {
    const prefix = "Arrow";
    const moveDirection = code.startsWith(prefix)
      ? code.replace(prefix, "").toLowerCase()
      : null;

    if (moveDirection) {
      const { direction } = this.state.snake[0];

      if (direction !== OPPOSITE_DIRECTION[moveDirection]) {
        this.setDirection(moveDirection);
      }
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

    this.ctx.strokeText(
      this.state.fruit.value,
      this.state.fruit.x * PIXEL_SIZE - 1,
      this.state.fruit.y * PIXEL_SIZE + 9
    );

    this.state.snake.forEach((p: Block, i: number) => {
      this.ctx.fillStyle = !i ? "#011627" : i % 2 ? "#E71D36" : "#FF9F1C";
      this.drawPixel({ y: p.y, x: p.x });
    });
  };

  clear = () => this.ctx.clearRect(0, 0, BOARD_SIZE, BOARD_SIZE);

  play = () => {
    window.requestAnimationFrame(() => {
      if (this.state.isMoving) {
        this.move();
      }
      delay(SPEED)(this.play);
    });
  };

  getTurn = (b: Block, state: State) => state.turns[`${b.y}_${b.x}`];

  moveBlock(direction: Direction, block: Block) {
    const safe = (x: number) => {
      if (x < 0) {
        return BOARD_SIZE / PIXEL_SIZE - 1;
      }
      return x * 10 >= BOARD_SIZE ? 0 : x;
    };

    switch (direction) {
      case "right":
        return {
          ...block,
          x: safe(block.x + 1)
        };
      case "left":
        return {
          ...block,
          x: safe(block.x - 1)
        };
      case "down":
        return {
          ...block,
          y: safe(block.y + 1)
        };
      case "up":
        return {
          ...block,
          y: safe(block.y - 1)
        };
      default:
        return block;
    }
  }

  move = () => {
    this.setState(state => {
      let turns = state.turns;
      let fruit = state.fruit;

      let hasEaten = false;

      const snake = state.snake.map((p, i, xs) => {
        const turn = this.getTurn(p, state);

        if (i === xs.length - 1) {
          delete turns[`${p.y}_${p.x}`];
        }

        if (!i && p.y === fruit.y && p.x === fruit.x) {
          hasEaten = true;
          fruit = {
            value: FRUITS[randomInt(0, FRUITS.length - 1)],
            y: randomInt(0, PIXELS),
            x: randomInt(0, PIXELS)
          };
        }

        const direction = turn || p.direction;
        const block = { ...p, direction };

        return this.moveBlock(direction, block);
      });

      if (hasEaten) {
        const last = snake[snake.length - 1];
        snake.push(this.moveBlock(OPPOSITE_DIRECTION[last.direction], last));
      }

      return { snake, turns, fruit };
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
        <div className="canvas-overlay" />
        <canvas id="canvas" width={BOARD_SIZE} height={BOARD_SIZE} />
      </div>
    );
  }
}

render(<App />, document.getElementById("root"));
