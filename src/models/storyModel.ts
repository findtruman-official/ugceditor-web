import { getStories } from '@/services/api';
import { useRequest } from 'ahooks';
import { useState } from 'react';
import { useModel } from 'umi';

export default () => {
  const { account, chains } = useModel('walletModel', (state) => ({
    account: state.account,
    chains: state.chains,
  }));

  const [storyName, setStoryName] = useState('');
  const [chapterName, setChapterName] = useState('');

  const {
    data: hottestStories,
    loading: gettingHottestStories,
    refresh: refreshHottestStories,
  } = useRequest(async () => {
    return (await getStories('Hotest')).stories;
  });

  const {
    data: latestStories,
    loading: gettingLatestStories,
    refresh: refreshLatestStories,
  } = useRequest(async () => {
    return (await getStories('Latest')).stories;
  });

  const {
    data: myStories,
    loading: gettingMyStories,
    refresh: refreshMyStories,
  } = useRequest(
    async () => {
      if (!!account || !chains) {
        return (await getStories('Latest', [account], [chains[0].type]))
          .stories;
      }
    },
    { refreshDeps: [account, chains] },
  );

  return {
    storyName,
    setStoryName,
    chapterName,
    setChapterName,
    hottestStories,
    gettingHottestStories,
    latestStories,
    gettingLatestStories,
    myStories,
    gettingMyStories,
    refreshHottestStories,
    refreshLatestStories,
    refreshMyStories,
  };
};
