import PhantomLogo from '@/assets/phantom-logo.png';
import { WalletProvider, WalletType } from '@/wallets';
import { PhantomWalletProvider } from '@/wallets/Phantom';
import { useEffect, useMemo, useState } from 'react';

export default () => {
  const Wallets: {
    name: string;
    icon: string;
    walletType: WalletType;
    provider: WalletProvider;
  }[] = useMemo(
    () => [
      {
        name: 'Phantom',
        icon: PhantomLogo,
        walletType: WalletType.Phantom,
        provider: new PhantomWalletProvider({
          onConnect: (address) => {
            setAccounts((accounts) => ({
              ...accounts,
              [WalletType.Phantom]: address,
            }));
          },
          onDisconnect: () => {
            setAccounts((accounts) => ({
              ...accounts,
              [WalletType.Phantom]: '',
            }));
          },
          onAccountChanged: (address) => {
            setAccounts((accounts) => ({
              ...accounts,
              [WalletType.Phantom]: address,
            }));
          },
        }),
      },
    ],
    [],
  );

  const [connecting, setConnecting] = useState(false);

  const [wallet, setWallet] = useState<{
    name: string;
    icon: string;
    walletType: WalletType;
    provider: WalletProvider;
  }>();
  const [accounts, setAccounts] = useState<Record<WalletType, string>>({
    [WalletType.Phantom]: '',
  });

  const account = useMemo(() => {
    if (wallet) {
      return accounts[wallet.walletType];
    } else {
      return '';
    }
  }, [accounts, wallet]);

  const connect = async (walletType: WalletType) => {
    const _wallet = Wallets.find((w) => w.walletType === walletType);
    if (_wallet) {
      try {
        setConnecting(true);
        await _wallet.provider.connect();
        setWallet(_wallet);
      } catch (e) {
      } finally {
        setConnecting(false);
      }
    }
  };

  useEffect(() => {
    const _wallet = Wallets.find((w) => w.provider.getAutoConnect());
    _wallet?.provider
      .silentConnect()
      .then((address) => {
        setWallet(_wallet);
      })
      .catch((e) => {});
  }, []);

  return {
    Wallets,
    wallet,
    account,
    connect,
    connecting,
  };
};
