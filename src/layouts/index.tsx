import WalletModal from '@/components/WalletModal/WalletModal';
import { createContext, useEffect, useState } from 'react';
import { Outlet } from 'umi';

export interface WalletContextType {
  openWalletModal: () => void;
}

export const WalletContext = createContext<WalletContextType>({
  openWalletModal: () => {},
});

export default function Layout() {
  const [walletModalVisible, setWalletModalVisible] = useState(false);

  useEffect(() => {
    // const wallet = new PhantomWalletProvider({});
    // if (wallet.isAvailable() && wallet.getAutoConnect()) {
    //   wallet.silentConnect();
    // }
    // setWallet(wallet);
  }, []);

  return (
    <WalletContext.Provider
      value={{ openWalletModal: () => setWalletModalVisible(true) }}
    >
      <WalletModal
        visible={walletModalVisible}
        onClose={() => setWalletModalVisible(false)}
      />
      <Outlet />
    </WalletContext.Provider>
  );
}
