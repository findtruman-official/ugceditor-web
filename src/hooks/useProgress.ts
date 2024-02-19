import { random } from '@/utils/utils';
import { useMemoizedFn } from 'ahooks';
import { useState } from 'react';

const useProgress = ({
  onEnd,
  seconds,
}: {
  onEnd?: VoidFunction;
  seconds: number;
}) => {
  const total = seconds * 10;
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  const startProgress = useMemoizedFn(() => {
    if (loading) return;

    let _progress = 0;
    setProgress(0);
    setLoading(true);

    const timer = setInterval(() => {
      console.log(`progress ${_progress}`);
      _progress = _progress + random(8, 12);
      _progress = _progress > total ? total : _progress;
      setProgress(Math.floor((_progress / total) * 100));

      if (_progress === total) {
        setLoading(false);
        onEnd?.();
        clearInterval(timer);
      }
    }, 1000);
  });

  return {
    progress,
    loading,
    startProgress,
  };
};

export default useProgress;
