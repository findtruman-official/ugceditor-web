export enum WalletType {
  Phantom,
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

  isAvailable(): boolean;

  getProvider<PT>(): PT | undefined;

  openWebsite(): void;

  setAutoConnect(autoConnect: WalletAutoConnectType): void;

  getAutoConnect(): boolean;

  silentConnect(): Promise<string | undefined>;

  connect(): Promise<string | undefined>;

  disconnect(): Promise<void>;

  signMessage(message: any): Promise<any>;

  publishStory(cid: string, factoryAddress: string): Promise<void>;

  updateStory(id: number, cid: string, factoryAddress: string): Promise<void>;

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
  ): Promise<void>;

  balanceOfStoryNft(account: number, name: string): Promise<number>;
}
