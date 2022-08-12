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
      chainStoryId: Story;
      contentHash: string;
      info?: StoryInfo;
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
      createAt: number;
      description: string;
      id: number;
      title: string;
      updateAt: number;
    };

    type StoryChapter = {};

    type StoryDetail = {
      title: string;
      cover: string;
      description: string;
      chapters: ChapterDetail[];
      createAt: number;
      updateAt: number;
      version: string;
    };

    type ChapterDetail = {
      name: string;
      content: string;
      createAt: number;
      updateAt: number;
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
  }
}
