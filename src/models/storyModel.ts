import {
  getNftInfo,
  getStories,
  getStory,
  syncStoryContentHash,
  syncStoryNftSale,
} from '@/services/api';
import { ChainType } from '@/wallets';
import { useRequest } from 'ahooks';
import { useCallback, useMemo, useState } from 'react';
import { useModel } from 'umi';

// @ts-ignore
export default () => {
  const { accounts, chains } = useModel('walletModel', (state) => ({
    accounts: state.accounts,
    chains: state.chains,
  }));

  const [chainType, setChainType] = useState<ChainType>();
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
      if (!!storyId && !!chainType) {
        const { story } = await getStory(chainType, storyId);
        setChapters(story.info?.chapters || []);
        return story;
      }
    },
    { refreshDeps: [storyId, chainType] },
  );

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
    if (currentStory) {
      return (
        accounts[currentStory.chainInfo.type].toLowerCase() ===
        currentStory.author.toLowerCase()
      );
    } else {
      return false;
    }
  }, [currentStory, accounts]);

  const isChainConnected = useMemo(() => {
    if (currentStory) {
      return !!accounts[currentStory.chainInfo.type];
    } else {
      return false;
    }
  }, [currentStory, accounts]);

  const {
    data: hottestStories,
    loading: gettingHottestStories,
    refresh: refreshHottestStories,
  } = useRequest(async () => {
    return (await getStories('Hotest')).stories.slice(0, 10).map((e) => ({
      id: e.chainStoryId,
      cover: e.info?.cover,
      name: e.info?.title,
      description: e.info?.description,
      nftPublished: !!e.nft,
      chain: e.chainInfo.name,
      chainType: e.chainInfo.type,
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
      name: e.info?.title,
      description: e.info?.description,
      nftPublished: !!e.nft,
      chain: e.chainInfo.name,
      chainType: e.chainInfo.type,
    }));
  });

  const {
    data: myStories,
    loading: gettingMyStories,
    refresh: refreshMyStories,
  } = useRequest(
    async () => {
      const chains: string[] = Object.keys(accounts).filter(
        (k) => !!accounts[k],
      );
      const addresses: string[] = chains.map((k) => accounts[k]);
      if (chains.length > 0) {
        return (await getStories('Latest', addresses, chains)).stories.map(
          (e) => ({
            id: e.chainStoryId,
            cover: e.info?.cover,
            name: e.info?.title,
            description: e.info?.description,
            nftPublished: !!e.nft,
            chain: e.chainInfo.name,
            chainType: e.chainInfo.type,
          }),
        );
      }
    },
    { refreshDeps: [accounts] },
  );

  const [createStoryPollingList, setCreateStoryPollingList] = useState<
    {
      id: string;
      cover: string;
      name: string;
      description: string;
      nftPublished: boolean;
      chain: string;
      chainType: string;
      loading: boolean;
    }[]
  >([]);

  const addCreateStoryPolling = useCallback(
    ({
      id,
      cover,
      name,
      description,
      chain,
      chainType,
    }: {
      id: string;
      cover: string;
      name: string;
      description: string;
      chain: string;
      chainType: ChainType;
    }) => {
      const list = [...createStoryPollingList];
      list.push({
        id,
        cover,
        chain,
        name,
        description,
        nftPublished: false,
        chainType,
        loading: true,
      });
      setCreateStoryPollingList(list);
    },
    [createStoryPollingList],
  );

  const {} = useRequest(
    async () => {
      if (!createStoryPollingList.length) return;
      const list = [...createStoryPollingList];
      let changed = false;
      for (let i = list.length - 1; i >= 0; i--) {
        await syncStoryContentHash(list[i].chainType, list[i].id);
        const { story } = await getStory(list[i].chainType, list[i].id);
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

  const [nftSalePollingList, setNftSalePollingList] = useState<
    {
      id: string;
      chainType: ChainType;
    }[]
  >([]);

  const nftSalePolling = useMemo(() => {
    if (!currentStory) return false;
    return !!nftSalePollingList.find(
      (e) =>
        e.id === currentStory.chainStoryId &&
        e.chainType === currentStory.chainInfo.type,
    );
  }, [nftSalePollingList, currentStory]);

  const addNftSalePolling = useCallback(
    (id: string, chainType: ChainType) => {
      const list = [...nftSalePollingList];
      list.push({ id, chainType });
      setNftSalePollingList(list);
    },
    [nftSalePollingList],
  );

  const {} = useRequest(
    async () => {
      if (!nftSalePollingList.length) return;
      const list = [...nftSalePollingList];
      for (let i = list.length - 1; i >= 0; i--) {
        await syncStoryNftSale(list[i].chainType, list[i].id);
        const { story } = await getNftInfo(list[i].chainType, list[i].id);
        if (story.nft) {
          if (
            list[i].id === currentStory?.chainStoryId &&
            list[i].chainType === currentStory.chainInfo.type
          ) {
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
    { id: string; contentHash: string; chainType: ChainType }[]
  >([]);

  const updateStoryPolling = useMemo(() => {
    if (!currentStory) return false;
    return !!updateStoryPollingList.find(
      (e) =>
        e.id === currentStory.chainStoryId &&
        e.chainType === currentStory.chainInfo.type,
    );
  }, [updateStoryPollingList, currentStory]);

  const addUpdateStoryPolling = useCallback(
    (id: string, contentHash: string, chainType: ChainType) => {
      const list = [...updateStoryPollingList];
      const item = {
        id,
        contentHash,
        chainType,
      };
      const idx = list.findIndex(
        (e) => e.id === id && e.chainType === chainType,
      );
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
      if (!updateStoryPollingList.length) return;
      const list = [...updateStoryPollingList];
      for (let i = list.length - 1; i >= 0; i--) {
        await syncStoryContentHash(list[i].chainType, list[i].id);
        const { story } = await getStory(list[i].chainType, list[i].id);
        if (story.contentHash === list[i].contentHash) {
          list.splice(i, 1);
          if (
            story.chainStoryId === currentStory?.chainStoryId &&
            story.chainInfo.type === currentStory.chainInfo.type
          ) {
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
    chainType,
    setChainType,
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
    isChainConnected,
    createStoryPollingList,
    addCreateStoryPolling,
    nftSalePolling,
    addNftSalePolling,
    updateStoryPolling,
    addUpdateStoryPolling,
  };
};
