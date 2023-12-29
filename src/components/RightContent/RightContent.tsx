import { GlobalContext, GlobalContextType } from '@/layouts';
import { SelectLang, useIntl } from '@@/plugin-locale';
import { BulbFilled } from '@ant-design/icons';
import { Avatar, Button } from 'antd';
import { useContext } from 'react';
import { useModel } from 'umi';
import styles from './RightContent.less';

export default function RightContent() {
  const { openAIModal, openWalletModal } =
    useContext<GlobalContextType>(GlobalContext);
  const { connectedWallets } = useModel('walletModel');
  const { formatMessage } = useIntl();

  return (
    <div className={styles.container}>
      <Button
        onClick={() => {
          openAIModal();
        }}
        icon={<BulbFilled />}
        type={'primary'}
        shape={'round'}
      >
        {formatMessage({ id: 'header.creation-with-ai' })}
      </Button>
      <div
        onClick={() => {
          openWalletModal();
        }}
        className={styles.wallet}
      >
        {Object.values(connectedWallets).filter((e) => !!e).length > 0 ? (
          <Avatar.Group>
            {Object.values(connectedWallets).map((wallet) =>
              wallet ? (
                <Avatar
                  style={{
                    border: '1px solid #1f1f1f',
                    background: '#1f1f1f',
                    padding: 4,
                  }}
                  key={wallet.walletType}
                  src={wallet.icon}
                />
              ) : undefined,
            )}
          </Avatar.Group>
        ) : (
          formatMessage({ id: 'header.connect-wallet' })
        )}
      </div>
      <SelectLang />
    </div>
  );
}
