import {
  getNftInfo,
  getStories,
  getStory,
  syncStoryContentHash,
  syncStoryNftSale,
} from '@/services/api';
import { useRequest } from 'ahooks';
import { useCallback, useMemo, useState } from 'react';
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
    mutate: mutateCurrentStory,
  } = useRequest(
    async () => {
      setChapters([]);
      if (!!storyId && !!chains?.[0]) {
        const { story } = await getStory(chains[0].type, storyId);
        setChapters(story.info?.chapters);
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

  const { data: chapterCaches, refresh: refreshChapterCaches } = useRequest(
    async () => {
      if (!storyId) return [];

      try {
        const storage = localStorage.getItem(`FCC_CHAPTER_CACHE_${storyId}`);
        if (storage) {
          return (JSON.parse(storage) as API.ChapterStorage[]).filter((e) => {
            const _chapter = chapters.find((c) => c.id === e.id);
            return (
              !_chapter || e.timestamp > new Date(_chapter.updateAt).valueOf()
            );
          });
        }
      } catch (e) {}
      return [];
    },
    {
      refreshDeps: [storyId, chapters],
    },
  );
  const chapterCache = useMemo(() => {
    return chapterCaches?.find((c: API.ChapterStorage) => c.id === chapterId);
  }, [chapterCaches, chapterId]);
  const saveChapterCache = useCallback(
    (id: number, name: string, content: string, timestamp: number) => {
      const _chapterStorage = chapterCaches ? [...chapterCaches] : [];
      const idx = _chapterStorage?.findIndex((e) => e.id === id);
      const chapter = {
        id,
        name,
        content,
        timestamp,
        new: true,
      };
      if (idx !== -1) {
        _chapterStorage[idx] = chapter;
      } else {
        _chapterStorage.push(chapter);
      }
      localStorage.setItem(
        `FCC_CHAPTER_CACHE_${storyId}`,
        JSON.stringify(_chapterStorage),
      );
      refreshChapterCaches();
    },
    [storyId, chapterCaches],
  );
  const deleteChapterCache = useCallback(
    (id: number) => {
      const _chapterStorage = chapterCaches ? [...chapterCaches] : [];
      const idx = _chapterStorage?.findIndex((e) => e.id === id);
      if (idx !== -1) {
        _chapterStorage.splice(idx, 1);
        localStorage.setItem(
          `FCC_CHAPTER_CACHE_${storyId}`,
          JSON.stringify(_chapterStorage),
        );
        refreshChapterCaches();
      }
    },
    [storyId, chapterCaches],
  );
  const clearChapterCaches = useCallback(() => {
    localStorage.removeItem(`FCC_CHAPTER_CACHE_${storyId}`);
  }, [storyId]);

  const isAuthor = useMemo(() => {
    if (currentStory && !!account) {
      return currentStory.author === account;
    } else {
      return false;
    }
  }, [currentStory, account]);

  const {
    data: hottestStories,
    loading: gettingHottestStories,
    refresh: refreshHottestStories,
  } = useRequest(async () => {
    return (await getStories('Hotest')).stories.map((e) => ({
      id: e.chainStoryId,
      cover: e.info?.cover,
      chain: e.chainInfo.name,
    }));
  });

  const {
    data: latestStories,
    loading: gettingLatestStories,
    refresh: refreshLatestStories,
  } = useRequest(async () => {
    return (await getStories('Latest')).stories.map((e) => ({
      id: e.chainStoryId,
      cover: e.info?.cover,
      chain: e.chainInfo.name,
    }));
  });

  const {
    data: myStories,
    loading: gettingMyStories,
    refresh: refreshMyStories,
  } = useRequest(
    async () => {
      if (!!account && !!chains?.[0]) {
        return (
          await getStories('Latest', [account], [chains[0].type])
        ).stories.map((e) => ({
          id: e.chainStoryId,
          cover: e.info?.cover,
          chain: e.chainInfo.name,
        }));
      }
    },
    { refreshDeps: [account, chains] },
  );

  const [createStoryPollingList, setCreateStoryPollingList] = useState<
    { id: string; cover: string; chain: string; loading: boolean }[]
  >([]);

  const addCreateStoryPolling = useCallback(
    ({ id, cover, chain }: { id: string; cover: string; chain: string }) => {
      const list = [...createStoryPollingList];
      list.push({
        id,
        cover,
        chain,
        loading: true,
      });
      setCreateStoryPollingList(list);
    },
    [createStoryPollingList],
  );

  const {} = useRequest(
    async () => {
      if (!createStoryPollingList.length || !account || !chains?.[0]) return;
      const list = [...createStoryPollingList];
      let changed = false;
      for (let i = list.length - 1; i >= 0; i--) {
        await syncStoryContentHash(chains[0].type, list[i].id);
        const { story } = await getStory(chains[0].type, list[i].id);
        if (story) {
          list.splice(i, 1);
          changed = true;
        }
      }
      setCreateStoryPollingList(list);
      if (changed) {
        refreshMyStories();
        refreshLatestStories();
      }
    },
    {
      pollingInterval: 5000,
    },
  );

  const [nftSalePollingList, setNftSalePollingList] = useState<string[]>([]);

  const nftSalePolling = useMemo(() => {
    if (!currentStory) return false;
    return !!nftSalePollingList.find((e) => e === currentStory.chainStoryId);
  }, [nftSalePollingList, currentStory]);

  const addNftSalePolling = useCallback(
    (id: string) => {
      const list = [...nftSalePollingList];
      list.push(id);
      setNftSalePollingList(list);
    },
    [nftSalePollingList],
  );

  const {} = useRequest(
    async () => {
      if (!nftSalePollingList.length || !account || !chains?.[0]) return;
      const list = [...nftSalePollingList];
      for (let i = list.length - 1; i >= 0; i--) {
        await syncStoryNftSale(chains[0].type, list[i]);
        const { story } = await getNftInfo(chains[0].type, list[i]);
        if (story.nft) {
          if (list[i] === currentStory.chainStoryId) {
            refreshCurrentStory();
          }
          list.splice(i, 1);
        }
      }
      setNftSalePollingList(list);
    },
    {
      pollingInterval: 5000,
    },
  );

  const [updateStoryPollingList, setUpdateStoryPollingList] = useState<
    { id: string; contentHash: string }[]
  >([]);

  const updateStoryPolling = useMemo(() => {
    if (!currentStory) return false;
    return !!updateStoryPollingList.find(
      (e) => e.id === currentStory.chainStoryId,
    );
  }, [updateStoryPollingList, currentStory]);

  const addUpdateStoryPolling = useCallback(
    (id: string, contentHash: string) => {
      const list = [...updateStoryPollingList];
      const item = {
        id,
        contentHash,
      };
      const idx = list.findIndex((e) => e.id === id);
      if (idx !== -1) {
        list[idx] = item;
      } else {
        list.push(item);
      }
      setUpdateStoryPollingList(list);
    },
    [updateStoryPollingList],
  );

  const {} = useRequest(
    async () => {
      if (!updateStoryPollingList.length || !account || !chains?.[0]) return;
      const list = [...updateStoryPollingList];
      for (let i = list.length - 1; i >= 0; i--) {
        await syncStoryContentHash(chains[0].type, list[i].id);
        const { story } = await getStory(chains[0].type, list[i].id);
        if (story.contentHash === list[i].contentHash) {
          list.splice(i, 1);
          if (story.chainStoryId === currentStory.chainStoryId) {
            refreshCurrentStory();
          }
        }
      }
      setUpdateStoryPollingList(list);
    },
    {
      pollingInterval: 5000,
    },
  );

  return {
    storyId,
    setStoryId,
    chapterId,
    setChapterId,
    chapters,
    setChapters,
    chapterCache,
    chapterCaches,
    saveChapterCache,
    deleteChapterCache,
    clearChapterCaches,
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
    isAuthor,
    createStoryPollingList,
    addCreateStoryPolling,
    nftSalePolling,
    addNftSalePolling,
    updateStoryPolling,
    addUpdateStoryPolling,
  };
};
