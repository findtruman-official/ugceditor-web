import ColorfulText from '@/components/Colorful/ColorfulText';
import MDEditorWithPreview from '@/components/MDEditorWithPreview/MDEditorWithPreview';
import { shortenAccount } from '@/utils/format';
import { useIntl, useModel } from '@@/exports';
import {
  CheckCircleFilled,
  CheckOutlined,
  ClockCircleFilled,
  CloseOutlined,
  EditOutlined,
  GiftOutlined,
  IssuesCloseOutlined,
  StopFilled,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import MDEditor from '@uiw/react-md-editor';
import {
  Button,
  Col,
  Input,
  message,
  Modal,
  Row,
  Space,
  Tag,
  Tooltip,
} from 'antd';
import { MacScrollbar } from 'mac-scrollbar';
import { useCallback, useEffect, useState } from 'react';
import styles from './TaskModal.less';

interface TaskColProps {
  visible: boolean;
  onClose: () => void;
}

export default function TaskCol({ visible, onClose }: TaskColProps) {
  const { formatMessage } = useIntl();
  const { getTokenAsync } = useModel('walletModel', (model) => ({
    getTokenAsync: model.getTokenAsync,
  }));
  const { chainType, currentStory, isAuthor } = useModel(
    'storyModel',
    (model) => ({
      chainType: model.chainType,
      currentStory: model.currentStory,
      isAuthor: model.isAuthor,
    }),
  );
  const {
    storyTask,
    runUpdateStoryTask,
    loadingUpdateStoryTask,
    runCancelStoryTask,
    updateTaskPolling,
  } = useModel('taskModel', (model) => ({
    storyTask: model.storyTask,
    runUpdateStoryTask: model.runUpdateStoryTask,
    loadingUpdateStoryTask: model.loadingUpdateStoryTask,
    runCancelStoryTask: model.runCancelStoryTask,
    updateTaskPolling: model.updateTaskPolling,
  }));

  const [edit, setEdit] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  useEffect(() => {
    setEdit(false);
  }, [visible]);

  const renderStatus = useCallback((status: API.StoryTaskStatus) => {
    if (!status) return undefined;
    switch (status) {
      case 'Todo':
        return (
          <div style={{ color: '#d89614' }}>
            <ClockCircleFilled style={{ marginRight: 8 }} />
            Todo
          </div>
        );
      case 'Done':
        return (
          <div style={{ color: '#49aa19' }}>
            <CheckCircleFilled style={{ marginRight: 8 }} /> Done
          </div>
        );
      case 'Cancelled':
        return (
          <div style={{ color: '#d32029' }}>
            <StopFilled style={{ marginRight: 8 }} /> Cancelled
          </div>
        );
    }
  }, []);

  const handleClose = useCallback(async () => {
    const token = await getTokenAsync(chainType);
    await runCancelStoryTask(token);
    message.success(formatMessage({ id: 'task-modal.closed' }));
    onClose();
  }, []);

  return (
    <Col flex={'650px'} className={styles.taskCol}>
      <Row
        style={{ marginBottom: 12 }}
        align={'middle'}
        justify={'space-between'}
        gutter={12}
      >
        <Col flex={'auto'}>
          <Input
            className={styles.title}
            value={edit ? newTitle : storyTask?.title}
            onChange={(e) => setNewTitle(e.target.value)}
            disabled={!edit || loadingUpdateStoryTask || updateTaskPolling}
            bordered={edit}
          />
        </Col>
        {isAuthor && storyTask?.status === 'Todo' && (
          <Col>
            <Space>
              {edit ? (
                <>
                  <Button
                    size={'large'}
                    type={'text'}
                    disabled={loadingUpdateStoryTask || updateTaskPolling}
                    icon={<CloseOutlined />}
                    onClick={() => setEdit(false)}
                  />
                  <Button
                    size={'large'}
                    loading={loadingUpdateStoryTask || updateTaskPolling}
                    type={'primary'}
                    icon={<CheckOutlined />}
                    onClick={async () => {
                      const token = await getTokenAsync(chainType);
                      await runUpdateStoryTask(newTitle, newDesc, token);
                      setEdit(false);
                      message.success(
                        formatMessage({ id: 'task-modal.updated' }),
                      );
                    }}
                  />
                </>
              ) : (
                <>
                  <Tooltip title={formatMessage({ id: 'task-modal.close' })}>
                    <Button
                      size={'large'}
                      type={'text'}
                      icon={<IssuesCloseOutlined />}
                      onClick={() => {
                        Modal.confirm({
                          centered: true,
                          title: formatMessage({
                            id: 'task-modal.close-confirm',
                          }),
                          onOk: async () => {
                            await handleClose();
                          },
                        });
                      }}
                    />
                  </Tooltip>
                  <Tooltip title={formatMessage({ id: 'task-modal.edit' })}>
                    <Button
                      size={'large'}
                      type={'text'}
                      icon={<EditOutlined />}
                      onClick={() => {
                        setNewTitle(storyTask.title);
                        setNewDesc(storyTask.description);
                        setEdit(true);
                      }}
                    />
                  </Tooltip>
                </>
              )}
            </Space>
          </Col>
        )}
      </Row>
      <div className={styles.infoRow}>
        <div className={styles.infoTitle}>
          {formatMessage({ id: 'task-modal.status' })}
        </div>
        <div className={styles.infoValue}>
          {renderStatus(storyTask?.status)}
        </div>
      </div>
      <div className={styles.infoRow}>
        <div className={styles.infoTitle}>
          {formatMessage({ id: 'task-modal.posted-by' })}
        </div>
        <div className={styles.infoValue}>
          <UserOutlined style={{ marginRight: 8 }} />
          {shortenAccount(currentStory?.author)}
        </div>
      </div>
      {storyTask?.rewardNfts && storyTask.rewardNfts.length > 0 && (
        <Tooltip
          placement={'topLeft'}
          title={formatMessage({ id: 'task-modal.rewards-desc' })}
        >
          <div className={styles.infoRow}>
            <div className={styles.infoTitle}>
              {formatMessage({ id: 'task-modal.rewards' })}
            </div>
            <div className={styles.infoValue}>
              <GiftOutlined
                style={{ marginRight: 8, color: 'rgb(91, 79, 255)' }}
              />
              <ColorfulText
                style={{
                  display: 'inline-block',
                  fontWeight: 'bold',
                  marginRight: 8,
                }}
              >{`${currentStory?.info?.title || ''} NFT`}</ColorfulText>
              {storyTask.rewardNfts.map((e: string) => (
                <Tag key={e}>{`# ${e}`}</Tag>
              ))}
            </div>
          </div>
        </Tooltip>
      )}
      <div className={styles.infoRow}>
        <div className={styles.infoTitle}>
          {formatMessage({ id: 'task-modal.submits' })}
        </div>
        <div className={styles.infoValue}>
          <TeamOutlined style={{ marginRight: 8 }} />
          {storyTask?.submits.length || 0}
        </div>
      </div>
      <div style={{ marginTop: 12, flex: 1 }}>
        {edit ? (
          <MDEditorWithPreview
            disabled={loadingUpdateStoryTask || updateTaskPolling}
            value={newDesc}
            onChange={(e) => setNewDesc(e)}
            placeholder={formatMessage({
              id: 'create-task.task-desc.placeholder',
            })}
            marginBottom={false}
            style={{
              height: 624,
            }}
            height={'calc(100% - 34px)'}
          />
        ) : (
          <MacScrollbar className={styles.desc} data-color-mode="dark">
            <MDEditor.Markdown
              source={storyTask?.description}
              linkTarget={'_blank'}
            />
          </MacScrollbar>
        )}
      </div>
    </Col>
  );
}
