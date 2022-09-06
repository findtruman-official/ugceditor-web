import MDEditorWithPreview from '@/components/MDEditorWithPreview/MDEditorWithPreview';
import {
  LeftCornerLargeRibbon,
  RibbonContainer,
} from '@/components/Ribbon/Ribbon';
import TaskSubmitCard from '@/components/TaskSubmitCard/TaskSubmitCard';
import { useIntl, useModel } from '@@/exports';
import { FileDoneOutlined } from '@ant-design/icons';
import MDEditor from '@uiw/react-md-editor';
import {
  Button,
  Col,
  Divider,
  message,
  Modal,
  Spin,
  Tabs,
  Tooltip,
} from 'antd';
import { MacScrollbar } from 'mac-scrollbar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './TaskModal.less';

interface TaskSubmitColProps {
  visible: boolean;
  onReview: () => void;
}

export default function TaskSubmitCol({
  visible,
  onReview,
}: TaskSubmitColProps) {
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
    createSubmitPolling,
    removeSubmitPolling,
  } = useModel('taskModel', (model) => ({
    storyTask: model.storyTask,
    runCreateTaskSubmit: model.runCreateTaskSubmit,
    loadingCreateTaskSubmit: model.loadingCreateTaskSubmit,
    runRemoveTaskSubmit: model.runRemoveTaskSubmit,
    createSubmitPolling: model.createSubmitPolling,
    removeSubmitPolling: model.removeSubmitPolling,
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

  const approvedSubmits = useMemo(() => {
    if (!storyTask?.submits) return [];
    return storyTask.submits.filter(
      (e: API.StoryTaskSubmit) => e.status === 'Approved',
    );
  }, [storyTask]);

  const rejectedSubmits = useMemo(() => {
    if (!storyTask?.submits) return [];
    return storyTask.submits.filter(
      (e: API.StoryTaskSubmit) => e.status === 'Rejected',
    );
  }, [storyTask]);

  const mySubmits = useMemo(() => {
    if (!account || !storyTask?.submits) return [];
    return storyTask.submits.filter(
      (e: API.StoryTaskSubmit) =>
        e.account.toLowerCase() === account.toLowerCase(),
    );
  }, [account, storyTask]);

  const handleDelete = useCallback(async (id: number | string) => {
    const token = await getTokenAsync(chainType, true);
    await runRemoveTaskSubmit(id, token);
    message.success(formatMessage({ id: 'task-modal.removed' }));
  }, []);

  return (
    <Col flex={'550px'} className={styles.taskSubmitCol}>
      {approvedSubmits.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <RibbonContainer>
            <LeftCornerLargeRibbon
              backgroundColor={'#b70f0f'}
              color={'#f0f0f0'}
            >
              {formatMessage({ id: 'task-modal.approved' })}
            </LeftCornerLargeRibbon>
            <TaskSubmitCard
              data={approvedSubmits[0]}
              onViewMore={() => {
                setViewMoreContent(approvedSubmits[0].content);
                setViewModalVisible(true);
              }}
              minHeight={300}
              maxHeight={300}
            />
          </RibbonContainer>
        </div>
      )}
      <Spin spinning={removeSubmitPolling || createSubmitPolling}>
        <Tabs
          size={'small'}
          // defaultActiveKey={'all'}
          tabBarExtraContent={
            isAuthor &&
            storyTask?.status === 'Todo' && (
              <Tooltip title={formatMessage({ id: 'task-modal.review' })}>
                <Button
                  type={'text'}
                  icon={<FileDoneOutlined />}
                  onClick={onReview}
                />
              </Tooltip>
            )
          }
          style={{
            height:
              storyTask?.status === 'Todo'
                ? 460
                : storyTask?.status === 'Done'
                ? 384
                : '100%',
          }}
        >
          <Tabs.TabPane
            tab={formatMessage({ id: 'task-modal.all' })}
            key={'all'}
            style={{ height: '100%' }}
          >
            <MacScrollbar
              ref={allListRef}
              className={styles.submitList}
              style={
                storyTask?.status === 'Todo'
                  ? {
                      height: 406,
                    }
                  : {}
              }
            >
              {storyTask && storyTask.submits?.length > 0 ? (
                storyTask.submits.map((submit: API.StoryChainTaskSubmit) => (
                  <TaskSubmitCard
                    key={`all-task-${submit.id || submit.chainSubmitId}`}
                    data={submit}
                    removable={
                      submit.account.toLowerCase() === account.toLowerCase() &&
                      storyTask?.status === 'Todo'
                    }
                    onViewMore={() => {
                      setViewMoreContent(submit.content);
                      setViewModalVisible(true);
                    }}
                    onDelete={async () => {
                      await handleDelete(submit.id || submit.chainSubmitId);
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
          <Tabs.TabPane
            tab={formatMessage({ id: 'task-modal.my' })}
            key={'my'}
            style={{ height: '100%' }}
          >
            <MacScrollbar ref={myListRef} className={styles.submitList}>
              {mySubmits.length > 0 ? (
                mySubmits.map((submit: API.StoryChainTaskSubmit) => (
                  <TaskSubmitCard
                    key={`my-task-${submit.id || submit.chainSubmitId}`}
                    data={submit}
                    removable={storyTask?.status === 'Todo'}
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
      </Spin>
      {storyTask?.status === 'Todo' && (
        <>
          <Divider />
          <MDEditorWithPreview
            disabled={loadingCreateTaskSubmit || createSubmitPolling}
            value={content}
            onChange={(e) => setContent(e)}
            placeholder={formatMessage({
              id: 'task-modal.submit-content.placeholder',
            })}
          />
          <Button
            block={true}
            type={'primary'}
            loading={loadingCreateTaskSubmit || createSubmitPolling}
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
        </>
      )}
      <Modal
        centered={true}
        footer={null}
        closable={false}
        width={1000}
        open={viewModalVisible}
        onCancel={() => {
          setViewMoreContent('');
          setViewModalVisible(false);
        }}
        bodyStyle={{
          padding: '24px 48px',
        }}
      >
        <div data-color-mode="dark">
          <MDEditor.Markdown source={viewMoreContent} linkTarget={'_blank'} />
        </div>
      </Modal>
    </Col>
  );
}
