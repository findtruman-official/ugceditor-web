export enum ChainType {
  Solana = 'solana-dev',
  Klaytn = 'klaytn-baobab',
  Tezos = 'tezos-jakartanet',
  Dfinity = 'ic',
  Near = 'near',
  IRIS = 'iris',
}

export enum WalletType {
  Phantom,
  Kaikas,
  Temple,
  Plug,
  NearWallet,
  Metamask,
}

export enum WalletAutoConnectType {
  False = '0',
  True = '1',
}

export interface WalletEvents {
  onConnect?: (payload: { address: string; pubKey?: string }) => void;
  onDisconnect?: () => void;
  onAccountChanged?: (payload: { address: string; pubKey?: string }) => void;
  onChainChanged?: (chainId: string) => void;
}

export interface WalletProvider {
  providerType: WalletType;

  provider?: any;

  chainType: ChainType;

  factoryAddress: string;

  findsMintAddress: string;

  // constructor(
  //   events: WalletEvents,
  //   factoryAddress: string,
  //   findsMintAddress: string,
  // ): WalletProvider;

  isAvailable(): boolean | Promise<boolean>;

  getProvider<PT>(): PT | undefined;

  openWebsite(): void;

  setAutoConnect(autoConnect: WalletAutoConnectType): void;

  getAutoConnect(): boolean;

  silentConnect(): Promise<string | undefined>;

  connect(): Promise<string | undefined>;

  disconnect(): Promise<void>;

  signMessage(message: any): Promise<any>;

  publishStory(
    cid: string,
    payload: Omit<WalletCallback.PublishStoryPayload, 'id'>,
  ): Promise<string>;

  updateStory(
    id: string,
    cid: string,
    clearChapterCaches?: boolean,
  ): Promise<void>;

  getMintDecimals(): Promise<number>;

  publishStoryNft(
    id: string,
    price: number,
    total: number,
    reserved: number,
    metadata: {
      name: string;
      desc: string;
      img: string;
    },
    uriPrefix: string,
  ): Promise<void>;

  mintStoryNft(
    id: string,
    author: string,
    price: string,
    nftSaleAddr: string,
    onInsufficientFinds?: (account: string, amount: string) => void,
  ): Promise<void>;

  balanceOfStoryNft(
    account: string,
    nftName: string,
    storyId: string,
  ): Promise<number>;

  restOfStoryNftOnChain(nftName: string, storyId: string): Promise<number>;

  getNftAddress(storyId: string): Promise<string>;

  createTask(
    storyId: string,
    cid: string,
    nftAddress: string,
    rewards: number[],
  ): Promise<void>;

  updateTask(storyId: string, taskId: string, cid: string): Promise<void>;

  cancelTask(storyId: string, taskId: number): Promise<void>;

  createTaskSubmit(storyId: string, taskId: number, cid: string): Promise<void>;

  withdrawTaskSubmit(
    storyId: string,
    taskId: number,
    submitId: number,
  ): Promise<void>;

  markTaskDone(
    storyId: string,
    taskId: number,
    submitId: number,
  ): Promise<void>;

  authorReservedNftRest(storyId: string): Promise<number>;

  reservedCanClaimedAtOnce?: number;

  claimAuthorReservedNft(storyId: string, amount: number): Promise<void>;

  tokenIdOfStoryNft(
    account: string,
    nftName: string,
    storyId: string,
  ): Promise<number[]>;
}
