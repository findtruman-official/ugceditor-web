import { TempleWallet } from '@temple-wallet/dapp';
import { TezosToolkit } from '@taquito/taquito';
import { ChainType, WalletAutoConnectType, WalletEvents, WalletProvider, WalletType } from '@/wallets/index';
import { message } from 'antd';
import { BN } from '@project-serum/anchor';
import { bytes2Char } from '@taquito/utils';

const TESTNET_RPC_URL = 'https://rpc.jakartanet.teztnets.xyz';

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
      this.onConnect = onConnect || (() => {});
      this.onDisconnect = onDisconnect || (() => {});
      this.onAccountChanged = onAccountChanged || (() => {});
    }
  }


  async isAvailable() {
    return await TempleWallet.isAvailable();
  }

  getProvider<PT>(): PT | undefined | any {
    return new TempleWallet('MyAwesomeDapp');
  }

  openWebsite() {
    window.open('https://chrome.google.com/webstore/detail/temple-tezos-wallet/ookjlbkiijinhpmnjffcofjonbfbgaoc', '_blank', 'noreferrer noopener');
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

    try{
      await this.provider.connect({ name: 'jakartanet', rpc: TESTNET_RPC_URL }, { forcePermission: false });
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

    try{
      return await this.provider.sign(Buffer.from(message).toString("hex"));
    }catch (error) {
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
    const contractStorage = await contract.storage();
    return contractStorage.nextId.toString();
  }

  async getMintDecimals() {
    if (!this.tezos) throw new Error('Provider Unavailable');
    const findsMintContract = await this.tezos.wallet.at(this.findsMintAddress);
    const storage = await findsMintContract.storage();
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
    const _price = price * Math.pow(10, decimals);
    const contract = await this.tezos.wallet.at(this.factoryAddress);
    const _name = escape(metadata.name);
    const _desc = escape(metadata.desc);
    await contract.methods.publishStoryNft(Number(id), _name, metadata.img, _desc, uriPrefix, this.findsMintAddress, _price, total, reserved).send();
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

    //TODO: Before casting, call the Finds contract to check whether the user's Finds balance is sufficient, if not, call onInsufficientFinds
    //TODO: 铸造前调用 Finds 合约查询用户的 Finds 余额是否足够，若不足则调用 onInsufficientFinds 弹窗提示
    // [request:{owne: 'address', token_id: number}, balance: number]

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
    const contractStorage = await contract.storage();
    const nftAddr = await contractStorage.nftMap.get(Number(storyId));

    const storyContractStorage = await contract.storage();
    const storyNftValue = await storyContractStorage.storyNftMap.get(Number(storyId));
    const storyNftTotal = Number(storyNftValue.total);
    const nftAmountArray = new Array(storyNftTotal).fill(1).map((v, i) => ++i);

    const nftContract = await this.tezos.wallet.at(nftAddr);
    const nftContractStorage = await nftContract.storage();
    const BigMap = nftContractStorage.ledger;

    let n = 0;

    for (let i = 0; i < nftAmountArray.length; i++) {
      const token_id = nftAmountArray[i];
      const res = await nftContractStorage.ledger.get({ owner: this.provider.permission.pkh, token_id });
      res && n++;
    }

    console.log('return n = ', n);
    return n;
    // return 'coming soon';
  }


  async createTask(
    storyId: string,
    nftAddress: string,
    cid: string,
    rewards: number[],
  ) {
    return Promise.resolve(undefined);
  }

  async updateTask(storyId: string, taskId: string, cid: string) {
    return Promise.resolve(undefined);
  }

  async cancelTask(storyId: string, taskId: number) {
    return Promise.resolve(undefined);
  }

  async markTaskDone(storyId: string, taskId: number, submitId: number) {
    return Promise.resolve(undefined);
  }

  async createTaskSubmit(storyId: string, taskId: number, cid: string) {
    return Promise.resolve(undefined);
  }

  async withdrawTaskSubmit(storyId: string, taskId: number, submitId: number) {
    return Promise.resolve(undefined);
  }

  async authorReservedNftRest(storyId: string) {
    return 0;
  }

  async claimAuthorReservedNft(storyId: string, amount: number) {
  }

  async tokenIdOfStoryNft(account: string, nftName: string, storyId: string) {
    return [];
  }

  async getNftAddress(storyId: string) {
    return '';
  }

}
