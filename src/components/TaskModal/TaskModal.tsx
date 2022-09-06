import TaskCol from '@/components/TaskModal/TaskCol';
import TaskSubmitCol from '@/components/TaskModal/TaskSubmitCol';
import { useModel } from '@@/exports';
import { Modal, Row, Skeleton, Spin } from 'antd';

interface TaskModalProps {
  visible: boolean;
  onClose: () => void;
  onReview: () => void;
}

export default function TaskModal({
  visible,
  onClose,
  onReview,
}: TaskModalProps) {
  const { taskId, storyTask, loadingStoryTask, doneTaskPolling } = useModel(
    'taskModel',
    (model) => ({
      taskId: model.taskId,
      storyTask: model.storyTask,
      loadingStoryTask: model.loadingStoryTask,
      doneTaskPolling: model.doneTaskPolling,
    }),
  );

  return (
    <Modal
      centered={true}
      footer={null}
      width={1296}
      open={visible}
      onCancel={() => {
        onClose();
      }}
      bodyStyle={{
        padding: 48,
      }}
    >
      {!!taskId && (
        <Skeleton loading={!storyTask && loadingStoryTask}>
          <Spin spinning={doneTaskPolling}>
            <Row align={'stretch'} wrap={false}>
              <TaskCol visible={visible} onClose={onClose} />
              <TaskSubmitCol visible={visible} onReview={onReview} />
            </Row>
          </Spin>
        </Skeleton>
      )}
    </Modal>
  );
}
