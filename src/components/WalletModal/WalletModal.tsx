import {
  DisconnectOutlined,
  DownloadOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import { Modal, Spin } from 'antd';
import { useModel } from 'umi';
import styles from './WalletModal.less';

interface WalletModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function WalletModal({ visible, onClose }: WalletModalProps) {
  const {
    Wallets,
    wallet,
    accounts,
    account,
    connect,
    connecting,
    disconnect,
  } = useModel('walletModel');
  return (
    <Modal
      closable={false}
      centered={true}
      visible={visible}
      onCancel={() => {
        if (!connecting) {
          onClose();
        }
      }}
      footer={null}
      width={400}
    >
      <Spin spinning={connecting}>
        {wallet && (
          <div className={styles.currentWalletCol}>
            <img className={styles.currentWalletIcon} src={wallet.icon} />
            <div className={styles.currentWalletAddress}>{account}</div>
            <DisconnectOutlined
              className={styles.disconnectIcon}
              onClick={disconnect}
            />
          </div>
        )}
        {Wallets.map((wallet) => (
          <div
            key={wallet.name}
            className={styles.walletCard}
            onClick={() => {
              connect(wallet.walletType);
            }}
          >
            <img className={styles.walletIcon} src={wallet.icon} />
            <div className={styles.walletName}>{wallet.name}</div>
            {!wallet.provider.isAvailable() ? (
              <DownloadOutlined className={styles.rightIcon} />
            ) : !!accounts[wallet.walletType] ? (
              <LinkOutlined className={styles.rightIcon} />
            ) : null}
          </div>
        ))}
      </Spin>
    </Modal>
  );
}
