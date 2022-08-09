import { WalletContext, WalletContextType } from '@/layouts';
import { PageContainer } from '@ant-design/pro-components';
import { Button } from 'antd';
import React, { useContext } from 'react';
import styles from './index.less';

const Stories: React.FC = () => {
  const { openWalletModal } = useContext<WalletContextType>(WalletContext);
  return (
    <PageContainer title={false} ghost>
      <div className={styles.container}>stories</div>
      <Button onClick={openWalletModal}>connect wallet</Button>
    </PageContainer>
  );
};

export default Stories;
