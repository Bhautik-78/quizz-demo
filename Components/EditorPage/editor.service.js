// eslint-disable-next-line import/no-mutable-exports
export let currentIndex = null;

export const setIndex = (i) => {
  currentIndex = i;
};

export const getIndex = () => currentIndex;
