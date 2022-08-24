import CreateTaskModal from '@/components/CreateTaskModal/CreateTaskModal';
import { WalletContext, WalletContextType } from '@/layouts';
import { useModel } from '@@/exports';
import { useIntl } from '@@/plugin-locale';
import { Button } from 'antd';
import { useContext, useEffect, useState } from 'react';

export default function WorkTab() {
  const { confirmLogin } = useContext<WalletContextType>(WalletContext);
  const { formatMessage } = useIntl();

  const { chainType } = useModel('storyModel', (model) => ({
    chainType: model.chainType,
  }));

  const { getToken, accounts } = useModel('walletModel', (model) => ({
    getToken: model.getToken,
    accounts: model.accounts,
  }));

  const [createModalVisible, setCreateModalVisible] = useState(false);

  useEffect(() => {
    setCreateModalVisible(false);
  }, [accounts[chainType]]);

  return (
    <div>
      <Button
        onClick={() => {
          const token = getToken(chainType);
          if (!token) {
            confirmLogin(chainType, {
              onConfirm: () => setCreateModalVisible(true),
            });
          } else {
            setCreateModalVisible(true);
          }
        }}
      >
        Create
      </Button>
      <CreateTaskModal
        chainType={chainType}
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
      />
    </div>
  );
}
