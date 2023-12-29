import { AIImage } from '@/components/AIModal/AIImage';
import { AIText } from '@/components/AIModal/AIText';
import Tabs from '@/components/Tabs/Tabs';
import { ChainType } from '@/wallets';
import { useIntl } from '@@/plugin-locale';
import { useModel } from '@@/plugin-model';
import { useCreation } from 'ahooks';
import { Modal } from 'antd';
import { useState } from 'react';

interface AIModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AIModal({ visible, onClose }: AIModalProps) {
  const { accounts } = useModel('walletModel', (model) => ({
    accounts: model.accounts,
  }));
  const [tab, setTab] = useState<string>('image');
  const { formatMessage } = useIntl();

  const walletAddress = useCreation(() => accounts[ChainType.IRIS], [accounts]);

  return (
    <Modal
      centered={true}
      open={visible}
      onCancel={() => {
        onClose();
      }}
      footer={null}
      width={1000}
      zIndex={1000}
    >
      <Tabs
        style={{
          marginBottom: 24,
        }}
        tabs={[
          {
            label: formatMessage({ id: 'ai-creation.title.image' }),
            key: 'image',
          },
          {
            label: formatMessage({ id: 'ai-creation.title.text' }),
            key: 'text',
          },
        ]}
        activeKey={tab}
        onChange={(key) => setTab(key)}
      />
      <AIImage walletAddress={walletAddress} show={tab === 'image'} />
      <AIText walletAddress={walletAddress} show={tab === 'text'} />
    </Modal>
  );
}
