import { getChains } from '@/services/api';
import { ChainLogos, WalletLogos } from '@/utils/logos';
import {
  getTokenFromStorage,
  getTokenMessage,
  refreshToken,
} from '@/utils/token';
import { ChainType, WalletProvider, WalletType } from '@/wallets';
import { KaikasWalletProvider } from '@/wallets/Kaikas';
import { PhantomWalletProvider } from '@/wallets/Phantom';
import { TempleWalletProvider } from '@/wallets/Temple';
import { useRequest } from 'ahooks';
import { useCallback, useEffect, useMemo, useState } from 'react';

export interface ChainWallet {
  chainType: ChainType;
  icon: string;
  wallets: Wallet[];
}

interface Wallet {
  name: string;
  icon: string;
  walletType: WalletType;
  provider: WalletProvider;
}

export default () => {
  const [connecting, setConnecting] = useState(false);

  const { data: chains } = useRequest(async () => {
    return (await getChains()).chains;
  });

  const [connectedWallets, setConnectedWallets] = useState<
    Record<ChainType, Wallet | undefined>
  >({
    [ChainType.Solana]: undefined,
    [ChainType.Klaytn]: undefined,
    [ChainType.Tezos]: undefined,
  });

  const [accounts, setAccounts] = useState<Record<ChainType, string>>({
    [ChainType.Solana]: '',
    [ChainType.Klaytn]: '',
    [ChainType.Tezos]: '',
  });

  const [pubKeys, setPubKeys] = useState<Record<ChainType, string>>({
    [ChainType.Solana]: '',
    [ChainType.Klaytn]: '',
    [ChainType.Tezos]: '',
  });

  const getWalletEvents = (walletType: WalletType) => {
    return {
      onConnect: (payload: { address: string; pubKey?: string }) => {
        const { address, pubKey } = payload;
        const chainType = getChainType(walletType);
        setAccounts((accounts) => ({
          ...accounts,
          [chainType]: address,
        }));
        setPubKeys((pubKeys) => ({
          ...pubKeys,
          [chainType]: pubKey || '',
        }));
        setConnectedWallets((state) => ({
          ...state,
          [chainType]: wallets.find((w) => w.walletType === walletType)!!,
        }));
      },
      onDisconnect: () => {
        const chainType = getChainType(walletType);
        setAccounts((accounts) => ({
          ...accounts,
          [chainType]: '',
        }));
        setConnectedWallets((state) => ({
          ...state,
          [chainType]: undefined,
        }));
      },
      onAccountChanged: (payload: { address: string; pubKey?: string }) => {
        const { address, pubKey } = payload;
        const chainType = getChainType(walletType);
        setAccounts((accounts) => ({
          ...accounts,
          [chainType]: address,
        }));
        setPubKeys((pubKeys) => ({
          ...pubKeys,
          [chainType]: pubKey || '',
        }));
      },
    };
  };

  const chainWallets: ChainWallet[] = useMemo(() => {
    if (!chains || chains.length === 0) return [];

    const _chainWallets: ChainWallet[] = [];
    const solanaChainInfo = chains.find((c) => c.type === ChainType.Solana);
    solanaChainInfo &&
      _chainWallets.push({
        chainType: ChainType.Solana,
        icon: ChainLogos[ChainType.Solana],
        wallets: [
          {
            name: 'Phantom',
            icon: WalletLogos[WalletType.Phantom],
            walletType: WalletType.Phantom,
            provider: new PhantomWalletProvider(
              getWalletEvents(WalletType.Phantom),
              solanaChainInfo.factoryAddress,
              solanaChainInfo.findsAddress,
            ),
          },
        ],
      });

    const klaytnChainInfo = chains.find((c) => c.type === ChainType.Klaytn);
    klaytnChainInfo &&
      _chainWallets.push({
        chainType: ChainType.Klaytn,
        icon: ChainLogos[ChainType.Klaytn],
        wallets: [
          {
            name: 'Kaikas',
            icon: WalletLogos[WalletType.Kaikas],
            walletType: WalletType.Kaikas,
            provider: new KaikasWalletProvider(
              getWalletEvents(WalletType.Kaikas),
              klaytnChainInfo.factoryAddress,
              klaytnChainInfo.findsAddress,
            ),
          },
        ],
      });

    const tezosChainInfo = chains.find((c) => c.type === ChainType.Tezos);
    tezosChainInfo &&
      _chainWallets.push({
        chainType: ChainType.Tezos,
        icon: ChainLogos[ChainType.Tezos],
        wallets: [
          {
            name: 'Temple',
            icon: WalletLogos[WalletType.Temple],
            walletType: WalletType.Temple,
            provider: new TempleWalletProvider(
              getWalletEvents(WalletType.Temple),
              tezosChainInfo.factoryAddress,
              tezosChainInfo.findsAddress,
            ),
          },
        ],
      });

    return _chainWallets;
  }, [chains]);

  const getChainType = useCallback(
    (walletType: WalletType) => {
      return chainWallets.find((chainWallet) =>
        chainWallet.wallets.find((wallet) => wallet.walletType === walletType),
      )!!.chainType;
    },
    [chainWallets],
  );

  const wallets = useMemo(() => {
    let wallets: Wallet[] = [];
    for (const cw of chainWallets) {
      wallets = [...wallets, ...cw.wallets];
    }
    return wallets;
  }, [chainWallets]);

  // const account = useMemo(() => {
  //   if (wallet) {
  //     return accounts[wallet.walletType];
  //   } else {
  //     return '';
  //   }
  // }, [accounts, wallet]);
  // const shortAccount = useMemo(() => {
  //   return shortenAccount(account);
  // }, [account]);

  const connect = useCallback(
    async (walletType: WalletType) => {
      const _wallet = wallets.find((w) => w.walletType === walletType);
      if (_wallet) {
        if (await _wallet.provider.isAvailable()) {
          try {
            setConnecting(true);
            await _wallet.provider.connect();
          } catch (e) {
          } finally {
            setConnecting(false);
          }
        } else {
          _wallet.provider.openWebsite();
        }
      }
    },
    [wallets],
  );

  const disconnect = useCallback(
    async (chainType: ChainType) => {
      const wallet = connectedWallets[chainType];
      await wallet?.provider.disconnect();
    },
    [connectedWallets],
  );

  useEffect(() => {
    for (const _wallet of wallets) {
      if (_wallet.provider.getAutoConnect()) {
        _wallet?.provider.silentConnect();
      }
    }
  }, [chainWallets]);

  // const { data: tokens } = useRequest(
  //   async () => {
  //     const tokens: Record<string, string> = {};
  //     for (const wallet of connectedWallets) {
  //       const chainType = getChainType(wallet.walletType);
  //       const account = accounts[chainType];
  //       let token = getTokenFromStorage(account, chainType);
  //       if (!token) {
  //         const message = getTokenMessage();
  //         const signature = await wallet.provider.signMessage(message);
  //         token = await refreshToken(account, chainType, message, signature);
  //       } else {
  //         return token;
  //       }
  //     }
  //   },
  //   {
  //     refreshDeps: [connectedWallets, accounts],
  //   },
  // );

  const getToken = useCallback(
    (chainType: ChainType) => {
      if (!chainType) return;
      const account = accounts[chainType];
      if (!account) {
        return '';
      } else {
        return getTokenFromStorage(account, chainType);
      }
    },
    [accounts, connectedWallets],
  );

  const getTokenAsync = useCallback(
    async (chainType: ChainType, refresh = false) => {
      if (!chainType) return;
      const account = accounts[chainType];
      const pubKey = pubKeys[chainType];
      if (!account) {
        return '';
      } else {
        const token = getTokenFromStorage(account, chainType);
        if (!token && refresh) {
          const message = getTokenMessage();
          const wallet = connectedWallets[chainType];
          if (!wallet) {
            return '';
          }
          const signature = await wallet.provider.signMessage(message);
          return await refreshToken(
            account,
            chainType,
            message,
            pubKey,
            signature,
          );
        }
        return token;
      }
    },
    [accounts, connectedWallets],
  );

  return {
    chainWallets,
    connectedWallets,
    wallets,
    accounts,
    // account,
    // shortAccount,
    connect,
    connecting,
    disconnect,
    getToken,
    getTokenAsync,
    chains,
  };
};
