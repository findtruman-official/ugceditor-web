import {
  ChainType,
  WalletAutoConnectType,
  WalletEvents,
  WalletProvider,
  WalletType,
} from '@/wallets/index';
import { message } from 'antd';

export class PlugWalletProvider implements WalletProvider {
  providerType: WalletType = WalletType.Plug;
  chainType: ChainType = ChainType.Dfinity;
  provider: any;
  factoryAddress: string = '';
  findsMintAddress: string = '';

  onConnect?: (payload: { address: string; pubKey?: string }) => void;
  onAccountChanged?: (payload: { address: string; pubKey?: string }) => void;
  onDisconnect?: () => void;

  constructor(
    { onConnect, onDisconnect, onAccountChanged, onChainChanged }: WalletEvents,
    factoryAddress: string,
    findsMintAddress: string,
  ) {
    this.factoryAddress = factoryAddress;
    this.findsMintAddress = findsMintAddress;
    this.provider = this.getProvider<Plug>();
    if (this.provider) {
      this.onConnect = onConnect || (() => {});
      this.onAccountChanged = onConnect || (() => {});
      this.onDisconnect = onDisconnect || (() => {});
    }
  }

  getProvider<PT>(): any {
    return window.ic?.plug;
  }

  isAvailable(): boolean {
    return !!window.ic?.plug;
  }

  openWebsite() {
    window.open('https://plugwallet.ooo/', '_blank', 'noreferrer noopener');
  }

  setAutoConnect(autoConnect: WalletAutoConnectType) {
    localStorage.setItem('PLUG_AUTO_CONNECT', autoConnect);
  }

  getAutoConnect(): boolean {
    const storage = localStorage.getItem('PLUG_AUTO_CONNECT');
    return storage ? storage === WalletAutoConnectType.True : false;
  }

  async connect() {
    if (!this.provider) return;

    try {
      await this.provider.requestConnect({
        onConnectionUpdate: (conn: {
          sessionData: { accountId: string; principalId: string };
          connection: {
            publicKey: {
              derKey: string;
              rawKey: string;
            };
          };
        }) => {
          this.onAccountChanged?.({
            address: this.provider.sessionManager.sessionData.principalId,
          });
        },
      });
      const account = this.provider.sessionManager.sessionData.principalId;
      this.onConnect?.({ address: account });
      this.setAutoConnect(WalletAutoConnectType.True);
      return account;
    } catch (error) {
      message.error((error as any).message);
    }
  }

  async disconnect() {
    await this.provider.disconnect();
    this.setAutoConnect(WalletAutoConnectType.False);
    this.onDisconnect?.();
  }

  async silentConnect() {
    if (!this.provider) return;
    const connected = await this.provider.isConnected();
    if (connected) {
      const account = this.provider.sessionManager.sessionData.principalId;
      this.onConnect?.({ address: account });
      return account;
    }
  }

  async signMessage(message: string) {
    return '';
  }

  async publishStory(cid: string) {
    return '';
  }

  async updateStory(id: string, cid: string) {}

  async getMintDecimals() {
    return -1;
  }

  async publishStoryNft(
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
  ) {}

  async mintStoryNft(
    id: string,
    author: string,
    price: string,
    nftSaleAddr: string,
    onInsufficientFinds?: (account: string, amount: string) => void,
  ) {}

  async balanceOfStoryNft(account: string, nftName: string, storyId: string) {
    return 0;
  }

  async restOfStoryNftOnChain(nftName: string, storyId: string) {
    return -1;
  }

  async getNftAddress(storyId: string) {
    return '';
  }

  async createTask(
    storyId: string,
    cid: string,
    nftAddress: string,
    rewards: number[],
  ) {}

  async updateTask(storyId: string, taskId: string, cid: string) {}

  async cancelTask(storyId: string, taskId: number) {}

  async createTaskSubmit(storyId: string, taskId: number, cid: string) {}

  async withdrawTaskSubmit(storyId: string, taskId: number, submitId: number) {}

  async markTaskDone(storyId: string, taskId: number, submitId: number) {}

  async authorReservedNftRest(storyId: string) {
    return 0;
  }

  async claimAuthorReservedNft(storyId: string, amount: number) {}

  async tokenIdOfStoryNft(account: string, nftName: string, storyId: string) {
    return [];
  }
}
