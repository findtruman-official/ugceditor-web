import IDL from '@/assets/solana_programs.json';
import {
  WalletAutoConnectType,
  WalletEvents,
  WalletProvider,
  WalletType,
} from '@/wallets/index';
import {
  AnchorProvider,
  BN,
  Program,
  utils,
  web3,
} from '@project-serum/anchor';
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';
import { message } from 'antd';
import { encodeBase64 } from 'tweetnacl-util';

export class PhantomWalletProvider implements WalletProvider {
  providerType: WalletType = WalletType.Phantom;
  provider: any;

  constructor({
    onConnect,
    onDisconnect,
    onAccountChanged,
    onChainChanged,
  }: WalletEvents) {
    this.provider = this.getProvider<any>();
    if (this.provider) {
      this.provider.on('connect', async (publicKey: string) => {
        this.setAutoConnect(WalletAutoConnectType.True);
        onConnect?.(publicKey.toString());

        const wallet = window.solana;
        const network = clusterApiUrl('devnet');
        this.connection = new Connection(network, 'recent');
        this.anchorProvider = new AnchorProvider(this.connection, wallet, {
          preflightCommitment: 'recent',
        });
      });
      this.provider.on('disconnect', () => {
        onDisconnect?.();
      });
      this.provider.on('accountChanged', (publicKey: string) => {
        if (publicKey) {
          onAccountChanged?.(publicKey.toString());
        } else {
          this.connect();
        }
      });
    }
  }

  isAvailable(): boolean {
    return window.phantom?.solana?.isPhantom;
  }

  getProvider<PT>(): PT | undefined {
    if (this.isAvailable()) {
      return window.phantom?.solana;
    }
  }

  openWebsite() {
    window.open('https://phantom.app/', '_blank', 'noreferrer noopener');
  }

  setAutoConnect(autoConnect: WalletAutoConnectType) {
    localStorage.setItem('PHANTOM_AUTO_CONNECT', autoConnect);
  }

  getAutoConnect(): boolean {
    const storage = localStorage.getItem('PHANTOM_AUTO_CONNECT');
    return storage ? storage === WalletAutoConnectType.True : false;
  }

  async silentConnect(): Promise<string | undefined> {
    if (!this.provider) return;
    const resp = await this.provider.connect({ onlyIfTrusted: true });
    return resp.publicKey.toString();
  }

  async connect() {
    if (!this.provider) return;

    try {
      const resp = await this.provider.connect();
      return resp.publicKey.toString();
    } catch (error) {
      message.error((error as any).message);
    }
  }

  async disconnect() {
    if (!this.provider) return;

    await this.provider.disconnect();
    this.setAutoConnect(WalletAutoConnectType.False);
  }

  async signMessage(message: string) {
    if (!this.provider) throw new Error('Provider Unavailable');

    const encodedMessage = new TextEncoder().encode(message);
    const { signature } = await this.provider.signMessage(
      encodedMessage,
      'utf8',
    );
    return encodeBase64(signature);
  }

  connection: any;
  anchorProvider: any;

  async getProgram(factoryAddress: string) {
    const programId = new PublicKey(factoryAddress);
    const factoryKey = (
      await PublicKey.findProgramAddress(
        [Buffer.from(utils.bytes.utf8.encode('factory'))],
        programId,
      )
    )[0];
    const program = new Program(IDL as any, programId, this.anchorProvider);
    return { factoryKey, program };
  }

  async getKey(program: any, storyId: BN, key: 'story-' | 'story-mint-') {
    return (
      await web3.PublicKey.findProgramAddress(
        [
          Buffer.from(utils.bytes.utf8.encode('story-')),
          storyId.toArrayLike(Uint8Array, 'le', 8),
        ],
        program.programId,
      )
    )[0];
  }

  async publishStory(cid: string, factoryAddress: string) {
    const { factoryKey, program } = await this.getProgram(factoryAddress);

    const factoryAccountData = await program.account.storyFactory.fetch(
      factoryKey,
    );
    const storyId = factoryAccountData.nextId;
    const storyKey = await this.getKey(program, storyId, 'story-');

    const { publicKey } = await this.provider.connect();

    await program.methods
      .publishStory(cid) // CID 表示故事内容在IPFS中的ContentId
      .accounts({
        author: publicKey,
        factory: factoryKey,
        story: storyKey,
        systemProgram: web3.SystemProgram.programId, // 采用ChainInfo中的factoryAddress
      })
      // .signers([])
      .rpc({});
  }

  async updateStory(id: number, cid: string, factoryAddress: string) {
    const { program } = await this.getProgram(factoryAddress);

    const storyId = new BN(id);
    const storyKey = await this.getKey(program, storyId, 'story-');

    const { publicKey } = await this.provider.connect();

    await program.methods
      .updateStory(storyId, cid) // CID 表示故事内容在IPFS中的ContentId
      .accounts({
        author: publicKey,
        story: storyKey,
      })
      // .signers([])
      .rpc({});
  }

  async publishStoryNft(
    id: number,
    price: number,
    total: number,
    reserved: number,
    title: string,
    uriPrefix: string,
    factoryAddress: string,
  ) {
    const { program } = await this.getProgram(factoryAddress);
    const _price = new BN(price);
    const _total = new BN(total);
    const _reserved = new BN(reserved);
    const storyId = new BN(id);
    const storyKey = await this.getKey(program, storyId, 'story-');
    const mintStateKey = await this.getKey(program, storyId, 'story-mint-');
    const fromWallet = await this.provider.connect();

    // const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
    //   this.connection,
    //   fromWallet,
    //   mint,
    //   fromWallet.publicKey,
    // );
    //
    // await program.methods
    //   .publishStoryNft(storyId, _price, _total, _reserved, title, uriPrefix)
    //   .accounts({
    //     author: fromWallet.publicKey,
    //     story: storyKey,
    //     mintState: mintStateKey,
    //     findsMint: null,
    //     findsRecvAccount: fromTokenAccount.address,
    //     systemProgram: web3.SystemProgram.programId,
    //   })
    //   // .signers([])
    //   .rpc({});
  }
}
