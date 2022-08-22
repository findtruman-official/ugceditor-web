import ABI from '@/assets/klaytn_abi.json';
import FINDS_ABI from '@/assets/klaytn_finds_abi.json';
import {
  ChainType,
  WalletAutoConnectType,
  WalletEvents,
  WalletProvider,
  WalletType,
} from '@/wallets/index';
import { BN } from '@project-serum/anchor';
import { message } from 'antd';
import Caver, { Contract } from 'caver-js';

export class KaikasWalletProvider implements WalletProvider {
  providerType: WalletType = WalletType.Kaikas;
  chainType: ChainType = ChainType.Klaytn;
  provider: any;
  caver?: Caver;
  contract?: Contract;
  findsContract?: Contract;
  factoryAddress: string = '';
  findsMintAddress: string = '';

  onConnect?: (address: string) => void;
  onDisconnect?: () => void;

  constructor(
    { onConnect, onDisconnect, onAccountChanged, onChainChanged }: WalletEvents,
    factoryAddress: string,
    findsMintAddress: string,
  ) {
    this.factoryAddress = factoryAddress;
    this.findsMintAddress = findsMintAddress;
    this.provider = this.getProvider<any>();
    if (this.provider) {
      this.caver = new Caver(this.provider);
      this.contract = new this.caver.klay.Contract(ABI as any, factoryAddress);
      this.findsContract = new this.caver.klay.Contract(
        FINDS_ABI as any,
        findsMintAddress,
      );
      this.onConnect = onConnect || (() => {});
      this.onDisconnect = onDisconnect || (() => {});
      this.provider.on('accountsChanged', (accounts: string[]) => {
        onAccountChanged?.(accounts[0]);
      });
      this.provider.on('networkChanged', () => {});
    }
  }

  getProvider<PT>(): PT | undefined {
    return window.klaytn;
  }

  isAvailable(): boolean {
    return window.klaytn?.isKaikas;
  }

  openWebsite() {
    window.open(
      'https://chrome.google.com/webstore/detail/kaikas/jblndlipeogpafnldhgmapagcccfchpi',
      '_blank',
      'noreferrer noopener',
    );
  }

  setAutoConnect(autoConnect: WalletAutoConnectType) {
    localStorage.setItem('KAIKAS_AUTO_CONNECT', autoConnect);
  }

  getAutoConnect(): boolean {
    const storage = localStorage.getItem('KAIKAS_AUTO_CONNECT');
    return storage ? storage === WalletAutoConnectType.True : false;
  }

  async connect() {
    if (!this.provider) return;

    try {
      const accounts = await this.provider.enable();
      this.onConnect?.(accounts[0]);
      this.setAutoConnect(WalletAutoConnectType.True);
      return accounts[0];
    } catch (error) {
      message.error((error as any).message);
    }
  }

  async disconnect() {
    this.setAutoConnect(WalletAutoConnectType.False);
    this.onDisconnect?.();
  }

  async silentConnect() {
    if (!this.provider) return;
    const approved = await this.provider._kaikas.isApproved();
    const unlocked = await this.provider._kaikas.isUnlocked();
    if (approved && unlocked) {
      return await this.connect();
    }
  }

  async signMessage(message: string) {
    if (!this.provider || !this.caver) throw new Error('Provider Unavailable');
    const account = this.provider.selectedAddress;
    return await this.caver.klay.sign(message, account);
  }

  async balanceOfStoryNft(account: number, name: string) {
    // TODO:
    return 0;
  }

  async getMintDecimals() {
    return await this.findsContract!.methods.decimals().call();
  }

  async mintStoryNft(
    id: number,
    author: string,
    price: string,
    onInsufficientFinds?: (account: string, amount: string) => void,
  ) {
    // TODO: mintStoryNft
    // TODO: balance of finds
    const balance = await this.findsContract!.methods.balanceOf(
      this.provider.selectedAddress,
    ).call();
  }

  async publishStory(cid: string) {
    if (!this.contract) throw new Error('Contract Unavailable');
    const author = this.provider.selectedAddress;
    const method = this.contract.methods.publishStory(cid);
    const storyId = await this.contract.methods.nextId().call();
    await method.send({
      from: author,
      gas: await method.estimateGas({ from: author }),
    });
    // TODO: fix error newLogFilter is not a function
    // const storyId = await new Promise<string>(async (resolve, reject) => {
    //   this.contract!.once(
    //     'StoryUpdated',
    //     {
    //       filter: { author: author },
    //     },
    //     (error, event) => {
    //       console.log(error, event);
    //       if (error || !event) {
    //         reject();
    //       } else {
    //         const { returnValues } = event;
    //         resolve(returnValues?.id || '');
    //       }
    //     },
    //   );
    // });

    return storyId;
  }

  async publishStoryNft(
    id: string,
    price: number,
    total: number,
    reserved: number,
    title: string,
    uriPrefix: string,
  ) {
    if (!this.contract) throw new Error('Contract Unavailable');
    const author = this.provider.selectedAddress;
    const decimals = await this.getMintDecimals();
    const _price = new BN(price).mul(new BN(10).pow(new BN(decimals)));
    const method = this.contract.methods.publishStoryNft(
      id,
      title,
      'Story',
      uriPrefix,
      this.findsMintAddress,
      _price,
      total,
      reserved,
    );
    await method.send({
      from: author,
      gas: await method.estimateGas({ from: author }),
    });
  }

  async updateStory(id: string, cid: string) {
    if (!this.contract) throw new Error('Contract Unavailable');
    const author = this.provider.selectedAddress;
    const method = this.contract.methods.updateStory(id, cid);
    await method.send({
      from: author,
      gas: await method.estimateGas({ from: author }),
    });
    // TODO: fix error newLogFilter is not a function
  }
}
