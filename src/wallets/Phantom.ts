import IDL from '@/assets/solana_programs.json';
import {
  WalletAutoConnectType,
  WalletEvents,
  WalletProvider,
  WalletType,
} from '@/wallets/index';
import { AnchorProvider, Program, utils, web3 } from '@project-serum/anchor';
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
      this.provider.on('connect', (publicKey: string) => {
        this.setAutoConnect(WalletAutoConnectType.True);
        onConnect?.(publicKey.toString());
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

  async publishStory(cid: string, factoryAddress: string) {
    const wallet = window.solana;
    const network = clusterApiUrl('devnet');
    const connection = new Connection(network, 'recent');
    const provider = new AnchorProvider(connection, wallet, {
      preflightCommitment: 'recent',
    });
    const programId = new PublicKey(factoryAddress);
    const factoryKey = (
      await PublicKey.findProgramAddress(
        [Buffer.from(utils.bytes.utf8.encode('factory'))],
        programId,
      )
    )[0];

    const program = new Program(IDL as any, programId, provider);

    const factoryAccountData = await program.account.storyFactory.fetch(
      factoryKey,
    );

    const storyId = factoryAccountData.nextId;
    const storyKey = (
      await web3.PublicKey.findProgramAddress(
        [
          Buffer.from(utils.bytes.utf8.encode('story-')),
          storyId.toArrayLike(Uint8Array, 'le', 8),
        ],
        program.programId,
      )
    )[0];

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

    const storyData = await program.account.story.fetch(storyKey);
    console.log('storyData', storyData);
  }
}
