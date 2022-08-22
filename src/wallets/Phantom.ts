import {
  ChainType,
  WalletAutoConnectType,
  WalletEvents,
  WalletProvider,
  WalletType,
} from '@/wallets/index';
import {
  keypairIdentity,
  Metaplex,
  TokenMetadataProgram,
} from '@metaplex-foundation/js';
import {
  AnchorProvider,
  BN,
  Program,
  utils,
  web3,
} from '@project-serum/anchor';
import {
  Account,
  createAssociatedTokenAccountInstruction,
  getAccount,
  getAssociatedTokenAddress,
  getMint,
} from '@solana/spl-token';
import {
  clusterApiUrl,
  Connection,
  Keypair,
  PublicKey,
  Signer,
  Transaction,
} from '@solana/web3.js';
import { message } from 'antd';
import { encodeBase64 } from 'tweetnacl-util';
import { IDL, SolanaPrograms } from './types/solana-program';

/** Address of the SPL Token program */
const TOKEN_PROGRAM_ID = new PublicKey(
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
);

/** Address of the SPL Associated Token Account program */
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey(
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
);

export class PhantomWalletProvider implements WalletProvider {
  providerType: WalletType = WalletType.Phantom;
  chainType: ChainType = ChainType.Solana;
  provider: any;
  factoryAddress: string = '';
  findsMintAddress: string = '';

  constructor(
    { onConnect, onDisconnect, onAccountChanged, onChainChanged }: WalletEvents,
    factoryAddress: string,
    findsMintAddress: string,
  ) {
    this.factoryAddress = factoryAddress;
    this.findsMintAddress = findsMintAddress;
    this.provider = this.getProvider<any>();
    if (this.provider) {
      this.provider.on('connect', async (publicKey: string) => {
        this.setAutoConnect(WalletAutoConnectType.True);
        onConnect?.(publicKey.toString());

        const wallet = window.solana;
        const network = clusterApiUrl('devnet');
        this.connection = new Connection(network, 'finalized');
        this.anchorProvider = new AnchorProvider(this.connection, wallet, {
          preflightCommitment: 'finalized',
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

  async getProgram() {
    const programId = new PublicKey(this.factoryAddress);
    const factoryKey = (
      await PublicKey.findProgramAddress(
        [Buffer.from(utils.bytes.utf8.encode('factory'))],
        programId,
      )
    )[0];
    const program = new Program<SolanaPrograms>(
      IDL as any,
      programId,
      this.anchorProvider,
    );
    return { factoryKey, program };
  }

  async getKey(program: any, storyId: BN, key: 'story-' | 'story-mint-') {
    return (
      await web3.PublicKey.findProgramAddress(
        [
          Buffer.from(utils.bytes.utf8.encode(key)),
          storyId.toArrayLike(Uint8Array, 'le', 8),
        ],
        program.programId,
      )
    )[0];
  }

  async publishStory(cid: string) {
    const { factoryKey, program } = await this.getProgram();

    const factoryAccountData = await program.account.storyFactory.fetch(
      factoryKey,
    );
    const storyId = factoryAccountData.nextId;
    const storyKey = await this.getKey(program, storyId, 'story-');

    const { publicKey } = await this.provider.connect();

    await program.methods
      .publishStory(cid)
      .accounts({
        author: publicKey,
        factory: factoryKey,
        story: storyKey,
        systemProgram: web3.SystemProgram.programId,
      })
      // .signers([])
      .rpc({});

    return storyId.toString();
  }

  async updateStory(id: string, cid: string) {
    const { program } = await this.getProgram();

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

  async getOrCreateAssociatedTokenAccount(
    connection: Connection,
    payer: Signer,
    mint: PublicKey,
    owner: PublicKey,
  ) {
    const associatedToken = await getAssociatedTokenAddress(mint, owner);
    let account: Account;
    try {
      account = await getAccount(connection, associatedToken, 'confirmed');
    } catch (e) {
      try {
        let recentBlockhash = (await connection.getLatestBlockhash('finalized'))
          .blockhash;
        const transaction = new Transaction({
          recentBlockhash,
          feePayer: payer.publicKey,
        }).add(
          createAssociatedTokenAccountInstruction(
            payer.publicKey,
            associatedToken,
            owner,
            mint,
          ),
        );
        const { signature } = await this.provider.signAndSendTransaction(
          transaction,
        );
        const { value } = await connection.getLatestBlockhashAndContext();
        await connection.confirmTransaction({ signature, ...value });
      } catch (e) {}
      account = await getAccount(connection, associatedToken, 'confirmed');
    }
    return account;
  }

  async getMintDecimals() {
    const findsMint = new PublicKey(this.findsMintAddress);
    return (await getMint(this.connection, findsMint)).decimals;
  }

  async publishStoryNft(
    id: number,
    price: number,
    total: number,
    reserved: number,
    title: string,
    uriPrefix: string,
  ) {
    const { program } = await this.getProgram();

    const findsMint = new PublicKey(this.findsMintAddress);
    const decimals = await this.getMintDecimals();
    const _price = new BN(price).mul(new BN(10).pow(new BN(decimals)));
    const _total = new BN(total);
    const _reserved = new BN(reserved);
    const storyId = new BN(id);
    const storyKey = await this.getKey(program, storyId, 'story-');
    const mintStateKey = await this.getKey(program, storyId, 'story-mint-');
    const fromWallet = await this.provider.connect();
    const fromTokenAccount = await this.getOrCreateAssociatedTokenAccount(
      this.connection,
      fromWallet,
      findsMint,
      fromWallet.publicKey,
    );

    await program.methods
      .publishStoryNft(storyId, _price, _total, _reserved, title, uriPrefix)
      .accounts({
        author: fromWallet.publicKey,
        story: storyKey,
        mintState: mintStateKey,
        findsMint: findsMint,
        findsRecvAccount: fromTokenAccount.address,
        systemProgram: web3.SystemProgram.programId,
      })
      // .signers([])
      .rpc({});
  }

  async getMetadataKey(mint: web3.PublicKey) {
    return (
      await web3.PublicKey.findProgramAddress(
        [
          Buffer.from('metadata'),
          TokenMetadataProgram.publicKey.toBuffer(),
          mint.toBuffer(),
        ],
        TokenMetadataProgram.publicKey,
      )
    )[0];
  }

  async getMasterEditionKey(mint: web3.PublicKey) {
    return (
      await web3.PublicKey.findProgramAddress(
        [
          Buffer.from('metadata'),
          TokenMetadataProgram.publicKey.toBuffer(),
          mint.toBuffer(),
          Buffer.from('edition'),
        ],
        TokenMetadataProgram.publicKey,
      )
    )[0];
  }

  async mintStoryNft(
    id: number,
    author: string,
    price: string,
    onInsufficientFinds?: (account: string, amount: string) => void,
  ) {
    const { program } = await this.getProgram();
    const storyId = new BN(id);
    const storyKey = await this.getKey(program, storyId, 'story-');
    const mintStateKey = await this.getKey(program, storyId, 'story-mint-');
    const minter = await this.provider.connect();
    const findsMint = new PublicKey(this.findsMintAddress);

    const findsSendAccount = await this.getOrCreateAssociatedTokenAccount(
      this.connection,
      minter,
      findsMint,
      minter.publicKey,
    );

    let tokenAmount = (
      await this.connection.getTokenAccountBalance(findsSendAccount.address)
    ).value.amount;
    const enoughToken = new BN(tokenAmount).gte(new BN(price));
    if (!enoughToken) {
      const mintDecimals = await this.getMintDecimals();
      onInsufficientFinds?.(
        findsSendAccount.address.toString(),
        new BN(price)
          .sub(new BN(tokenAmount))
          .div(new BN(10).pow(new BN(mintDecimals)))
          .toString(),
      );
      throw new Error('Insufficient Finds Token');
    }

    const findsRecvAccount = await getAccount(
      this.connection,
      await getAssociatedTokenAddress(findsMint, new PublicKey(author)),
      'finalized',
    );

    const mint = Keypair.generate();
    const tokenAccount = await getAssociatedTokenAddress(
      mint.publicKey,
      minter.publicKey,
    );
    const metadata = await this.getMetadataKey(mint.publicKey);
    const masterEdition = await this.getMasterEditionKey(mint.publicKey);

    await program.methods
      .mintStoryNft(storyId)
      .accounts({
        minter: minter.publicKey,
        story: storyKey,
        mintState: mintStateKey,
        mint: mint.publicKey,
        tokenAccount: tokenAccount,
        findsMint: findsMint,
        findsSendAccount: findsSendAccount.address,
        findsRecvAccount: findsRecvAccount.address,
        metadata: metadata,
        tokenMetadataProgram: TokenMetadataProgram.publicKey,
        masterEdition: masterEdition,
        systemProgram: web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        // rent: new PublicKey(''), // rent
      })
      .signers([mint]) // mint, minter
      .rpc({});
  }

  async balanceOfStoryNft(account: number, name: string) {
    const metaplex = Metaplex.make(this.connection).use(
      keypairIdentity(await this.provider.connect()),
    );
    const nfts = await metaplex
      .nfts()
      .findAllByOwner(new PublicKey(account))
      .run();
    if (!nfts) {
      return 0;
    } else {
      return nfts.filter((e: any) => e.name === name).length;
    }
  }
}
