import MDEditorWithPreview from '@/components/MDEditorWithPreview/MDEditorWithPreview';
import { ChainType } from '@/wallets';
import { useIntl } from '@@/exports';
import { Button, Input, message, Modal } from 'antd';
import { useState } from 'react';
import { useModel } from 'umi';

interface CreateTaskModalProps {
  chainType: ChainType;
  visible: boolean;
  onClose: () => void;
}

export default function CreateTaskModal({
  chainType,
  visible,
  onClose,
}: CreateTaskModalProps) {
  const { formatMessage } = useIntl();
  const { runCreateStoryTask, loadingCreateStoryTask } = useModel(
    'taskModel',
    (model) => ({
      runCreateStoryTask: model.runCreateStoryTask,
    }),
  );
  const { getToken } = useModel('walletModel', (model) => ({
    getToken: model.getToken,
  }));

  const token = getToken(chainType);

  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  return (
    <Modal
      centered={true}
      visible={visible}
      onCancel={() => {
        !loadingCreateStoryTask && onClose();
      }}
      footer={null}
      data-color-mode="dark"
      width={720}
    >
      <Input
        maxLength={30}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ fontSize: 24, padding: 0, margin: '12px 0' }}
        bordered={false}
        placeholder={formatMessage({ id: 'create-task.task-name.placeholder' })}
      />
      <MDEditorWithPreview
        value={desc}
        onChange={(e) => setDesc(e)}
        placeholder={formatMessage({
          id: 'create-task.task-desc.placeholder',
        })}
      />
      <Button
        size={'large'}
        type={'primary'}
        block={true}
        onClick={() => {
          if (!title || !desc) return;
          try {
            runCreateStoryTask(title, desc, token);
            onClose();
            setTitle('');
            setDesc('');
            message.success(formatMessage({ id: 'create-task.created' }));
          } catch (e) {
            message.error(formatMessage({ id: 'request-failed' }));
          }
        }}
      >
        {formatMessage({ id: 'create-task.create' })}
      </Button>
    </Modal>
  );
}
