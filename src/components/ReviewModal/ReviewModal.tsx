import TaskSubmitCard from '@/components/TaskSubmitCard/TaskSubmitCard';
import { useIntl, useModel } from '@@/exports';
import MDEditor from '@uiw/react-md-editor';
import { Button, Col, message, Modal, Row, Tooltip } from 'antd';
import { MacScrollbar } from 'mac-scrollbar';
import { useEffect, useRef, useState } from 'react';
import styles from './ReviewModal.less';

interface ReviewModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ReviewModal({ visible, onClose }: ReviewModalProps) {
  const { formatMessage } = useIntl();
  const { chainType } = useModel('storyModel', (model) => ({
    chainType: model.chainType,
  }));

  const { getTokenAsync } = useModel('walletModel', (model) => ({
    getTokenAsync: model.getTokenAsync,
  }));

  const { storyTask, runDoneStoryTask, loadingDoneStoryTask } = useModel(
    'taskModel',
    (model) => ({
      storyTask: model.storyTask,
      runDoneStoryTask: model.runDoneStoryTask,
      loadingDoneStoryTask: model.loadingDoneStoryTask,
    }),
  );

  const [preview, setPreview] = useState<API.StoryChainTaskSubmit>();
  const [selectedSubmit, setSelectedSubmit] = useState<number>(-1);

  const previewRef = useRef<any>();

  useEffect(() => {
    setSelectedSubmit(-1);
    setPreview(undefined);
  }, [visible]);

  return (
    <Modal
      footer={null}
      centered={true}
      width={1296}
      open={visible}
      destroyOnClose={true}
      onCancel={() => {
        onClose();
      }}
      bodyStyle={{
        padding: 48,
      }}
    >
      {storyTask && (
        <Row wrap={false} style={{ height: 800 }}>
          <Col flex={'600px'} className={styles.submitListCol}>
            {storyTask.submits.length > 0 ? (
              <div className={styles.submitList}>
                <MacScrollbar
                  style={{
                    overflowY: 'auto',
                    padding: 12,
                    flex: 1,
                  }}
                >
                  {storyTask.submits.map((submit: API.StoryChainTaskSubmit) => (
                    <TaskSubmitCard
                      key={`review-${submit.id || submit.chainSubmitId}`}
                      data={submit}
                      removable={false}
                      active={
                        preview &&
                        `${preview.id}` ===
                          `${submit.id || submit.chainSubmitId}`
                      }
                      onClick={() => {
                        setPreview(submit);
                        previewRef?.current?.scrollTo({
                          top: 0,
                          behavior: 'smooth',
                        });
                      }}
                      selected={
                        `${selectedSubmit}` ===
                        `${submit.id || submit.chainSubmitId}`
                      }
                      onSelect={() => {
                        if (loadingDoneStoryTask) return;
                        setSelectedSubmit(submit.id);
                      }}
                    />
                  ))}
                </MacScrollbar>
                <Tooltip
                  title={
                    !selectedSubmit &&
                    formatMessage({ id: 'task-review.select-submission-tip' })
                  }
                >
                  <Button
                    className={styles.reviewBtn}
                    block={true}
                    size={'large'}
                    type={'primary'}
                    disabled={!selectedSubmit}
                    loading={loadingDoneStoryTask}
                    onClick={() => {
                      Modal.confirm({
                        centered: true,
                        title: formatMessage({
                          id: 'task-review.review-confirm',
                        }),
                        onOk: async () => {
                          const token = await getTokenAsync(chainType, true);
                          await runDoneStoryTask(selectedSubmit, token);
                          message.success(
                            formatMessage({ id: 'task-review.done' }),
                          );
                          onClose();
                        },
                      });
                    }}
                  >
                    {formatMessage({ id: 'task-review.review' })}
                  </Button>
                </Tooltip>
              </div>
            ) : (
              <div className={styles.tip}>
                {formatMessage({ id: 'task-modal.no-submit-tip' })}
              </div>
            )}
          </Col>
          <Col flex={'600px'} className={styles.previewCol}>
            {preview ? (
              <MacScrollbar
                ref={previewRef}
                style={{ overflowY: 'auto', height: '100%' }}
                data-color-mode="dark"
              >
                <MDEditor.Markdown
                  source={preview?.content}
                  linkTarget={'_blank'}
                />
              </MacScrollbar>
            ) : (
              <div className={styles.tip}>
                {formatMessage({ id: 'task-review.tip' })}
              </div>
            )}
          </Col>
        </Row>
      )}
    </Modal>
  );
}
