export enum ChainType {
  Solana = 'solana-dev',
  Klaytn = 'klaytn-baobab',
}

export enum WalletType {
  Phantom,
  Kaikas,
}

export enum WalletAutoConnectType {
  False = '0',
  True = '1',
}

export interface WalletEvents {
  onConnect?: (address: string) => void;
  onDisconnect?: () => void;
  onAccountChanged?: (address: string) => void;
  onChainChanged?: (chainId: string) => void;
}

export interface WalletProvider {
  providerType: WalletType;
  provider?: any;
  chainType: ChainType;

  isAvailable(): boolean;

  getProvider<PT>(): PT | undefined;

  openWebsite(): void;

  setAutoConnect(autoConnect: WalletAutoConnectType): void;

  getAutoConnect(): boolean;

  silentConnect(): Promise<string | undefined>;

  connect(): Promise<string | undefined>;

  disconnect(): Promise<void>;

  signMessage(message: any): Promise<any>;

  publishStory(cid: string, factoryAddress: string): Promise<string>;

  updateStory(id: string, cid: string, factoryAddress: string): Promise<void>;

  getMintDecimals(findsMintAddress: string): Promise<number>;

  publishStoryNft(
    id: number,
    price: number,
    total: number,
    reserved: number,
    title: string,
    uriPrefix: string,
    factoryAddress: string,
    findsMintAddress: string,
  ): Promise<void>;

  mintStoryNft(
    id: number,
    author: string,
    factoryAddress: string,
    findsMintAddress: string,
    price: number,
    onInsufficientFinds?: (account: string, amount: string) => void,
  ): Promise<void>;

  balanceOfStoryNft(account: number, name: string): Promise<number>;
}
