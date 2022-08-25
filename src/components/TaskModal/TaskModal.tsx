import { Modal } from 'antd';

interface TaskModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function TaskModal({ visible, onClose }: TaskModalProps) {
  return (
    <Modal
      centered={true}
      footer={null}
      width={1000}
      visible={visible}
      onCancel={() => {
        onClose();
      }}
    >
      taskModal
    </Modal>
  );
}
