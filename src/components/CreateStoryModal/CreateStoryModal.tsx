import { useIntl } from '@@/plugin-locale';
import {
  InfoCircleOutlined,
  LeftOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Button, Col, Form, Input, Modal, Row, Upload } from 'antd';
import styles from './CreateStoryModal.less';

interface CreateStoryModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function CreateStoryModal({
  visible,
  onClose,
}: CreateStoryModalProps) {
  const { formatMessage } = useIntl();
  const [form] = Form.useForm();

  return (
    <Modal
      visible={visible}
      onCancel={onClose}
      title={null}
      closable={false}
      centered={true}
      footer={null}
    >
      <div className={styles.header}>
        <Button shape={'circle'} icon={<LeftOutlined />} onClick={onClose} />
        <div>{formatMessage({ id: 'writer.new-story' })}</div>
      </div>
      <Form form={form} layout={'vertical'}>
        <Row gutter={24}>
          <Col span={9}>
            <Form.Item
              name={'img'}
              rules={[
                {
                  required: true,
                  message: formatMessage({
                    id: 'create-story-modal.upload-cover.require',
                  }),
                },
              ]}
            >
              <Upload
                maxCount={1}
                showUploadList={false}
                listType="picture-card"
                style={{ width: '100%', height: 260 }}
              >
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>
                    {formatMessage({ id: 'create-story-modal.upload-cover' })}
                  </div>
                </div>
              </Upload>
            </Form.Item>
          </Col>
          <Col span={15}>
            <Form.Item
              name={'name'}
              label={formatMessage({
                id: 'create-story-modal.story-name',
              })}
              rules={[
                {
                  required: true,
                  message: formatMessage({
                    id: 'create-story-modal.story-name.require',
                  }),
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name={'desc'}
              label={formatMessage({
                id: 'create-story-modal.story-description',
              })}
              rules={[
                {
                  required: true,
                  message: formatMessage({
                    id: 'create-story-modal.story-description.require',
                  }),
                },
              ]}
            >
              <Input.TextArea showCount={true} maxLength={1000} rows={5} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
      <div className={styles.deployTip}>
        <InfoCircleOutlined />
        <span>
          {formatMessage(
            { id: 'create-story-modal.deploy-tip' },
            { chain: 'xxx' },
          )}
        </span>
      </div>
      <Button
        shape={'round'}
        type={'primary'}
        block={true}
        onClick={form.submit}
      >
        {formatMessage({ id: 'create-story-modal.create' })}
      </Button>
    </Modal>
  );
}
