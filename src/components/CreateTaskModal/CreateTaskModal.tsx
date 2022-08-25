import { ChainType } from '@/wallets';
import { useIntl } from '@@/exports';
import { SearchOutlined } from '@ant-design/icons';
import MDEditor from '@uiw/react-md-editor';
import { Button, Input, message, Modal } from 'antd';
import { useState } from 'react';
import rehypeSanitize from 'rehype-sanitize';
import { useModel } from 'umi';
import styles from './CreateTaskModal.less';

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
  const [preview, setPreview] = useState(false);

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
      <MDEditor
        style={{ marginBottom: 12 }}
        textareaProps={{
          placeholder: formatMessage({
            id: 'create-task.task-desc.placeholder',
          }),
        }}
        value={desc}
        hideToolbar={true}
        preview={'edit'}
        onChange={(e) => setDesc(e!)}
        previewOptions={{
          rehypePlugins: [[rehypeSanitize]],
        }}
      />
      <div className={styles.previewBtn} onClick={() => setPreview(true)}>
        <SearchOutlined /> {formatMessage({ id: 'create-task.preview' })}
      </div>
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

      <Modal
        visible={preview}
        onCancel={() => setPreview(false)}
        centered={true}
        footer={null}
        closable={false}
      >
        <MDEditor.Markdown source={desc} linkTarget={'_blank'} />
      </Modal>
    </Modal>
  );
}
