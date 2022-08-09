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
}
