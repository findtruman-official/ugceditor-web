import {
  ChainType,
  WalletAutoConnectType,
  WalletEvents,
  WalletProvider,
  WalletType,
} from '@/wallets/index';
import BigNumber from 'bignumber.js';
import { TezosToolkit } from '@taquito/taquito';
import { bytes2Char } from '@taquito/utils';
import { TempleWallet } from '@temple-wallet/dapp';
import { message } from 'antd';

const TESTNET_RPC_URL = 'https://ghostnet.tezos.marigold.dev/';

export class TempleWalletProvider implements WalletProvider {
  providerType: WalletType = WalletType.Temple;
  chainType: ChainType = ChainType.Tezos;
  provider: any;
  factoryAddress: string = '';
  findsMintAddress: string = '';
  tezos?: TezosToolkit;

  onConnect?: (payload: { address: string; pubKey?: string }) => void;
  onDisconnect?: () => void;
  onAccountChanged?: (payload: { address: string; pubKey?: string }) => void;

  constructor(
    { onConnect, onDisconnect, onAccountChanged, onChainChanged }: WalletEvents,
    factoryAddress: string,
    findsMintAddress: string,
  ) {
    this.factoryAddress = factoryAddress;
    this.findsMintAddress = findsMintAddress;
    this.provider = this.getProvider<TempleWallet>();
    if (this.provider) {
      this.tezos = new TezosToolkit(TESTNET_RPC_URL);
      this.tezos.setWalletProvider(this.provider);
      this.onConnect = onConnect || (() => {
      });
      this.onDisconnect = onDisconnect || (() => {
      });


    }
  }


  async isAvailable() {
    return await TempleWallet.isAvailable();
  }

  getProvider<PT>(): PT | undefined | any {
    return new TempleWallet('JakartanetDapp');
  }

  openWebsite() {
    window.open(
      'https://chrome.google.com/webstore/detail/temple-tezos-wallet/ookjlbkiijinhpmnjffcofjonbfbgaoc',
      '_blank',
      'noreferrer noopener',
    );
  }

  setAutoConnect(autoConnect: WalletAutoConnectType) {
    localStorage.setItem('TEMPLE_AUTO_CONNECT', autoConnect);
  }

  getAutoConnect(): boolean {
    const storage = localStorage.getItem('TEMPLE_AUTO_CONNECT');
    return storage ? storage === WalletAutoConnectType.True : false;
  }

  async silentConnect(): Promise<string | undefined> {
    if (!this.provider) return;
    return await this.connect();
  }

  async connect() {
    if (!this.provider) return;

    try {
      await this.provider.connect(
        { name: 'jakartanet', rpc: TESTNET_RPC_URL },
        { forcePermission: !this.getAutoConnect() },
      );
      const pkh = await this.provider.getPKH();
      const pk = this.provider.permission.publicKey;
      this.onConnect?.({ address: pkh.toString(), pubKey: pk });
      this.setAutoConnect(WalletAutoConnectType.True);
      return pkh.toString();
    } catch (error) {
      message.error((error as any).message);
    }
  }

  async disconnect() {
    if (!this.provider) return;

    this.setAutoConnect(WalletAutoConnectType.False);
    this.onDisconnect?.();
  }

  async signMessage(message: string) {
    if (!this.provider) throw new Error('Provider Unavailable');

    try {
      return await this.provider.sign(Buffer.from(message).toString('hex'));
    } catch (error) {
      console.log(error);
    }
  }

  async updateStory(id: string, cid: string) {
    if (!this.tezos) throw new Error('Provider Unavailable');
    const contract = await this.tezos.wallet.at(this.factoryAddress);
    await contract.methods.updateStory(Number(id), cid).send();
  }

  async publishStory(cid: string) {
    if (!this.tezos) throw new Error('Provider Unavailable');
    const contract = await this.tezos.wallet.at(this.factoryAddress);
    await contract.methods.publishStory(cid).send();
    const contractStorage = (await contract.storage()) as any;
    return contractStorage.nextId.toString();
  }

  async getMintDecimals() {
    if (!this.tezos) throw new Error('Provider Unavailable');
    const findsMintContract = await this.tezos.wallet.at(this.findsMintAddress);
    const storage = (await findsMintContract.storage()) as any;
    const tokenMetadataValue = await storage.assets.token_metadata.get(0);
    const valuesMap = tokenMetadataValue.token_info.valueMap;
    const decimals = valuesMap.find((val: string, key: string) => {
      if (key.substring(1, key.length - 1) === 'decimals') {
        return val;
      }
    });
    return Number(bytes2Char(decimals));
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
    if (!this.factoryAddress) throw new Error('Contract Unavailable');
    if (!this.tezos) throw new Error('Provider Unavailable');

    const decimals = await this.getMintDecimals();
    const _price = new BigNumber(price).times(new BigNumber(10).pow(new BigNumber(decimals)));
    const contract = await this.tezos.wallet.at(this.factoryAddress);
    const _name = escape(metadata.name);
    const _desc = escape(metadata.desc);
    await contract.methods
      .publishStoryNft(
        Number(id),
        _name,
        metadata.img,
        _desc,
        uriPrefix,
        this.findsMintAddress,
        _price,
        total,
        reserved,
      )
      .send();
  }

  async mintStoryNft(
    id: string,
    author: string,
    price: string,
    nftSaleAddr: string,
    onInsufficientFinds?: (account: string, amount: string) => void,
  ) {
    if (!this.factoryAddress) throw new Error('Contract Unavailable');
    if (!this.tezos) throw new Error('Provider Unavailable');

    const findsContract = await this.tezos.wallet.at(this.findsMintAddress);
    const storyContract = await this.tezos.wallet.at(this.factoryAddress);

    const requestsParams = [{ owner: this.provider.permission.pkh, token_id: 0 }];
    const userFindsBalance = (await findsContract.views.balance_of(requestsParams).read())[0].balance.toString();
    const enoughToken = new BigNumber(userFindsBalance).gte(new BigNumber(price));
    if (!enoughToken) {
      const mintDecimals = await this.getMintDecimals();
      onInsufficientFinds?.(
        this.provider.permission.pkh,
        new BigNumber(price)
          .minus(new BigNumber(userFindsBalance))
          .div(new BigNumber(10).pow(new BigNumber(mintDecimals)))
          .toString(),
      );
      throw new Error('Insufficient Finds Token');
    }

    const batchOp = await this.tezos.wallet.batch()
      .withContractCall(findsContract.methods.update_operators([{
        add_operator: {
          owner: this.provider.permission.pkh,
          operator: nftSaleAddr,
          token_id: 0,
        },
      }]))
      .withContractCall(storyContract.methods.mintStoryNft(Number(id)))
      .send();
    await batchOp.confirmation();
  }

  async balanceOfStoryNft(account: number, nftName: string, storyId: string) {
    if (!this.factoryAddress) throw new Error('Contract Unavailable');
    if (!this.tezos) throw new Error('Provider Unavailable');
    const contract = await this.tezos.wallet.at(this.factoryAddress);
    const contractStorage = await contract.storage() as any;
    const nftAddr = await contractStorage.nftMap.get(Number(storyId));
    const nftContract = await this.tezos.wallet.at(nftAddr);
    const storyNftSoldNum = (await contractStorage.storyNftMap.get(Number(storyId))).sold.toString();
    const storyNftAuthorClaimedNum = (await contractStorage.storyNftMap.get(Number(storyId))).authorClaimed.toString();
    const mapList = Number(storyNftSoldNum) + Number(storyNftAuthorClaimedNum);

    const nftMapArray = new Array(mapList).fill(1).map((v, i) => {
      return { owner: this.provider.permission.pkh, token_id: ++i };
    });

    const callbackList = await nftContract.views.balance_of(nftMapArray).read();
    const gotNfts = callbackList.filter((item: any) => {
      return item.balance.toString() > 0;
    });

    return gotNfts.length;
  }

  async restOfStoryNftOnChain(nftName: string, storyId: string) {
    if (!this.tezos) throw new Error('Provider Unavailable');

    const contract = await this.tezos.wallet.at(this.factoryAddress);
    const contractStorage = await contract.storage() as any;
    const storyNftInfo = await contractStorage.storyNftMap.get(Number(storyId));
    return storyNftInfo.total.toString() - storyNftInfo.sold.toString() - storyNftInfo.authorReserve.toString();
  }


  async getNftAddress(storyId: string) {
    const contract = await this.tezos.wallet.at(this.factoryAddress);
    const contractStorage = await contract.storage() as any;
    const nftAddr = await contractStorage.nftMap.get(Number(storyId));
    return nftAddr;
  }

  async createTask(
    storyId: string,
    cid: string,
    nftAddress: string,
    rewards: number[], // 作者的NFT銷售合約 - storage - ledger - KEY/token_id（該NFT作者所擁有的幾個token_id）
  ) {
    if (!this.tezos) throw new Error('Provider Unavailable');

    const nftSaleContract = await this.tezos.wallet.at(nftAddress);
    const contract = await this.tezos.wallet.at(this.factoryAddress);

    const addOperators = rewards.map(item => {
      return {
        add_operator: {
          owner: this.provider.permission.pkh,
          operator: this.factoryAddress,
          token_id: item,
        },
      };
    });

    if (addOperators.length) {
      const batchOp = await this.tezos.wallet.batch()
        .withContractCall(nftSaleContract.methods.update_operators(addOperators))
        .withContractCall(contract.methods.createTask(Number(storyId), cid, nftAddress, rewards))
        .send();
      await batchOp.confirmation();
    } else {
      await contract.methods.createTask(Number(storyId), cid, nftAddress, rewards).send();
    }

  }

  async updateTask(storyId: string, taskId: string, cid: string) {
    if (!this.tezos) throw new Error('Provider Unavailable');
    const contract = await this.tezos.wallet.at(this.factoryAddress);
    await contract.methods.updateTask(Number(storyId), Number(taskId), cid).send();
  }

  async cancelTask(storyId: string, taskId: number) {
    if (!this.tezos) throw new Error('Provider Unavailable');
    const contract = await this.tezos.wallet.at(this.factoryAddress);
    await contract.methods.cancelTask(Number(storyId), taskId).send();
  }

  async markTaskDone(storyId: string, taskId: number, submitId: number) {
    if (!this.tezos) throw new Error('Provider Unavailable');
    const contract = await this.tezos.wallet.at(this.factoryAddress);
    await contract.methods.markTaskDone(Number(storyId), taskId, submitId).send();
  }

  async createTaskSubmit(storyId: string, taskId: number, cid: string) {
    if (!this.tezos) throw new Error('Provider Unavailable');
    const contract = await this.tezos.wallet.at(this.factoryAddress);
    await contract.methods.createTaskSubmit(Number(storyId), taskId, cid).send();
  }

  async withdrawTaskSubmit(storyId: string, taskId: number, submitId: number) {
    if (!this.tezos) throw new Error('Provider Unavailable');
    const contract = await this.tezos.wallet.at(this.factoryAddress);
    await contract.methods.withdrawTaskSubmit(Number(storyId), taskId, submitId).send();
  }


  sleep (milliseconds: number) {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
  }


  async authorReservedNftRest(storyId: string) {
    if (!this.tezos) throw new Error('Provider Unavailable');

    const contract = await this.tezos.wallet.at(this.factoryAddress);
    const contractStorage = await contract.storage() as any;
    let storyNftInfo = await contractStorage.storyNftMap.get(Number(storyId));
    while (!storyNftInfo) {
      storyNftInfo = await contractStorage.storyNftMap.get(Number(storyId));
      await this.sleep(2500);
    }
    return Number(storyNftInfo?.authorReserve) - Number(storyNftInfo?.authorClaimed);
  }

  async claimAuthorReservedNft(storyId: string, amount: number) {
    if (!this.tezos) throw new Error('Provider Unavailable');

    const contract = await this.tezos.wallet.at(this.factoryAddress);
    const contractStorage = await contract.storage() as any;
    const authorClaimed_old = (await contractStorage.storyNftMap.get(Number(storyId))).authorClaimed;
    const rest = await this.authorReservedNftRest(storyId);
    if (rest < amount) return;

    await contract.methods.claimAuthorReservedNft(Number(storyId), amount).send();


    let authorClaimed_new = (await contractStorage.storyNftMap.get(Number(storyId))).authorClaimed;
    while (Number(authorClaimed_old) == Number(authorClaimed_new)) {
      await this.sleep(2500);
      authorClaimed_new = (await contractStorage.storyNftMap.get(Number(storyId))).authorClaimed;
    }
  }

  async tokenIdOfStoryNft(account: string, nftName: string, storyId: string) {
    if (!this.tezos) throw new Error('Provider Unavailable');

    const contract = await this.tezos.wallet.at(this.factoryAddress);
    const contractStorage = await contract.storage() as any;
    const nftSaleAddr = await contractStorage.nftMap.get(Number(storyId));
    const nftSaleContract = await this.tezos.wallet.at(nftSaleAddr);
    const storyNftSoldNum = (await contractStorage.storyNftMap.get(Number(storyId))).sold.toString();
    const storyNftAuthorClaimedNum = (await contractStorage.storyNftMap.get(Number(storyId))).authorClaimed.toString();
    const mapList = Number(storyNftSoldNum) + Number(storyNftAuthorClaimedNum);
    const nftMapArray = new Array(mapList).fill(1).map((v, i) => {
      return { owner: this.provider.permission.pkh, token_id: ++i };
    });
    const callbackList = await nftSaleContract.views.balance_of(nftMapArray).read();
    const gotNfts = callbackList.filter((item: any) => {
      return item.balance.toString() > 0;
    });

    let tokenIds = [];
    for (const nft of gotNfts) {
      tokenIds.push(Number(nft.request.token_id));
    }
    return tokenIds;
  }
}
