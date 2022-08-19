import KaikasLogo from '@/assets/kaikas-logo.png';
import KlaytnLogo from '@/assets/klaytn-logo.png';
import PhantomLogo from '@/assets/phantom-logo.png';
import SolanaLogo from '@/assets/solana-logo.svg';
import { getChains } from '@/services/api';
import {
  getTokenFromStorage,
  getTokenMessage,
  refreshToken,
} from '@/utils/token';
import { ChainType, WalletProvider, WalletType } from '@/wallets';
import { KaikasWalletProvider } from '@/wallets/Kaikas';
import { PhantomWalletProvider } from '@/wallets/Phantom';
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

/**
 * 约定：
 *    1. 可以同时连接多个链
 *    2. 一个链同时只连接一个钱包
 */
export default () => {
  const [connecting, setConnecting] = useState(false);

  const { data: chains } = useRequest(async () => {
    return (await getChains()).chains;
  });

  /**
   * 已连接的钱包
   * 一个链同时只存在一个连接的钱包
   */
  const [connectedWallets, setConnectedWallets] = useState<
    Record<ChainType, Wallet | undefined>
  >({
    [ChainType.Solana]: undefined,
    [ChainType.Klaytn]: undefined,
  });
  /**
   * 每个链当前连接的账户，未连接则为空
   */
  const [accounts, setAccounts] = useState<Record<ChainType, string>>({
    [ChainType.Solana]: '',
    [ChainType.Klaytn]: '',
  });

  const getWalletEvents = (walletType: WalletType) => {
    return {
      onConnect: (address: string) => {
        const chainType = getChainType(walletType);
        setAccounts((accounts) => ({
          ...accounts,
          [chainType]: address,
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
      onAccountChanged: (address: string) => {
        const chainType = getChainType(walletType);
        setAccounts((accounts) => ({
          ...accounts,
          [chainType]: address,
        }));
      },
    };
  };

  /**
   * 列出所有支持的链，链所支持的钱包，用于 WalletModal 的显示与调用
   */
  const chainWallets: ChainWallet[] = useMemo(() => {
    if (!chains || chains.length === 0) return [];

    const _chainWallets: ChainWallet[] = [];
    const solanaChainInfo = chains.find((c) => c.type === ChainType.Solana);
    solanaChainInfo &&
      _chainWallets.push({
        chainType: ChainType.Solana,
        icon: SolanaLogo,
        wallets: [
          {
            name: 'Phantom',
            icon: PhantomLogo,
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
        icon: KlaytnLogo,
        wallets: [
          {
            name: 'Kaikas',
            icon: KaikasLogo,
            walletType: WalletType.Kaikas,
            provider: new KaikasWalletProvider(
              getWalletEvents(WalletType.Kaikas),
              klaytnChainInfo.factoryAddress,
              klaytnChainInfo.findsAddress,
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
        if (_wallet.provider.isAvailable()) {
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
  }, []);

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

  /**
   * 获取 token
   */
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

  /**
   * 获取 token
   * @refresh: 如果 localStorage 中未找到 token(或token失效)，是否需要获取
   */
  const getTokenAsync = useCallback(
    async (chainType: ChainType, refresh = false) => {
      if (!chainType) return;
      const account = accounts[chainType];
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
          return await refreshToken(account, chainType, message, signature);
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
