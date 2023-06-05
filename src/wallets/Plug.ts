import {
  ChainType,
  WalletAutoConnectType,
  WalletEvents,
  WalletProvider,
  WalletType,
} from '@/wallets/index';
import { Principal } from '@dfinity/principal';
import { message } from 'antd';
import BigNumber from 'bignumber.js';
import {
  idlFactory as backendFactory,
  _SERVICE as BackendType,
} from './ic/backend';
import { idlFactory as findsFactory, _SERVICE as FindsType } from './ic/finds';
import { idlFactory as nftFactory, _SERVICE as NftType } from './ic/nft';

export class PlugWalletProvider implements WalletProvider {
  providerType: WalletType = WalletType.Plug;
  chainType: ChainType = ChainType.Dfinity;
  provider: any;
  factoryAddress: string = '';
  findsMintAddress: string = '';

  backendActor?: BackendType;
  findsActor?: FindsType;

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

  async initActors() {
    this.backendActor = await this.provider.createActor({
      canisterId: this.factoryAddress,
      interfaceFactory: backendFactory,
    });
    this.findsActor = await this.provider.createActor({
      canisterId: this.findsMintAddress,
      interfaceFactory: findsFactory,
    });
    await this.provider.agent.fetchRootKey();
  }

  async connect() {
    if (!this.provider) return;

    try {
      await this.provider.requestConnect({
        whitelist: [this.factoryAddress, this.findsMintAddress],
        // host: 'http://10.243.248.69:8008',
        onConnectionUpdate: async (conn: {
          sessionData: { accountId: string; principalId: string };
          connection: {
            publicKey: {
              derKey: string;
              rawKey: string;
            };
          };
        }) => {
          await this.initActors();
          this.onAccountChanged?.({
            address: this.provider.sessionManager.sessionData.principalId,
          });
        },
      });
      await this.initActors();
      const account = this.provider.sessionManager.sessionData.principalId;
      this.onConnect?.({ address: account });
      this.setAutoConnect(WalletAutoConnectType.True);
      return account;
    } catch (error) {
      message.error((error as any).message);
      this.setAutoConnect(WalletAutoConnectType.False);
    }
  }

  async disconnect() {
    // await this.provider.disconnect();
    this.setAutoConnect(WalletAutoConnectType.False);
    this.onDisconnect?.();
  }

  async silentConnect() {
    if (!this.provider) return;
    const connected = await this.provider.isConnected();
    if (connected) {
      return await this.connect();
    }
  }

  async signMessage(message: string) {
    return '';
  }

  async publishStory(cid: string) {
    if (!this.backendActor) throw new Error('Actor not available!');

    const nextStoryId = Number(await this.backendActor.countStories()) + 1;
    try {
      const res = await this.backendActor.publishStory(cid);
      console.log(`<publishStory>`, res);
      return res.id.toString();
    } catch (e) {
      console.log(e);
      return `${nextStoryId}`;
    }
  }

  async updateStory(id: string, cid: string) {
    if (!this.backendActor) throw new Error('Actor not available!');

    try {
      const res = await this.backendActor.updateStory(BigInt(id), cid);
      console.log(`<updateStory>`, res);
    } catch (e) {
      console.log(e);
    }
  }

  async getMintDecimals() {
    if (!this.findsActor) {
      await this.initActors();
    }

    return await this.findsActor!.decimals();
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
  ) {
    if (!this.backendActor) throw new Error('Actor not available!');

    try {
      const account = this.provider.sessionManager.sessionData.principalId;
      const decimals = await this.getMintDecimals();
      const _price = new BigNumber(price)
        .times(new BigNumber(10).pow(new BigNumber(decimals)))
        .toString();
      const res = await this.backendActor.publishNft(
        BigInt(id),
        BigInt(total),
        BigInt(reserved),
        Principal.fromText(account),
        Principal.fromText(this.findsMintAddress),
        BigInt(_price),
        metadata.name,
        metadata.name,
        uriPrefix,
      );
      console.log(`<publishStoryNft>`, res);
    } catch (e) {
      console.log(e);
    }
  }

  async mintStoryNft(
    id: string,
    author: string,
    price: string,
    nftSaleAddr: string,
    onInsufficientFinds?: (account: string, amount: string) => void,
  ) {
    if (!this.backendActor || !this.findsActor)
      throw new Error('Actor not available!');

    const account = this.provider.sessionManager.sessionData.principalId;

    const findsBalanceBn = new BigNumber(
      (await this.findsActor.balanceOf(Principal.fromText(account))).toString(),
    );
    const priceBn = new BigNumber(price);
    if (findsBalanceBn.lt(priceBn)) {
      onInsufficientFinds?.(account, priceBn.minus(findsBalanceBn).toString());
      return;
    }
    try {
      await this.findsActor.approve(
        Principal.fromText(this.factoryAddress),
        BigInt(price),
      );
    } catch (e) {
      console.log(e);
    }
    const nftActor = await this.getNftSaleActor(id);

    const nftBalance = Number(
      await nftActor!.balanceOfDip721(Principal.fromText(account)),
    );
    try {
      const res = await this.backendActor.mintNft(BigInt(id));
      while (
        Number(await nftActor!.balanceOfDip721(Principal.fromText(account))) ===
        nftBalance
      ) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      console.log(`<mintStoryNft>`, res);
    } catch (e) {
      console.log(e);
    }
  }

  nftSaleActorManager: Record<
    string,
    {
      actor?: any;
      callbacks: ((actor: any) => void)[];
    }
  > = {};

  async getNftSaleActor(storyId: string) {
    if (!this.backendActor) throw new Error('Actor not available!');

    if (!this.nftSaleActorManager[storyId]) {
      this.nftSaleActorManager[storyId] = {
        actor: undefined,
        callbacks: [],
      };

      new Promise(async () => {
        const [sale] = await this.backendActor!.getSale(BigInt(storyId));
        if (sale?.nft) {
          const actor = (await this.provider.createActor({
            canisterId: sale.nft.toText(),
            interfaceFactory: nftFactory,
          })) as NftType;
          this.nftSaleActorManager[storyId].actor = actor;

          for (let callback of this.nftSaleActorManager[storyId].callbacks) {
            callback(actor);
          }
          this.nftSaleActorManager[storyId].callbacks = [];
        }
      });

      return new Promise((resolve: (actor: any) => void) => {
        this.nftSaleActorManager[storyId].callbacks.push(resolve);
      });
    } else {
      if (this.nftSaleActorManager[storyId].actor) {
        return this.nftSaleActorManager[storyId].actor;
      } else {
        return new Promise((resolve: (actor: any) => void) => {
          this.nftSaleActorManager[storyId].callbacks.push(resolve);
        });
      }
    }
  }

  async balanceOfStoryNft(account: string, nftName: string, storyId: string) {
    const nftActor = await this.getNftSaleActor(storyId);
    if (nftActor) {
      return Number(
        await nftActor.balanceOfDip721(Principal.fromText(account)),
      );
    } else {
      return 0;
    }
  }

  async restOfStoryNftOnChain(nftName: string, storyId: string) {
    if (!this.backendActor) throw new Error('Actor not available!');

    const [sale] = await this.backendActor.getSale(BigInt(storyId));
    if (sale) {
      const { authorReserved, total, sold } = sale;
      return Number(total) - Number(authorReserved) - Number(sold);
    }
    return -1;
  }

  async getNftAddress(storyId: string) {
    if (!this.backendActor) throw new Error('Actor not available!');

    const [sale] = await this.backendActor.getSale(BigInt(storyId));
    if (sale) {
      return sale.nft.toText();
    }
    return '';
  }

  async createTask(
    storyId: string,
    cid: string,
    nftAddress: string,
    rewards: number[],
  ) {
    if (!this.backendActor) throw new Error('Actor not available!');

    try {
      const res = await this.backendActor.createTask(
        BigInt(storyId),
        cid,
        Principal.fromText(nftAddress),
        rewards.map((r) => BigInt(r)),
      );
      console.log('<createTask>', res);
    } catch (e) {
      console.log(e);
    }
  }

  async updateTask(storyId: string, taskId: string, cid: string) {
    if (!this.backendActor) throw new Error('Actor not available!');

    try {
      const res = await this.backendActor.updateTask(
        BigInt(storyId),
        BigInt(taskId),
        cid,
      );
      console.log('<updateTask>', res);
    } catch (e) {
      console.log(e);
    }
  }

  async cancelTask(storyId: string, taskId: number) {
    if (!this.backendActor) throw new Error('Actor not available!');

    try {
      const res = await this.backendActor.cancelTask(
        BigInt(storyId),
        BigInt(taskId),
      );
      console.log('<cancelTask>', res);
    } catch (e) {
      console.log(e);
    }
  }

  async createTaskSubmit(storyId: string, taskId: number, cid: string) {
    if (!this.backendActor) throw new Error('Actor not available!');

    try {
      const res = await this.backendActor.createTaskSubmit(
        BigInt(storyId),
        BigInt(taskId),
        cid,
      );
      console.log('<createTaskSubmit>', res);
    } catch (e) {
      console.log(e);
    }
  }

  async withdrawTaskSubmit(storyId: string, taskId: number, submitId: number) {
    if (!this.backendActor) throw new Error('Actor not available!');

    try {
      const res = await this.backendActor.withdrawTaskSubmit(
        BigInt(storyId),
        BigInt(taskId),
        BigInt(submitId),
      );
      console.log('<withdrawTaskSubmit>', res);
    } catch (e) {
      console.log(e);
    }
  }

  async markTaskDone(storyId: string, taskId: number, submitId: number) {
    if (!this.backendActor) throw new Error('Actor not available!');

    try {
      const res = await this.backendActor.markTaskDone(
        BigInt(storyId),
        BigInt(taskId),
        BigInt(submitId),
      );
      console.log('<markTaskDone>', res);
    } catch (e) {
      console.log(e);
    }
  }

  async authorReservedNftRest(storyId: string) {
    if (!this.backendActor) throw new Error('Actor not available!');

    const [sale] = await this.backendActor.getSale(BigInt(storyId));
    if (sale) {
      const { authorReserved, authorClaimed } = sale;
      return Number(authorReserved) - Number(authorClaimed);
    }
    return 0;
  }

  async claimAuthorReservedNft(storyId: string, amount: number) {
    if (!this.backendActor) throw new Error('Actor not available!');

    try {
      const res = await this.backendActor.claimAuthorReservedNft(
        BigInt(storyId),
        BigInt(amount),
      );
      console.log('<claimAuthorReservedNft>', res);
    } catch (e) {
      console.log(e);
    }
  }

  async tokenIdOfStoryNft(account: string, nftName: string, storyId: string) {
    if (!this.backendActor) throw new Error('Actor not available!');

    const nftActor = await this.getNftSaleActor(storyId);
    if (nftActor) {
      return await nftActor.getTokenIdsForUserDip721(
        Principal.fromText(account),
      );
    }
    return [];
  }
}
