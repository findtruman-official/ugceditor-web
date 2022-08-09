import { WalletContext, WalletContextType } from '@/layouts';
import { PageContainer } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Button } from 'antd';
import React, { useContext } from 'react';
import styles from './index.less';

const Stories: React.FC = () => {
  const { name } = useModel('global');
  const { openWalletModal } = useContext<WalletContextType>(WalletContext);
  return (
    <PageContainer title={false} ghost>
      <div className={styles.container}>stories</div>
      <Button onClick={openWalletModal}>connect wallet</Button>
    </PageContainer>
  );
};

export default Stories;
