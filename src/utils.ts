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
