export const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const timeElapsed = (timeStamp: number) => Date.now() - timeStamp;

export const throttle = (time: number, fn: () => void) => {
  let lastExecuted: number = 0;

  return () => {
    if (timeElapsed(lastExecuted) < time) {
      return;
    }
    fn();
    lastExecuted = Date.now();
  };
};

export const head = <T>(xs: T[]): T => xs[0];

export const last = <T>(xs: T[]): T => xs[xs.length - 1];

export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number | { tl: number; tr: number; br: number; bl: number },
  fill: boolean,
  stroke: boolean = true
) {
  if (typeof stroke === "undefined") {
    stroke = true;
  }
  if (typeof radius === "undefined") {
    radius = 5;
  }
  if (typeof radius === "number") {
    radius = { tl: radius, tr: radius, br: radius, bl: radius };
  } else {
    const defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };

    radius = Object.keys(defaultRadius).reduce(
      (acc, side) => ({
        ...acc,
        [side]:
          acc[side as keyof typeof acc] ||
          defaultRadius[side as keyof typeof defaultRadius],
      }),
      radius
    );
  }
  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height - radius.br);
  ctx.quadraticCurveTo(
    x + width,
    y + height,
    x + width - radius.br,
    y + height
  );
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
  if (fill) {
    ctx.fill();
  }
  if (stroke) {
    ctx.stroke();
  }
}
