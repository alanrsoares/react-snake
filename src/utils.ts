export const delay = (time: number) => (fn: () => void) =>
  window.setTimeout(fn, time);

export const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
