import {
  WalletAutoConnectType,
  WalletEvents,
  WalletProvider,
  WalletType,
} from '@/wallets/index';
import { message } from 'antd';

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
    return await this.provider.signMessage(encodedMessage, 'utf8');
  }
}
