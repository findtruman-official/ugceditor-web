import Header from '@/components/Header/Header';
import LoginConfirmModal from '@/components/LoginConfirmModal/LoginConfirmModal';
import WalletModal from '@/components/WalletModal/WalletModal';
import { ChainType } from '@/wallets';
import { createContext, useState } from 'react';
import { Outlet } from 'umi';

export interface WalletContextType {
  openWalletModal: () => void;
  confirmLogin: (
    chainType: ChainType,
    callbacks?: {
      onConfirm?: (token: string) => void;
      onReject?: () => void;
    },
  ) => Promise<string | undefined>;
}

export const WalletContext = createContext<WalletContextType>({
  openWalletModal: () => {},
  confirmLogin: async (chainType) => {
    return undefined;
  },
});

export default function Layout() {
  const [walletModalVisible, setWalletModalVisible] = useState(false);
  const [loginState, setLoginState] = useState<
    | {
        chainType: ChainType;
        onConfirm: (token: string) => void;
        onReject: () => void;
      }
    | undefined
  >();

  return (
    <WalletContext.Provider
      value={{
        openWalletModal: () => setWalletModalVisible(true),
        confirmLogin: (chainType, callbacks) => {
          return new Promise<string | undefined>((resolve) => {
            setLoginState({
              chainType,
              onConfirm: (token) => {
                setLoginState(undefined);
                callbacks?.onConfirm?.(token);
                resolve(token);
              },
              onReject: () => {
                setLoginState(undefined);
                callbacks?.onReject?.();
                resolve(undefined);
              },
            });
          });
        },
      }}
    >
      <Header />
      <WalletModal
        visible={walletModalVisible}
        onClose={() => setWalletModalVisible(false)}
      />
      <LoginConfirmModal loginState={loginState} />
      <div style={{ height: 32 }} />
      <Outlet />
    </WalletContext.Provider>
  );
}
