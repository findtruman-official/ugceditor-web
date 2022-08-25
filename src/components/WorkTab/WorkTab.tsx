import CreateTaskModal from '@/components/CreateTaskModal/CreateTaskModal';
import TaskModal from '@/components/TaskModal/TaskModal';
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

  const { todoTasks, doneTasks, cancelledTasks, setTaskId } = useModel(
    'taskModel',
    (model) => ({
      todoTasks: model.todoTasks,
      doneTasks: model.doneTasks,
      cancelledTasks: model.cancelledTasks,
      setTaskId: model.setTaskId,
    }),
  );

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [taskModalVisible, setTaskModalVisible] = useState(false);

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
      <Button
        onClick={() => {
          setTaskModalVisible(true);
          setTaskId(1);
        }}
      >
        Task
      </Button>
      <CreateTaskModal
        chainType={chainType}
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
      />
      <TaskModal
        visible={taskModalVisible}
        onClose={() => {
          setTaskModalVisible(false);
          setTaskId(0);
        }}
      />
    </div>
  );
}
