export const isStoryPage = (path: string) => {
  return /^\/story\/([a-zA-z]|-)+\/[a-zA-Z\d]+/g.test(path);
};

export const isChapterPage = (path: string) => {
  return /^\/story\/([a-zA-z]|-)+\/[a-zA-Z\d]+\/chapter\/[a-zA-Z\d]+/g.test(
    path,
  );
};
