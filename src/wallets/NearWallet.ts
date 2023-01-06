import { getWalletCallbackSearchParam } from '@/hooks/useWalletCallback';
import {
  ChainType,
  WalletAutoConnectType,
  WalletEvents,
  WalletProvider,
  WalletType,
} from '@/wallets/index';
import { setupWalletSelector, Wallet } from '@near-wallet-selector/core';
import { WalletSelector } from '@near-wallet-selector/core/lib/wallet-selector.types';
import { setupNearWallet } from '@near-wallet-selector/near-wallet';
import BigNumber from 'bignumber.js';
import * as nearAPI from 'near-api-js';

export class NearWalletProvider implements WalletProvider {
  providerType: WalletType = WalletType.NearWallet;
  chainType: ChainType = ChainType.Near;
  provider: any;
  walletSelector?: WalletSelector;
  wallet?: Wallet;

  factoryAddress: string = '';
  findsMintAddress: string = '';

  THIRTY_TGAS = '30000000000000';
  TotalPrepaidGasExceeded = '300000000000000';

  onConnect: (payload: { address: string; pubKey?: string }) => void;
  onDisconnect: () => void;

  constructor(
    { onConnect, onDisconnect, onAccountChanged, onChainChanged }: WalletEvents,
    factoryAddress: string,
    findsMintAddress: string,
  ) {
    this.factoryAddress = factoryAddress;
    this.findsMintAddress = findsMintAddress;
    this.onConnect = onConnect || (() => {});
    this.onDisconnect = onDisconnect || (() => {});
  }

  getProvider<PT>(): PT | undefined {
    return undefined;
  }

  isAvailable(): boolean {
    return true;
  }

  openWebsite() {}

  setAutoConnect(autoConnect: WalletAutoConnectType) {
    localStorage.setItem('NEAR_WALLET_AUTO_CONNECT', autoConnect);
  }

  getAutoConnect(): boolean {
    const storage = localStorage.getItem('NEAR_WALLET_AUTO_CONNECT');
    return storage ? storage === WalletAutoConnectType.True : false;
  }

  async getWalletSelector() {
    if (!this.walletSelector) {
      this.walletSelector = await setupWalletSelector({
        network: 'testnet',
        modules: [setupNearWallet()],
      });
    }
    return this.walletSelector;
  }

  async getWallet() {
    const walletSelector = await this.getWalletSelector();
    if (!this.wallet) {
      this.wallet = await walletSelector.wallet('near-wallet');
    }
    return this.wallet;
  }

  async connect() {
    const walletSelector = await this.getWalletSelector();
    this.setAutoConnect(WalletAutoConnectType.True);
    if (walletSelector.isSignedIn()) {
      const wallet = await this.getWallet();
      const accounts = await wallet.getAccounts();
      this.onConnect({ address: accounts[0].accountId });
      return accounts[0].accountId;
    } else {
      const wallet = await this.getWallet();
      const accounts = await wallet.signIn({ contractId: 'test.testnet' });
      this.onConnect({ address: accounts[0].accountId });
      return accounts[0].accountId;
    }
  }

  async disconnect() {
    if (!this.walletSelector) return;
    this.setAutoConnect(WalletAutoConnectType.False);
    const wallet = await this.walletSelector.wallet('near-wallet');
    await wallet.signOut();
    this.onDisconnect();
  }

  async silentConnect() {
    const walletSelector = await this.getWalletSelector();
    if (walletSelector.isSignedIn()) {
      this.setAutoConnect(WalletAutoConnectType.True);
      const wallet = await this.getWallet();
      const accounts = await wallet.getAccounts();
      this.onConnect({ address: accounts[0].accountId });
      return accounts[0].accountId;
    }
  }

  async signMessage(message: string) {
    return '';
  }

  lateReturn<T>(value?: T): Promise<T> {
    return new Promise<T>((resolve) => {
      setTimeout(() => {
        resolve(value);
      }, 1000000);
    });
  }

  async viewMethod({
    contractId,
    method,
    args = {},
  }: {
    contractId: string;
    method: string;
    args?: object;
  }) {
    const { network } = this.walletSelector!.options;
    const provider = new nearAPI.providers.JsonRpcProvider({
      url: network.nodeUrl,
    });

    let res: any = await provider.query({
      request_type: 'call_function', // view_code | call_function
      account_id: contractId,
      method_name: method,
      args_base64: Buffer.from(JSON.stringify(args)).toString('base64'),
      finality: 'optimistic',
    });
    return JSON.parse(Buffer.from(res.result).toString());
  }

  async getNftAddress(storyId: string) {
    const nftAddr = await this.viewMethod({
      contractId: this.factoryAddress,
      method: 'getNftAddress',
      args: { storyId: Number(storyId) },
    });
    return nftAddr;
  }

  async authorReservedNftRest(storyId: string) {
    return await this.viewMethod({
      contractId: this.factoryAddress,
      method: 'authorReservedNftRest',
      args: { storyId: parseInt(storyId) },
    });
  }

  async balanceOfStoryNft(account: string, nftName: string, storyId: string) {
    const nftContract = await this.getNftAddress(storyId);
    // const nfts = await this.viewMethod({
    //   contractId: nftContract,
    //   method: 'nft_tokens_for_owner',
    //   args: { account_id: account },
    // });
    const balance = await this.viewMethod({
      contractId: nftContract,
      method: 'nft_supply_for_owner',
      args: { account_id: account },
    });
    return balance;
  }

  async claimAuthorReservedNft(storyId: string, amount: number) {
    if (!this.wallet) throw new Error('Near Wallet Unavailable');

    const rest = await this.authorReservedNftRest(storyId);
    if (rest < amount) return;

    await this.wallet.signAndSendTransactions({
      transactions: [
        {
          receiverId: this.factoryAddress,
          actions: [
            {
              type: 'FunctionCall',
              params: {
                methodName: 'claimAuthorReservedNft',
                args: {
                  storyId: parseInt(storyId),
                  amount: amount,
                },
                deposit: '1',
                gas: this.TotalPrepaidGasExceeded,
              },
            },
          ],
        },
      ],
    });
    await this.lateReturn();
  }

  async getMintDecimals() {
    const { decimals } = await this.viewMethod({
      contractId: this.findsMintAddress,
      method: 'ft_metadata',
    });
    return decimals;
  }

  async publishStory(
    cid: string,
    payload: Omit<WalletCallback.PublishStoryPayload, 'id'>,
  ) {
    if (!this.wallet) throw new Error('Near Wallet Unavailable');
    const nextStoryId = await this.viewMethod({
      contractId: this.factoryAddress,
      method: 'get_nextStoryId',
    });

    const searchParam = getWalletCallbackSearchParam(
      'publish-story',
      {
        ...payload,
        id: nextStoryId.toString(),
      },
      ChainType.Near,
    );

    await this.wallet.signAndSendTransactions({
      transactions: [
        {
          receiverId: this.factoryAddress,
          actions: [
            {
              type: 'FunctionCall',
              params: {
                methodName: 'publishStory',
                args: { cid: cid },
                gas: this.THIRTY_TGAS,
              },
            },
          ],
        },
      ],
      callbackUrl: `${window.location.href}?${searchParam}`,
    });
    return this.lateReturn<string>(nextStoryId);
  }

  async updateStory(id: string, cid: string, clearChapterCaches?: boolean) {
    if (!this.wallet) throw new Error('Near Wallet Unavailable');

    const searchParam = getWalletCallbackSearchParam(
      'update-story',
      {
        id,
        contentHash: cid,
        clearChapterCache: clearChapterCaches || false,
        chainType: this.chainType,
      },
      ChainType.Near,
    );

    await this.wallet.signAndSendTransactions({
      transactions: [
        {
          receiverId: this.factoryAddress,
          actions: [
            {
              type: 'FunctionCall',
              params: {
                methodName: 'updateStory',
                args: { storyId: parseInt(id), cid: cid },
                gas: this.THIRTY_TGAS,
              },
            },
          ],
        },
      ],
      callbackUrl: `${window.location.href}?${searchParam}`,
    });
    await this.lateReturn();
  }

  async publishStoryNft(
    id: string,
    price: number,
    total: number,
    reserved: number,
    metadata: { name: string; desc: string; img: string },
    uriPrefix: string,
  ) {
    if (!this.wallet) throw new Error('Near Wallet Unavailable');

    const decimals = await this.getMintDecimals();
    const _price = new BigNumber(price).times(
      new BigNumber(10).pow(new BigNumber(decimals)),
    );

    const searchParam = getWalletCallbackSearchParam(
      'nft-sale',
      {
        id,
        chainType: this.chainType,
      },
      ChainType.Near,
    );

    await this.wallet.signAndSendTransactions({
      transactions: [
        {
          receiverId: this.factoryAddress,
          actions: [
            {
              type: 'FunctionCall',
              params: {
                methodName: 'publishStoryNft',
                args: {
                  storyId: id,
                  name: metadata.name,
                  image: metadata.img,
                  descripition: metadata.desc,
                  uriPrefix: uriPrefix,
                  token: this.findsMintAddress,
                  price: _price,
                  total,
                  authorReserve: reserved,
                },
                deposit: nearAPI.utils.format.parseNearAmount('2.87'),
                gas: this.TotalPrepaidGasExceeded,
              },
            },
          ],
        },
        {
          receiverId: this.findsMintAddress,
          actions: [
            {
              type: 'FunctionCall',
              params: {
                methodName: 'storage_deposit',
                args: {},
                deposit: nearAPI.utils.format.parseNearAmount('0.023'),
                gas: this.TotalPrepaidGasExceeded,
              },
            },
          ],
        },
      ],
      callbackUrl: `${window.location.href}?${searchParam}`,
    });
    await this.lateReturn();
  }

  async mintStoryNft(
    id: string,
    author: string,
    price: string,
    nftSaleAddr: string,
    onInsufficientFinds?: (account: string, amount: string) => void,
  ) {
    if (!this.wallet) throw new Error('Near Wallet Unavailable');

    const _price = await this.viewMethod({
      contractId: this.factoryAddress,
      method: 'get_price',
      args: { storyId: Number(id) },
    });
    await this.wallet.signAndSendTransactions({
      transactions: [
        {
          receiverId: this.findsMintAddress,
          actions: [
            {
              type: 'FunctionCall',
              params: {
                methodName: 'ft_transfer_call',
                args: {
                  receiver_id: this.factoryAddress,
                  amount: _price,
                  msg: id.toString(),
                },
                deposit: '1',
                gas: this.TotalPrepaidGasExceeded,
              },
            },
          ],
        },
      ],
    });
    await this.lateReturn();
  }

  async restOfStoryNftOnChain(nftName: string, storyId: string) {
    return this.viewMethod({
      contractId: this.factoryAddress,
      method: 'restOfStoryNftOnChain',
      args: { storyId: parseInt(storyId) },
    });
  }

  async tokenIdOfStoryNft(account: string, nftName: string, storyId: string) {
    return [];
  }

  async createTask(
    storyId: string,
    cid: string,
    nftAddress: string,
    rewards: number[],
  ) {}

  async updateTask(storyId: string, taskId: string, cid: string) {}

  async cancelTask(storyId: string, taskId: number): Promise<void> {}

  async markTaskDone(storyId: string, taskId: number, submitId: number) {}

  async createTaskSubmit(storyId: string, taskId: number, cid: string) {}

  async withdrawTaskSubmit(storyId: string, taskId: number, submitId: number) {}
}
