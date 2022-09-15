import usePollingUntil from '@/hooks/usePollingUntil';
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
  const { accounts, connectedWallets } = useModel('walletModel', (state) => ({
    accounts: state.accounts,
    connectedWallets: state.connectedWallets,
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

  const {
    pollingList: createStoryPollingList,
    addPolling: addCreateStoryPolling,
  } = usePollingUntil<{
    id: string;
    cover: string;
    name: string;
    description: string;
    nftPublished: boolean;
    chain: string;
    chainType: string;
    loading: boolean;
  }>({
    condition: async (item) => {
      await syncStoryContentHash(item.chainType, item.id);
      const { story } = await getStory(item.chainType, item.id);
      return !!story;
    },
    onChange: async () => {
      refreshMyStories();
      refreshLatestStories();
    },
  });

  const { pollingList: nftSalePollingList, addPolling: addNftSalePolling } =
    usePollingUntil<{
      id: string;
      chainType: ChainType;
    }>({
      condition: async (item) => {
        await syncStoryNftSale(item.chainType, item.id);
        const { story } = await getNftInfo(item.chainType, item.id);
        if (
          !!story &&
          item.id === currentStory?.chainStoryId &&
          item.chainType === currentStory.chainInfo.type
        ) {
          refreshCurrentStory();
        }
        return !!story.nft;
      },
    });

  const nftSalePolling = useMemo(() => {
    if (!currentStory) return false;
    return !!nftSalePollingList.find(
      (e) =>
        e.id === currentStory.chainStoryId &&
        e.chainType === currentStory.chainInfo.type,
    );
  }, [nftSalePollingList, currentStory]);

  const {
    pollingList: updateStoryPollingList,
    addPolling: _addUpdateStoryPolling,
  } = usePollingUntil<{
    id: string;
    contentHash: string;
    chainType: ChainType;
  }>({
    condition: async (item) => {
      await syncStoryContentHash(item.chainType, item.id);
      const { story } = await getStory(item.chainType, item.id);
      const meet = story.contentHash === item.contentHash;
      if (
        meet &&
        story.chainStoryId === currentStory?.chainStoryId &&
        story.chainInfo.type === currentStory.chainInfo.type
      ) {
        refreshCurrentStory();
      }
      return meet;
    },
  });

  const updateStoryPolling = useMemo(() => {
    if (!currentStory) return false;
    return !!updateStoryPollingList.find(
      (e) =>
        e.id === currentStory.chainStoryId &&
        e.chainType === currentStory.chainInfo.type,
    );
  }, [updateStoryPollingList, currentStory]);

  const addUpdateStoryPolling = useCallback(
    (item: { id: string; contentHash: string; chainType: ChainType }) => {
      _addUpdateStoryPolling(item, (list) => {
        return list.findIndex(
          (e) => e.id === item.id && e.chainType === item.chainType,
        );
      });
    },
    [_addUpdateStoryPolling],
  );

  const {
    data: balanceOfStoryNft,
    loading: gettingBalanceOfStoryNft,
    refresh: refreshBalanceOfStoryNft,
  } = useRequest(
    async () => {
      if (
        !chainType ||
        !connectedWallets[chainType] ||
        !accounts[chainType] ||
        !currentStory?.nft
      )
        return 0;

      return await connectedWallets[chainType].provider.balanceOfStoryNft(
        accounts[chainType],
        currentStory.nft.name,
        currentStory.chainStoryId,
      );
    },
    { refreshDeps: [accounts, currentStory, chainType, connectedWallets] },
  );

  const {
    data: restOfStoryNftOnChain,
    loading: gettingRestOfStoryNftOnChain,
    refresh: refreshRestOfStoryNftOnChain,
  } = useRequest(
    async () => {
      if (!chainType || !connectedWallets[chainType] || !currentStory?.nft)
        return 0;

      return await connectedWallets[chainType].provider.restOfStoryNftOnChain(
        currentStory.nft.name,
        currentStory.chainStoryId,
      );
    },
    { refreshDeps: [accounts, currentStory, chainType, connectedWallets] },
  );

  const { data: reservedNftRest, refreshAsync: refreshReservedNftRest } =
    useRequest(
      async () => {
        if (
          !isAuthor ||
          !chainType ||
          !storyId ||
          !connectedWallets[chainType]
        ) {
          return true;
        }
        return (await connectedWallets[
          chainType
        ].provider.authorReservedNftRest(storyId)) as number;
      },
      {
        refreshDeps: [isAuthor, storyId, chainType, connectedWallets],
      },
    );

  const {
    data: nfts,
    loading: gettingNfts,
    refreshAsync: refreshNfts,
  } = useRequest(
    async () => {
      if (
        !isAuthor ||
        !chainType ||
        !storyId ||
        !currentStory?.nft ||
        !connectedWallets[chainType] ||
        !accounts[chainType]
      ) {
        return [];
      }
      return await connectedWallets[chainType].provider.tokenIdOfStoryNft(
        accounts[chainType],
        currentStory.nft.name,
        storyId,
      );
    },
    {
      refreshDeps: [
        isAuthor,
        storyId,
        chainType,
        connectedWallets,
        currentStory,
        accounts,
      ],
    },
  );

  const { runAsync: claimReservedNft, loading: claimingReservedNft } =
    useRequest(
      async (amount: number) => {
        if (!isAuthor || !chainType || !storyId || !connectedWallets[chainType])
          return;

        await connectedWallets[chainType].provider.claimAuthorReservedNft(
          storyId,
          amount,
        );
        refreshBalanceOfStoryNft();
        refreshNfts();
        await refreshReservedNftRest();
      },
      { manual: true },
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
    balanceOfStoryNft,
    gettingBalanceOfStoryNft,
    refreshBalanceOfStoryNft,
    restOfStoryNftOnChain,
    gettingRestOfStoryNftOnChain,
    refreshRestOfStoryNftOnChain,
    reservedNftRest,
    refreshReservedNftRest,
    nfts,
    gettingNfts,
    refreshNfts,
    claimReservedNft,
    claimingReservedNft,
  };
};
