import ABI from '@/assets/klaytn_abi.json';
import FINDS_ABI from '@/assets/klaytn_finds_abi.json';
import NFT_ABI from '@/assets/klaytn_nft_abi.json';
import {
  ChainType,
  WalletAutoConnectType,
  WalletEvents,
  WalletProvider,
  WalletType,
} from '@/wallets/index';
import { message } from 'antd';
import BigNumber from 'bignumber.js';
import Caver, { Contract } from 'caver-js';
import * as _ from 'lodash';

export class KaikasWalletProvider implements WalletProvider {
  providerType: WalletType = WalletType.Kaikas;
  chainType: ChainType = ChainType.Klaytn;
  provider: any;
  caver?: Caver;
  contract?: Contract;
  findsContract?: Contract;
  factoryAddress: string = '';
  findsMintAddress: string = '';

  onConnect?: (payload: { address: string; pubKey?: string }) => void;
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
        onAccountChanged?.({ address: accounts[0] });
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
      this.onConnect?.({ address: accounts[0] });
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

  async getNftAddress(storyId: string) {
    const sales = await this.contract!.methods.sales(storyId).call();
    return sales?.nft || '';
  }

  async getNftSaleContract(storyId: string) {
    const nftAddress = await this.getNftAddress(storyId);
    return new this.caver!.klay.Contract(NFT_ABI as any, nftAddress);
  }

  async balanceOfStoryNft(account: string, nftName: string, storyId: string) {
    const nftSaleContract = await this.getNftSaleContract(storyId);
    return parseInt(await nftSaleContract.methods.balanceOf(account).call());
  }

  async restOfStoryNftOnChain(nftName: string, storyId: string) {
    if (!this.contract) throw new Error('Contract Unavailable');

    const { authorReserved, total, sold } = await this.contract.methods
      .sales(storyId)
      .call();
    return total - authorReserved - sold;
  }

  async getMintDecimals() {
    return await this.findsContract!.methods.decimals().call();
  }

  async mintStoryNft(
    id: string,
    author: string,
    price: string,
    nftSaleAddr: string,
    onInsufficientFinds?: (account: string, amount: string) => void,
  ) {
    const account = this.provider.selectedAddress;
    const priceBN = new BigNumber(price);

    const tokenAmount = await this.findsContract!.methods.balanceOf(
      this.provider.selectedAddress,
    ).call();
    const enoughToken = new BigNumber(tokenAmount).gte(priceBN);
    if (!enoughToken) {
      const mintDecimals = await this.getMintDecimals();
      onInsufficientFinds?.(
        account,
        new BigNumber(price)
          .minus(new BigNumber(tokenAmount))
          .div(new BigNumber(10).pow(new BigNumber(mintDecimals)))
          .toString(),
      );
      throw new Error('Insufficient USDT Token');
    }

    const allowance = await this.findsContract!.methods.allowance(
      account,
      nftSaleAddr,
    ).call();
    const enoughAllowance = new BigNumber(allowance).gte(priceBN);
    if (!enoughAllowance) {
      let toApprove = '1500000000000000000000';
      if (priceBN.gte(new BigNumber(toApprove))) {
        toApprove = price;
      }
      const approveMethod = this.findsContract!.methods.approve(
        nftSaleAddr,
        toApprove,
      );
      await approveMethod.send({
        from: account,
        // gas: await approveMethod.estimateGas({ from: author }),
        gas: '100000',
      });
    }

    const method = this.contract!.methods.mintStoryNft(id);
    await method.send({
      from: account,
      gas: await method.estimateGas({ from: account }),
    });
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
    metadata: {
      name: string;
      desc: string;
      img: string;
    },
    uriPrefix: string,
  ) {
    if (!this.contract) throw new Error('Contract Unavailable');
    const author = this.provider.selectedAddress;
    const decimals = await this.getMintDecimals();
    const _price = new BigNumber(price).times(
      new BigNumber(10).pow(new BigNumber(decimals)),
    );
    const { name } = metadata;
    const method = this.contract.methods.publishStoryNft(
      id,
      name,
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
  }

  async createTask(
    storyId: string,
    cid: string,
    nftAddress: string,
    rewards: number[],
  ) {
    if (!this.contract) throw new Error('Contract Unavailable');
    const account = this.provider.selectedAddress;

    const nftSaleContract = await this.getNftSaleContract(storyId);
    if (parseInt(nftSaleContract._address) !== 0) {
      const isApprovedForAll = await nftSaleContract.methods
        .isApprovedForAll(account, this.factoryAddress)
        .call();
      if (!isApprovedForAll) {
        const approveMethod = nftSaleContract.methods.setApprovalForAll(
          this.factoryAddress,
          true,
        );
        await approveMethod.send({
          from: account,
          gas: await approveMethod.estimateGas({ from: account }),
        });
      }
    }

    const method = this.contract.methods.createTask(
      storyId,
      cid,
      nftAddress,
      rewards,
    );
    await method.send({
      from: account,
      gas: await method.estimateGas({ from: account }),
    });
  }

  async updateTask(storyId: string, taskId: string, cid: string) {
    if (!this.contract) throw new Error('Contract Unavailable');
    const account = this.provider.selectedAddress;
    const method = this.contract.methods.updateTask(storyId, taskId, cid);
    await method.send({
      from: account,
      gas: await method.estimateGas({ from: account }),
    });
  }

  async cancelTask(storyId: string, taskId: number) {
    if (!this.contract) throw new Error('Contract Unavailable');
    const account = this.provider.selectedAddress;
    const method = this.contract.methods.cancelTask(storyId, taskId);
    await method.send({
      from: account,
      gas: await method.estimateGas({ from: account }),
    });
  }

  async markTaskDone(storyId: string, taskId: number, submitId: number) {
    if (!this.contract) throw new Error('Contract Unavailable');
    const account = this.provider.selectedAddress;
    const method = this.contract.methods.markTaskDone(
      storyId,
      taskId,
      submitId,
    );
    await method.send({
      from: account,
      gas: await method.estimateGas({ from: account }),
    });
  }

  async createTaskSubmit(storyId: string, taskId: number, cid: string) {
    if (!this.contract) throw new Error('Contract Unavailable');
    const account = this.provider.selectedAddress;
    const method = this.contract.methods.createTaskSubmit(storyId, taskId, cid);
    await method.send({
      from: account,
      gas: await method.estimateGas({ from: account }),
    });
  }

  async withdrawTaskSubmit(storyId: string, taskId: number, submitId: number) {
    if (!this.contract) throw new Error('Contract Unavailable');
    const account = this.provider.selectedAddress;
    const method = this.contract.methods.withdrawTaskSubmit(
      storyId,
      taskId,
      submitId,
    );
    await method.send({
      from: account,
      gas: await method.estimateGas({ from: account }),
    });
  }

  async authorReservedNftRest(storyId: string) {
    if (!this.contract) throw new Error('Contract Unavailable');
    const { authorReserved, authorClaimed } = await this.contract.methods
      .sales(storyId)
      .call();
    return authorReserved - authorClaimed;
  }

  async claimAuthorReservedNft(storyId: string, amount: number) {
    if (!this.contract) throw new Error('Contract Unavailable');

    const rest = await this.authorReservedNftRest(storyId);
    if (rest < amount) return;

    const account = this.provider.selectedAddress;
    const method = this.contract.methods.claimAuthorReservedNft(
      storyId,
      amount,
    );
    await method.send({
      from: account,
      gas: await method.estimateGas({ from: account }),
    });
  }

  async tokenIdOfStoryNft(account: string, nftName: string, storyId: string) {
    if (!this.contract) throw new Error('Contract Unavailable');
    const nftSaleContract = await this.getNftSaleContract(storyId);
    const balance = await nftSaleContract.methods.balanceOf(account).call();
    const indexList = _.range(balance);
    const token = [];
    for (const idx of indexList) {
      token.push(
        await nftSaleContract.methods.tokenOfOwnerByIndex(account, idx).call(),
      );
    }
    return token;
  }
}
