import KaikasLogo from '@/assets/kaikas-logo.png';
import KlaytnLogo from '@/assets/klaytn-logo.png';
import PhantomLogo from '@/assets/phantom-logo.png';
import SolanaLogo from '@/assets/solana-logo.svg';
import { ChainType, WalletType } from '@/wallets';

export const ChainLogos: Record<ChainType, string> = {
  [ChainType.Solana]: SolanaLogo,
  [ChainType.Klaytn]: KlaytnLogo,
};

export const WalletLogos: Record<WalletType, string> = {
  [WalletType.Phantom]: PhantomLogo,
  [WalletType.Kaikas]: KaikasLogo,
};
