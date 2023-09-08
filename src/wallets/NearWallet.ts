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
  reservedCanClaimedAtOnce: number;

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
    this.reservedCanClaimedAtOnce = 5;
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
        network: 'mainnet',
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
      const accounts = await wallet.signIn({
        contractId:
          '3f9aee5d822139e866a9048db39faeb326dfd8d5252d0ae338bf87e082e442cd',
      });
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
    return await this.viewMethod({
      contractId: this.factoryAddress,
      method: 'getNftAddress',
      args: { storyId: Number(storyId) },
    });
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
    return await this.viewMethod({
      contractId: nftContract,
      method: 'nft_supply_for_owner',
      args: { account_id: account },
    });
  }

  async claimAuthorReservedNft(storyId: string, amount: number) {
    if (!this.wallet) throw new Error('Near Wallet Unavailable');

    // if (amount > 5) throw new Error('Batch minted up to 5!');

    const rest = await this.authorReservedNftRest(storyId);
    if (rest < amount)
      throw new Error('The minted quantity exceeds the remaining quantity!');

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
                deposit: nearAPI.utils.format.parseNearAmount('2.9'),
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
                gas: '220000000000000', // '300,00000000',// '300,000,000,000,000' = this.TotalPrepaidGasExceeded,
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
    const nftContract = await this.getNftAddress(storyId);
    const nfts = await this.viewMethod({
      contractId: nftContract,
      method: 'nft_tokens_for_owner',
      args: { account_id: account },
    });
    let tokenIds = [];
    for (const nft of nfts) {
      tokenIds.push(Number(nft.token_id));
    }
    return tokenIds;
  }

  async createTask(
    storyId: string,
    cid: string,
    nftAddress: string,
    rewards: number[],
  ) {
    if (!this.wallet) throw new Error('Near Wallet Unavailable');

    const nftContract = await this.getNftAddress(storyId);
    let nftTransferTransactions = new Array(rewards.length)
      .fill({})
      .map((v, i) => {
        return {
          receiverId: nftContract,
          actions: [
            {
              type: 'FunctionCall',
              params: {
                methodName: 'nft_transfer',
                args: {
                  receiver_id: this.factoryAddress,
                  token_id: rewards[i].toString(),
                },
                deposit: '1',
                gas: this.TotalPrepaidGasExceeded,
              },
            },
          ],
        };
      });
    const createTaskTransactions = {
      receiverId: this.factoryAddress,
      actions: [
        {
          type: 'FunctionCall',
          params: {
            methodName: 'createTask',
            args: {
              storyId: parseInt(storyId),
              cid: cid,
              nft: nftAddress || '',
              rewardNfts: rewards.join(','),
            },
            gas: this.TotalPrepaidGasExceeded,
          },
        },
      ],
    };
    const searchParam = getWalletCallbackSearchParam(
      'create-task',
      {
        chain: this.chainType,
        chainStoryId: storyId,
        cid: cid,
      },
      ChainType.Near,
    );

    await this.wallet.signAndSendTransactions({
      transactions: nftTransferTransactions.concat([createTaskTransactions]),
      callbackUrl: `${window.location.href}?${searchParam}`,
    });
    await this.lateReturn();
  }

  async updateTask(storyId: string, taskId: string, cid: string) {
    if (!this.wallet) throw new Error('Near Wallet Unavailable');

    const searchParam = getWalletCallbackSearchParam(
      'update-task',
      {
        chain: this.chainType,
        chainStoryId: storyId,
        chainTaskId: taskId,
        cid: cid,
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
                methodName: 'updateTask',
                args: {
                  storyId: parseInt(storyId),
                  taskId: parseInt(taskId),
                  cid: cid,
                },
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

  async cancelTask(storyId: string, taskId: number): Promise<void> {
    if (!this.wallet) throw new Error('Near Wallet Unavailable');

    const searchParam = getWalletCallbackSearchParam(
      'cancel-task',
      {
        chain: this.chainType,
        chainStoryId: storyId,
        chainTaskId: taskId.toString(),
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
                methodName: 'cancelTask',
                args: {
                  storyId: parseInt(storyId),
                  taskId: parseInt(taskId),
                },
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

  async markTaskDone(storyId: string, taskId: number, submitId: number) {
    if (!this.wallet) throw new Error('Near Wallet Unavailable');

    const searchParam = getWalletCallbackSearchParam(
      'done-task',
      {
        chain: this.chainType,
        chainStoryId: storyId,
        chainTaskId: taskId.toString(),
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
                methodName: 'markTaskDone',
                args: {
                  storyId: parseInt(storyId),
                  taskId: taskId,
                  submitId: submitId,
                },
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

  async createTaskSubmit(storyId: string, taskId: number, cid: string) {
    if (!this.wallet) throw new Error('Near Wallet Unavailable');

    const searchParam = getWalletCallbackSearchParam(
      'task-create-submit',
      {
        chain: this.chainType,
        chainStoryId: storyId,
        chainTaskId: taskId.toString(),
        cid: cid,
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
                methodName: 'createTaskSubmit',
                args: {
                  storyId: parseInt(storyId),
                  taskId: taskId,
                  cid: cid,
                },
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

  async withdrawTaskSubmit(storyId: string, taskId: number, submitId: number) {
    if (!this.wallet) throw new Error('Near Wallet Unavailable');

    const searchParam = getWalletCallbackSearchParam(
      'task-remove-submit',
      {
        chain: this.chainType,
        chainStoryId: storyId,
        chainTaskId: taskId.toString(),
        chainSubmitId: submitId.toString(),
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
                methodName: 'withdrawTaskSubmit',
                args: {
                  storyId: parseInt(storyId),
                  taskId: taskId,
                  submitId: submitId,
                },
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
}
