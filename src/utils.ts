export const delay = (time: number) => (fn: () => void) =>
  window.setTimeout(fn, time);

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
