import Header from '@/components/Header/Header';
import WalletModal from '@/components/WalletModal/WalletModal';
import { createContext, useState } from 'react';
import { Outlet } from 'umi';

export interface WalletContextType {
  openWalletModal: () => void;
}

export const WalletContext = createContext<WalletContextType>({
  openWalletModal: () => {},
});

export default function Layout() {
  const [walletModalVisible, setWalletModalVisible] = useState(false);

  return (
    <WalletContext.Provider
      value={{ openWalletModal: () => setWalletModalVisible(true) }}
    >
      <Header />
      <WalletModal
        visible={walletModalVisible}
        onClose={() => setWalletModalVisible(false)}
      />
      <Outlet />
    </WalletContext.Provider>
  );
}
