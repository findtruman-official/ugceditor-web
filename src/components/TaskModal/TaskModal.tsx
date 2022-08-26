import TaskCol from '@/components/TaskModal/TaskCol';
import TaskSubmitCol from '@/components/TaskModal/TaskSubmitCol';
import { useModel } from '@@/exports';
import { Modal, Row, Skeleton } from 'antd';

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
  const { taskId, storyTask, loadingStoryTask } = useModel(
    'taskModel',
    (model) => ({
      taskId: model.taskId,
      storyTask: model.storyTask,
      loadingStoryTask: model.loadingStoryTask,
    }),
  );

  return (
    <Modal
      centered={true}
      footer={null}
      width={1296}
      visible={visible}
      onCancel={() => {
        onClose();
      }}
      bodyStyle={{
        padding: 48,
      }}
    >
      {!!taskId && (
        <Skeleton loading={!storyTask && loadingStoryTask}>
          <Row align={'stretch'} wrap={false}>
            <TaskCol visible={visible} onClose={onClose} />
            <TaskSubmitCol visible={visible} onReview={onReview} />
          </Row>
        </Skeleton>
      )}
    </Modal>
  );
}
