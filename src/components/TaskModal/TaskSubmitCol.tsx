import MDEditorWithPreview from '@/components/MDEditorWithPreview/MDEditorWithPreview';
import TaskSubmitCard from '@/components/TaskSubmitCard/TaskSubmitCard';
import { useIntl, useModel } from '@@/exports';
import { FileDoneOutlined } from '@ant-design/icons';
import MDEditor from '@uiw/react-md-editor';
import { Button, Col, Divider, message, Modal, Tabs, Tooltip } from 'antd';
import { MacScrollbar } from 'mac-scrollbar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './TaskModal.less';

interface TaskSubmitColProps {
  visible: boolean;
}

export default function TaskSubmitCol({ visible }: TaskSubmitColProps) {
  const { formatMessage } = useIntl();
  const { accounts, getTokenAsync } = useModel('walletModel', (model) => ({
    accounts: model.accounts,
    getTokenAsync: model.getTokenAsync,
  }));
  const { chainType, isAuthor } = useModel('storyModel', (model) => ({
    chainType: model.chainType,
    isAuthor: model.isAuthor,
  }));
  const {
    storyTask,
    runCreateTaskSubmit,
    loadingCreateTaskSubmit,
    runRemoveTaskSubmit,
  } = useModel('taskModel', (model) => ({
    storyTask: model.storyTask,
    runCreateTaskSubmit: model.runCreateTaskSubmit,
    loadingCreateTaskSubmit: model.loadingCreateTaskSubmit,
    runRemoveTaskSubmit: model.runRemoveTaskSubmit,
  }));

  const account = accounts[chainType];

  const allListRef = useRef<any>();
  const myListRef = useRef<any>();

  const [content, setContent] = useState('');
  const [viewMoreContent, setViewMoreContent] = useState('');
  const [viewModalVisible, setViewModalVisible] = useState(false);

  useEffect(() => {
    setContent('');
  }, [visible]);

  const mySubmits = useMemo(() => {
    if (!account || !storyTask?.submits) return [];
    return storyTask.submits.filter(
      (e: API.StoryTaskSubmit) =>
        e.account.toLowerCase() === account.toLowerCase(),
    );
  }, [account, storyTask]);

  const handleDelete = useCallback(async (id: number) => {
    const token = await getTokenAsync(chainType, true);
    await runRemoveTaskSubmit(id, token);
    message.success(formatMessage({ id: 'task-modal.removed' }));
  }, []);

  return (
    <Col flex={'500px'} className={styles.taskSubmitCol}>
      <Tabs
        size={'small'}
        defaultActiveKey={'all'}
        tabBarExtraContent={
          isAuthor && (
            <Tooltip title={formatMessage({ id: 'task-modal.review' })}>
              <Button icon={<FileDoneOutlined />} />
            </Tooltip>
          )
        }
      >
        <Tabs.TabPane tab={formatMessage({ id: 'task-modal.all' })} key={'all'}>
          <MacScrollbar ref={allListRef} className={styles.submitList}>
            {storyTask && storyTask.submits?.length > 0 ? (
              storyTask.submits.map((submit: API.StoryTaskSubmit) => (
                <TaskSubmitCard
                  key={`all-task-${submit.id}`}
                  data={submit}
                  isOwner={
                    submit.account.toLowerCase() === account.toLowerCase()
                  }
                  onViewMore={() => {
                    setViewMoreContent(submit.content);
                    setViewModalVisible(true);
                  }}
                  onDelete={async () => {
                    await handleDelete(submit.id);
                  }}
                />
              ))
            ) : (
              <div className={styles.emptyTip}>
                {formatMessage({ id: 'task-modal.no-submit-tip' })}
              </div>
            )}
          </MacScrollbar>
        </Tabs.TabPane>
        <Tabs.TabPane tab={formatMessage({ id: 'task-modal.my' })} key={'my'}>
          <MacScrollbar ref={myListRef} className={styles.submitList}>
            {mySubmits.length > 0 ? (
              mySubmits.map((submit: API.StoryTaskSubmit) => (
                <TaskSubmitCard
                  key={`my-task-${submit.id}`}
                  data={submit}
                  isOwner={true}
                  onViewMore={() => {
                    setViewMoreContent(submit.content);
                    setViewModalVisible(true);
                  }}
                  onDelete={async () => {
                    await handleDelete(submit.id);
                  }}
                />
              ))
            ) : (
              <div className={styles.emptyTip}>
                {formatMessage({ id: 'task-modal.no-submit-tip' })}
              </div>
            )}
          </MacScrollbar>
        </Tabs.TabPane>
      </Tabs>
      <Divider />
      <div>
        <MDEditorWithPreview
          value={content}
          onChange={(e) => setContent(e)}
          placeholder={formatMessage({
            id: 'task-modal.submit-content.placeholder',
          })}
        />
      </div>

      <Button
        block={true}
        type={'primary'}
        loading={loadingCreateTaskSubmit}
        onClick={async () => {
          if (!content) return;
          const token = await getTokenAsync(chainType, true);
          await runCreateTaskSubmit(content, token);
          setContent('');
          message.success(formatMessage({ id: 'task-modal.submitted' }));
          allListRef?.current?.scrollTo({
            top: 0,
            behavior: 'smooth',
          });
          myListRef?.current?.scrollTo({
            top: 0,
            behavior: 'smooth',
          });
        }}
      >
        Submit
      </Button>
      <Modal
        centered={true}
        footer={null}
        closable={false}
        visible={viewModalVisible}
        onCancel={() => {
          setViewMoreContent('');
          setViewModalVisible(false);
        }}
        bodyStyle={{
          padding: '24px 48px',
        }}
      >
        <MDEditor.Markdown source={viewMoreContent} linkTarget={'_blank'} />
      </Modal>
    </Col>
  );
}
