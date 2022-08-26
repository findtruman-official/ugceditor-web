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

  const [preview, setPreview] = useState<API.StoryTaskSubmit>();
  const [selectedSubmits, setSelectedSubmits] = useState<number[]>([]);

  const previewRef = useRef<any>();

  useEffect(() => {
    setSelectedSubmits([]);
    setPreview(undefined);
  }, [visible]);

  return (
    <Modal
      footer={null}
      centered={true}
      width={1296}
      visible={visible}
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
                  {storyTask.submits.map((submit: API.StoryTaskSubmit) => (
                    <TaskSubmitCard
                      key={`review-${submit.id}`}
                      data={submit}
                      removable={false}
                      active={preview?.id === submit.id}
                      onClick={() => {
                        setPreview(submit);
                        previewRef?.current?.scrollTo({
                          top: 0,
                          behavior: 'smooth',
                        });
                      }}
                      onSelectedChange={(selected) => {
                        if (loadingDoneStoryTask) return;
                        const _selectedSubmits = [...selectedSubmits];
                        if (selected) {
                          _selectedSubmits.push(submit.id);
                        } else {
                          _selectedSubmits.splice(
                            _selectedSubmits.findIndex((e) => e === submit.id),
                            1,
                          );
                        }
                        setSelectedSubmits(_selectedSubmits);
                      }}
                    />
                  ))}
                </MacScrollbar>
                <Tooltip
                  title={
                    selectedSubmits.length === 0 &&
                    formatMessage({ id: 'task-review.select-submission-tip' })
                  }
                >
                  <Button
                    className={styles.reviewBtn}
                    block={true}
                    size={'large'}
                    type={'primary'}
                    disabled={selectedSubmits.length === 0}
                    loading={loadingDoneStoryTask}
                    onClick={() => {
                      Modal.confirm({
                        centered: true,
                        title: formatMessage(
                          {
                            id: 'task-review.review-confirm',
                          },
                          { count: selectedSubmits.length },
                        ),
                        onOk: async () => {
                          const token = await getTokenAsync(chainType, true);
                          await runDoneStoryTask(selectedSubmits, token);
                          message.success(
                            formatMessage({ id: 'task-review.done' }),
                          );
                          onClose();
                        },
                      });
                    }}
                  >
                    {formatMessage(
                      { id: 'task-review.review' },
                      { count: selectedSubmits.length },
                    )}
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
