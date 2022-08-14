import '@umijs/max/typings';

declare global {
  interface Window {
    phantom: any;
    solana: any;
  }

  namespace API {
    type Chain = {
      name: string;
      type: string;
      factoryAddress: string;
    };

    type Jwt = {
      expiresIn: number;
      token: string;
    };

    type Story = {
      author: string;
      chain: string;
      chainInfo: Chain;
      chainStoryId: string;
      contentHash: string;
      info: StoryInfo;
      nft?: NftSale;
      onChainAddr: string;
      createTime: string;
      updateTime: string;
    };

    type StoryInfo = {
      chain: string;
      chainStoryId: string;
      chapters: StoryChapter[];
      contentHash: string;
      cover: string;
      createAt: string;
      description: string;
      id: number;
      title: string;
      updateAt: string;
    };

    type StoryChapter = {
      id: number;
      name: string;
      content: string;
      createAt: string;
      updateAt: string;
      delete?: boolean;
    };

    type StoryDetail = {
      title: string;
      cover: string;
      description: string;
      chapters: ChapterDetail[];
      createAt: string | number;
      updateAt: string | number;
      version: string;
    };

    type ChapterDetail = {
      name: string;
      content: string;
      createAt: string;
      updateAt: string;
    };

    type NftSale = {
      authorClaimed: number;
      authorReserved: number;
      chain: string;
      chainStoryId: string;
      description: string;
      image: string;
      name: string;
      nftSaleAddr: string;
      price: number;
      sold: number;
      total: number;
      type: number;
      createTime: string;
      updateTime: string;
    };

    type User = {
      account: string;
      chain: string;
    };

    type ResultWrapper<T> = {
      data: T;
      code: number;
      message: string;
    };

    type IpfsData = {
      cid: string;
      size: number;
    };

    type IpfsResult = {
      cid: string;
      url: string;
    };

    /**
     * Record<`FCC_CHAPTER_CACHE_${chainStoryId}`, ChapterStorage[]>
     */
    type ChapterStorage = {
      id: number;
      name: string;
      content: string;
      timestamp: number;
      new: boolean;
    };
  }
}
