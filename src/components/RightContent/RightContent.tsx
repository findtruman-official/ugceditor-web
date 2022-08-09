import { WalletContext, WalletContextType } from '@/layouts';
import { SelectLang, useIntl } from '@@/plugin-locale';
import { useContext } from 'react';
import { useModel } from 'umi';
import styles from './RightContent.less';

export default function RightContent() {
  const { openWalletModal } = useContext<WalletContextType>(WalletContext);
  const { wallet, shortAccount } = useModel('walletModel');
  const { formatMessage } = useIntl();

  return (
    <div className={styles.container}>
      <div
        onClick={() => {
          openWalletModal();
        }}
        className={styles.wallet}
      >
        {wallet && !!shortAccount ? (
          <>
            <img className={styles.walletIcon} src={wallet.icon} />
            <div>{shortAccount}</div>
          </>
        ) : (
          formatMessage({ id: 'header.connect-wallet' })
        )}
      </div>
      <SelectLang />
    </div>
  );
}
