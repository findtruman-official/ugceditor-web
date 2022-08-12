import { getChapter, getStories, getStory } from '@/services/api';
import { useRequest } from 'ahooks';
import { useState } from 'react';
import { useModel } from 'umi';

// @ts-ignore
export default () => {
  const { account, chains } = useModel('walletModel', (state) => ({
    account: state.account,
    chains: state.chains,
  }));

  const [storyId, setStoryId] = useState('');
  const [chapterId, setChapterId] = useState(0);

  const { data: currentStory, loading: gettingCurrentStory } = useRequest(
    async () => {
      if (!!storyId && !!chains?.[0]) {
        return (await getStory(chains[0].type, storyId)).story;
      }
    },
    { refreshDeps: [storyId, chains] },
  );
  const { data: currentChapter, loading: gettingCurrentChapter } = useRequest(
    async () => {
      if (!!chapterId) {
        return (await getChapter(chapterId)).chapter;
      }
    },
    { refreshDeps: [chapterId] },
  );

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
      if (!!account && !!chains?.[0]) {
        return (await getStories('Latest', [account], [chains[0].type]))
          .stories;
      }
    },
    { refreshDeps: [account, chains] },
  );

  return {
    storyId,
    setStoryId,
    chapterId,
    setChapterId,
    currentStory,
    gettingCurrentStory,
    currentChapter,
    gettingCurrentChapter,
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
