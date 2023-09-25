import DfinityLogo from '@/assets/dfinity-logo.svg';
import IRISLogo from '@/assets/iris-logo-full.png';
import KaikasLogo from '@/assets/kaikas-logo.png';
import KlaytnLogo from '@/assets/klaytn-logo.png';
import MetamaskLogo from '@/assets/metamask-logo.png';
import NearLogo from '@/assets/near-logo.svg';
import NearWalletLogo from '@/assets/near-wallet-logo.svg';
import PhantomLogo from '@/assets/phantom-logo.png';
import PlugLogo from '@/assets/plug-logo.png';
import SolanaLogo from '@/assets/solana-logo.svg';
import TempleLogo from '@/assets/temple-logo.png';
import TezosLogo from '@/assets/tezos-logo.svg';
import { ChainType, WalletType } from '@/wallets';

export const ChainLogos: Record<ChainType, string> = {
  [ChainType.Solana]: SolanaLogo,
  [ChainType.Klaytn]: KlaytnLogo,
  [ChainType.Tezos]: TezosLogo,
  [ChainType.Dfinity]: DfinityLogo,
  [ChainType.Near]: NearLogo,
  [ChainType.IRIS]: IRISLogo,
};

export const WalletLogos: Record<WalletType, string> = {
  [WalletType.Phantom]: PhantomLogo,
  [WalletType.Kaikas]: KaikasLogo,
  [WalletType.Temple]: TempleLogo,
  [WalletType.Plug]: PlugLogo,
  [WalletType.NearWallet]: NearWalletLogo,
  [WalletType.Metamask]: MetamaskLogo,
};
