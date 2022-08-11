import { useState } from 'react';

export default () => {
  const [storyName, setStoryName] = useState('');
  const [chapterName, setChapterName] = useState('');
  return {
    storyName,
    setStoryName,
    chapterName,
    setChapterName,
  };
};
