import { useState } from 'react';

export default () => {
  const [storyName, setStoryName] = useState('');
  return {
    storyName,
    setStoryName,
  };
};
