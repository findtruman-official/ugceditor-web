import {
  ChainType,
  WalletAutoConnectType,
  WalletEvents,
  WalletProvider,
  WalletType,
} from '@/wallets/index';

import ABI from '@/assets/eth_abi.json';
import FINDS_ABI from '@/assets/eth_finds_abi.json';
import NFT_ABI from '@/assets/eth_nft_abi.json';
import { message } from 'antd';
import BigNumber from 'bignumber.js';
import * as _ from 'lodash';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';

const ChainInfo =
  process.env.NODE_ENV === 'production'
    ? {
        chainId: '0x1a20',
        rpcUrls: [
          'https://iris-evm.publicnode.com',
          'https://evmrpc.irishub-1.irisnet.org',
        ],
        chainName: 'IRIShub',
        nativeCurrency: {
          name: 'ERIS',
          symbol: 'ERIS',
          decimals: 18,
        },
        blockExplorerUrls: ['https://irishub.iobscan.io'],
      }
    : {
        chainId: '0x4130',
        rpcUrls: ['https://evmrpc.nyancat.irisnet.org'],
        chainName: 'IRIShub Testnet',
        nativeCurrency: {
          name: 'ERIS',
          symbol: 'ERIS',
          decimals: 18,
        },
        blockExplorerUrls: ['https://nyancat.iobscan.io'],
      };

export class MetamaskWalletProvider implements WalletProvider {
  providerType: WalletType = WalletType.Metamask;
  chainType: ChainType = ChainType.IRIS;
  provider: any;
  web3?: Web3;
  contract?: Contract;
  findsContract?: Contract;
  account: string = '';
  factoryAddress: string = '';
  findsMintAddress: string = '';

  onConnect?: (payload: { address: string; pubKey?: string }) => void;
  onDisconnect?: () => void;
  onAccountChanged?: (payload: { address: string; pubKey?: string }) => void;
  onChainChanged?: (chainId: string) => void;

  constructor(
    { onConnect, onDisconnect, onAccountChanged, onChainChanged }: WalletEvents,
    factoryAddress: string,
    findsMintAddress: string,
  ) {
    this.factoryAddress = factoryAddress;
    this.findsMintAddress = findsMintAddress;
    this.provider = this.getProvider<any>();

    if (this.isAvailable()) {
      this.web3 = new Web3(window.ethereum);
      this.contract = new this.web3!.eth.Contract(ABI as any, factoryAddress);
      this.findsContract = new this.web3!.eth.Contract(
        FINDS_ABI as any,
        findsMintAddress,
      );

      this.onConnect = onConnect || (() => {});
      this.onDisconnect = onDisconnect || (() => {});
      this.onAccountChanged = onAccountChanged || (() => {});
      this.onChainChanged = onChainChanged || (() => {});

      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          this.onDisconnect?.();
        } else {
          this.account = accounts[0];
          onAccountChanged?.({ address: accounts[0] });
        }
      });
      window.ethereum.on('chainChanged', (chainId: string) => {
        const _chainId = parseInt(chainId, 16).toString();
        this.onChainChanged?.(_chainId);
      });
    }
  }

  getProvider<T>(): T | undefined {
    return window.ethereum as any;
  }

  isAvailable(): boolean {
    return window.ethereum && window.ethereum.isMetaMask;
  }

  openWebsite() {
    window.open(
      'https://metamask.io/download/',
      '_blank',
      'noreferrer noopener',
    );
  }

  setAutoConnect(autoConnect: WalletAutoConnectType) {
    localStorage.setItem('METAMASK_AUTO_CONNECT', autoConnect);
  }

  getAutoConnect(): boolean {
    const storage = localStorage.getItem('METAMASK_AUTO_CONNECT');
    return storage ? storage === WalletAutoConnectType.True : false;
  }

  async connect() {
    if (!this.isAvailable()) return;

    try {
      if (!window.ethereum.isConnected()) {
        await window.ethereum.connect();
      }
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      this.account = accounts[0];
      this.onConnect!({ address: accounts[0] });
      this.setAutoConnect(WalletAutoConnectType.True);
      return accounts[0];
    } catch (error) {
      message.error((error as any).message);
      return '';
    }
  }

  async disconnect() {
    this.setAutoConnect(WalletAutoConnectType.False);
    this.onDisconnect?.();
  }

  async silentConnect() {
    if (!this.isAvailable()) return;

    const accounts = await window.ethereum.request({
      method: 'eth_accounts',
    });
    if (accounts && accounts.length > 0) {
      return await this.connect();
    }
  }

  async checkChain() {
    if (!this.provider) return false;

    try {
      await this.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ChainInfo.chainId }],
      });
      return true;
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await this.provider.request({
            method: 'wallet_addEthereumChain',
            params: [ChainInfo],
          });
          await this.provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: ChainInfo.chainId }],
          });
          return true;
        } catch (addError) {
          return false;
        }
      }
      return false;
    }
  }

  async signMessage(message: string) {
    if (!this.web3) throw new Error('Provider Unavailable');
    return await this.web3.eth.personal.sign(message, this.account, '');
  }

  async getNftAddress(storyId: string) {
    const sales = await this.contract!.methods.sales(storyId).call();
    return sales?.nft || '';
  }

  async getNftSaleContract(storyId: string) {
    const nftAddress = await this.getNftAddress(storyId);
    return new this.web3!.eth.Contract(NFT_ABI as any, nftAddress);
  }

  async balanceOfStoryNft(account: string, nftName: string, storyId: string) {
    if (!(await this.checkChain())) return 0;

    const nftSaleContract = (await this.getNftSaleContract(storyId)) as any;
    return parseInt(await nftSaleContract.methods.balanceOf(account).call());
  }

  async restOfStoryNftOnChain(nftName: string, storyId: string) {
    if (!this.contract) throw new Error('Contract Unavailable');
    if (!(await this.checkChain())) return 0;

    const { authorReserved, total, sold } = await this.contract.methods
      .sales(storyId)
      .call();
    return total - authorReserved - sold;
  }

  async getMintDecimals() {
    // return await this.findsContract!.methods.decimals().call();
    return 18;
  }

  async mintStoryNft(
    id: string,
    author: string,
    price: string,
    nftSaleAddr: string,
    onInsufficientFinds?: (account: string, amount: string) => void,
  ) {
    if (!this.contract) throw new Error('Contract Unavailable');
    if (!(await this.checkChain())) throw new Error('Error network');

    // const priceBN = new BigNumber(price);

    // const tokenAmount = await this.findsContract!.methods.balanceOf(
    //   this.account,
    // ).call();
    // const enoughToken = new BigNumber(tokenAmount).gte(priceBN);
    // if (!enoughToken) {
    //   const mintDecimals = await this.getMintDecimals();
    //   onInsufficientFinds?.(
    //     this.account,
    //     new BigNumber(price)
    //       .minus(new BigNumber(tokenAmount))
    //       .div(new BigNumber(10).pow(new BigNumber(mintDecimals)))
    //       .toString(),
    //   );
    //   throw new Error('Insufficient Finds Token');
    // }
    //
    // const allowance = await this.findsContract!.methods.allowance(
    //   this.account,
    //   nftSaleAddr,
    // ).call();
    // const enoughAllowance = new BigNumber(allowance).gte(priceBN);
    // if (!enoughAllowance) {
    //   let toApprove = '500000000000000000000';
    //   if (priceBN.gte(new BigNumber(toApprove))) {
    //     toApprove = price;
    //   }
    //   const approveMethod = this.findsContract!.methods.approve(
    //     nftSaleAddr,
    //     toApprove,
    //   );
    //   await approveMethod.send({
    //     from: this.account,
    //     // gas: await approveMethod.estimateGas({ from: author }),
    //     gas: '100000',
    //   });
    // }

    const method = this.contract!.methods.mintStoryNft(id);
    await method.send({
      from: this.account,
      gas: await method.estimateGas({ from: this.account }),
      value: price,
    });
  }

  async publishStory(cid: string) {
    if (!this.contract) throw new Error('Contract Unavailable');
    if (!(await this.checkChain())) throw new Error('Error network');

    const method = this.contract.methods.publishStory(cid);
    // const method = this.contract.methods['0xbbaaa499'](cid);
    const storyId = await this.contract.methods.nextId().call();
    await method.send({
      from: this.account,
      gas: await method.estimateGas({ from: this.account }),
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
    if (!(await this.checkChain())) throw new Error('Error network');

    const decimals = await this.getMintDecimals();
    const _price = new BigNumber(price)
      .times(new BigNumber(10).pow(new BigNumber(decimals)))
      .toString();
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
      from: this.account,
      gas: await method.estimateGas({ from: this.account }),
    });
  }

  async updateStory(id: string, cid: string) {
    if (!this.contract) throw new Error('Contract Unavailable');
    if (!(await this.checkChain())) throw new Error('Error network');

    const method = this.contract.methods.updateStory(id, cid);
    await method.send({
      from: this.account,
      gas: await method.estimateGas({ from: this.account }),
    });
  }

  async createTask(
    storyId: string,
    cid: string,
    nftAddress: string,
    rewards: number[],
  ) {
    if (!this.contract) throw new Error('Contract Unavailable');
    if (!(await this.checkChain())) throw new Error('Error network');

    const nftSaleContract = (await this.getNftSaleContract(storyId)) as any;
    if (parseInt(nftSaleContract._address) !== 0) {
      const isApprovedForAll = await nftSaleContract.methods
        .isApprovedForAll(this.account, this.factoryAddress)
        .call();
      if (!isApprovedForAll) {
        const approveMethod = nftSaleContract.methods.setApprovalForAll(
          this.factoryAddress,
          true,
        );
        await approveMethod.send({
          from: this.account,
          gas: await approveMethod.estimateGas({ from: this.account }),
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
      from: this.account,
      gas: await method.estimateGas({ from: this.account }),
    });
  }

  async updateTask(storyId: string, taskId: string, cid: string) {
    if (!this.contract) throw new Error('Contract Unavailable');
    if (!(await this.checkChain())) throw new Error('Error network');

    const method = this.contract.methods.updateTask(storyId, taskId, cid);
    await method.send({
      from: this.account,
      gas: await method.estimateGas({ from: this.account }),
    });
  }

  async cancelTask(storyId: string, taskId: number) {
    if (!this.contract) throw new Error('Contract Unavailable');
    if (!(await this.checkChain())) throw new Error('Error network');

    const method = this.contract.methods.cancelTask(storyId, taskId);
    await method.send({
      from: this.account,
      gas: await method.estimateGas({ from: this.account }),
    });
  }

  async markTaskDone(storyId: string, taskId: number, submitId: number) {
    if (!this.contract) throw new Error('Contract Unavailable');
    if (!(await this.checkChain())) throw new Error('Error network');

    const method = this.contract.methods.markTaskDone(
      storyId,
      taskId,
      submitId,
    );
    await method.send({
      from: this.account,
      gas: await method.estimateGas({ from: this.account }),
    });
  }

  async createTaskSubmit(storyId: string, taskId: number, cid: string) {
    if (!this.contract) throw new Error('Contract Unavailable');
    if (!(await this.checkChain())) throw new Error('Error network');

    const method = this.contract.methods.createTaskSubmit(storyId, taskId, cid);
    await method.send({
      from: this.account,
      gas: await method.estimateGas({ from: this.account }),
    });
  }

  async withdrawTaskSubmit(storyId: string, taskId: number, submitId: number) {
    if (!this.contract) throw new Error('Contract Unavailable');
    if (!(await this.checkChain())) throw new Error('Error network');

    const method = this.contract.methods.withdrawTaskSubmit(
      storyId,
      taskId,
      submitId,
    );
    await method.send({
      from: this.account,
      gas: await method.estimateGas({ from: this.account }),
    });
  }

  async authorReservedNftRest(storyId: string) {
    if (!this.contract) throw new Error('Contract Unavailable');
    if (!(await this.checkChain())) return 0;

    const { authorReserved, authorClaimed } = await this.contract.methods
      .sales(storyId)
      .call();
    return authorReserved - authorClaimed;
  }

  async claimAuthorReservedNft(storyId: string, amount: number) {
    if (!this.contract) throw new Error('Contract Unavailable');
    if (!(await this.checkChain())) throw new Error('Error network');

    const rest = await this.authorReservedNftRest(storyId);
    if (rest < amount) return;

    const method = this.contract.methods.claimAuthorReservedNft(
      storyId,
      amount,
    );
    await method.send({
      from: this.account,
      gas: await method.estimateGas({ from: this.account }),
    });
  }

  async tokenIdOfStoryNft(account: string, nftName: string, storyId: string) {
    if (!this.contract) throw new Error('Contract Unavailable');
    if (!(await this.checkChain())) return [];

    const nftSaleContract = (await this.getNftSaleContract(storyId)) as any;
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
