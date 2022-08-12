import { getStories, getStory } from '@/services/api';
import { useRequest } from 'ahooks';
import { useMemo, useState } from 'react';
import { useModel } from 'umi';

// @ts-ignore
export default () => {
  const { account, chains } = useModel('walletModel', (state) => ({
    account: state.account,
    chains: state.chains,
  }));

  const [storyId, setStoryId] = useState('');
  const [chapterId, setChapterId] = useState(0);

  const [chapters, setChapters] = useState<API.StoryChapter[]>([]);

  const {
    data: currentStory,
    loading: gettingCurrentStory,
    refresh: refreshCurrentStory,
  } = useRequest(
    async () => {
      setChapters([]);
      if (!!storyId && !!chains?.[0]) {
        const { story } = await getStory(chains[0].type, storyId);
        setChapters(story.info.chapters);
        return story;
      }
    },
    { refreshDeps: [storyId, chains] },
  );
  // const {
  //   data: currentChapter,
  //   loading: gettingCurrentChapter,
  // } = useRequest(
  //   async () => {
  //     if (!!chapterId) {
  //       return (await getChapter(chapterId)).chapter;
  //     }
  //   },
  //   { refreshDeps: [chapterId] },
  // );
  const currentChapter = useMemo(() => {
    if (chapters) {
      return chapters.find((c) => c.id === chapterId);
    }
  }, [chapterId, chapters]);

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
    chapters,
    setChapters,
    currentStory,
    gettingCurrentStory,
    refreshCurrentStory,
    currentChapter,
    // gettingCurrentChapter,
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
