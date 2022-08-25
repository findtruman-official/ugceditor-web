import MDEditorWithPreview from '@/components/MDEditorWithPreview/MDEditorWithPreview';
import { shortenAccount } from '@/utils/format';
import { useIntl, useModel } from '@@/exports';
import {
  CheckCircleFilled,
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  LoadingOutlined,
  StopFilled,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import MDEditor from '@uiw/react-md-editor';
import { Button, Col, Input, message, Row, Space } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import styles from './TaskModal.less';

interface TaskColProps {
  visible: boolean;
}

export default function TaskCol({ visible }: TaskColProps) {
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
  const { storyTask, runUpdateStoryTask, loadingUpdateStoryTask } = useModel(
    'taskModel',
    (model) => ({
      storyTask: model.storyTask,
      runUpdateStoryTask: model.runUpdateStoryTask,
      loadingUpdateStoryTask: model.loadingUpdateStoryTask,
    }),
  );

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
          <div>
            <LoadingOutlined style={{ marginRight: 8 }} />
            Todo
          </div>
        );
      case 'Done':
        return (
          <div>
            <CheckCircleFilled style={{ marginRight: 8, color: '#49aa19' }} />{' '}
            Done
          </div>
        );
      case 'Cancelled':
        return (
          <div>
            <StopFilled style={{ marginRight: 8, color: '#d32029' }} />{' '}
            Cancelled
          </div>
        );
    }
  }, []);

  return (
    <Col flex={'600px'} className={styles.taskCol}>
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
            disabled={!edit || loadingUpdateStoryTask}
            bordered={edit}
          />
        </Col>
        {isAuthor && (
          <Col>
            {edit ? (
              <Space>
                <Button
                  disabled={loadingUpdateStoryTask}
                  icon={<CloseOutlined />}
                  onClick={() => setEdit(false)}
                />
                <Button
                  loading={loadingUpdateStoryTask}
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
              </Space>
            ) : (
              <Button
                icon={<EditOutlined />}
                onClick={() => {
                  setNewTitle(storyTask.title);
                  setNewDesc(storyTask.description);
                  setEdit(true);
                }}
              />
            )}
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
      <div className={styles.infoRow}>
        <div className={styles.infoTitle}>
          {formatMessage({ id: 'task-modal.submits' })}
        </div>
        <div className={styles.infoValue}>
          <TeamOutlined style={{ marginRight: 8 }} />
          {storyTask?.submits.length || 0}
        </div>
      </div>
      <div style={{ marginTop: 24 }}>
        {edit ? (
          <div>
            <MDEditorWithPreview
              value={newDesc}
              onChange={(e) => setNewDesc(e)}
              placeholder={formatMessage({
                id: 'create-task.task-desc.placeholder',
              })}
            />
          </div>
        ) : (
          <div className={styles.desc}>
            <MDEditor.Markdown
              source={storyTask?.description}
              linkTarget={'_blank'}
            />
          </div>
        )}
      </div>
    </Col>
  );
}
