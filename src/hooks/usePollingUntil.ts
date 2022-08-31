import { useRequest } from 'ahooks';
import { useCallback, useState } from 'react';

export default function usePollingUntil<T>(options: {
  condition: (item: T) => Promise<boolean>;
  onChange?: () => Promise<void>;
  interval?: number;
}) {
  const { condition, onChange, interval = 5000 } = options;
  const [pollingList, setPollingList] = useState<T[]>([]);

  const addPolling = useCallback(
    (item: T, updatePredicate?: (list: T[]) => number) => {
      const list = [...pollingList];

      if (!updatePredicate) {
        list.push(item);
      } else {
        const idx = updatePredicate(pollingList);
        if (idx === -1) {
          list.push(item);
        } else {
          list[idx] = item;
        }
      }

      setPollingList(list);
    },
    [pollingList],
  );

  const {} = useRequest(
    async () => {
      if (!pollingList.length) return;
      const list = [...pollingList];
      let changed = false;
      for (let i = list.length - 1; i >= 0; i--) {
        const item = list[i];
        if (await condition(item)) {
          list.splice(i, 1);
          changed = true;
        }
      }
      setPollingList(list);
      if (changed) {
        onChange?.();
      }
    },
    {
      pollingInterval: interval,
    },
  );

  return {
    addPolling,
    pollingList,
  };
}
