import PhantomLogo from '@/assets/phantom-logo.png';
import { getChains } from '@/services/api';
import { shortenAccount } from '@/utils/format';
import {
  getTokenFromStorage,
  getTokenMessage,
  refreshToken,
} from '@/utils/token';
import { WalletProvider, WalletType } from '@/wallets';
import { PhantomWalletProvider } from '@/wallets/Phantom';
import { useRequest } from 'ahooks';
import { useCallback, useEffect, useMemo, useState } from 'react';

export default () => {
  const [connecting, setConnecting] = useState(false);

  const { data: chains } = useRequest(async () => {
    return (await getChains()).chains;
  });
  const [wallet, setWallet] = useState<{
    name: string;
    icon: string;
    walletType: WalletType;
    provider: WalletProvider;
  }>();
  const [accounts, setAccounts] = useState<Record<WalletType, string>>({
    [WalletType.Phantom]: '',
  });

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

  const account = useMemo(() => {
    if (wallet) {
      return accounts[wallet.walletType];
    } else {
      return '';
    }
  }, [accounts, wallet]);
  const shortAccount = useMemo(() => {
    return shortenAccount(account);
  }, [account]);

  const connect = useCallback(
    async (walletType: WalletType) => {
      const _wallet = Wallets.find((w) => w.walletType === walletType);
      if (_wallet) {
        if (_wallet.provider.isAvailable()) {
          try {
            setConnecting(true);
            await _wallet.provider.connect();
            setWallet(_wallet);
          } catch (e) {
          } finally {
            setConnecting(false);
          }
        } else {
          _wallet.provider.openWebsite();
        }
      }
    },
    [Wallets],
  );

  const disconnect = useCallback(async () => {
    if (wallet) {
      const type = wallet.walletType;
      await wallet.provider.disconnect();
      setWallet(undefined);
      for (const _wallet of Wallets) {
        if (_wallet.walletType !== type && !!accounts[_wallet.walletType]) {
          setWallet(_wallet);
        }
      }
    }
  }, [wallet]);

  useEffect(() => {
    for (const _wallet of Wallets) {
      if (_wallet.provider.getAutoConnect()) {
        _wallet?.provider.silentConnect().then(() => {
          !wallet && setWallet(_wallet);
        });
      }
    }
  }, []);

  const { data: token } = useRequest(
    async () => {
      if (chains && chains.length > 0 && !!account && wallet) {
        const chain = chains[0].type;
        const token = await getTokenFromStorage(account, chain);
        if (!token) {
          const message = getTokenMessage();
          const signature = await wallet.provider.signMessage(message);
          return refreshToken(account, chain, message, signature);
        } else {
          return token;
        }
      }
    },
    {
      refreshDeps: [chains, account, wallet],
    },
  );

  return {
    Wallets,
    wallet,
    accounts,
    account,
    shortAccount,
    connect,
    connecting,
    disconnect,
    token,
    chains,
  };
};
