import { useIntl } from '@@/plugin-locale';
import { LeftOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Upload,
} from 'antd';
import styles from './PublishNftModal.less';

interface PublishNftModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function PublishNftModal({
  visible,
  onClose,
}: PublishNftModalProps) {
  const { formatMessage } = useIntl();
  const [form] = Form.useForm();

  return (
    <Modal
      className={'publish-nft-modal'}
      visible={visible}
      onCancel={onClose}
      title={null}
      closable={false}
      centered={true}
      footer={null}
      width={550}
    >
      <div className={styles.header}>
        <Button shape={'circle'} icon={<LeftOutlined />} onClick={onClose} />
        <div>Story A NFT</div>
      </div>
      <Form form={form} layout={'vertical'}>
        <Row gutter={24}>
          <Col>
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
          <Col flex={1}>
            <Form.Item
              name={'desc'}
              label={formatMessage({
                id: 'publish-nft-modal.nft-description',
              })}
              rules={[
                {
                  required: true,
                  message: formatMessage({
                    id: 'publish-nft-modal.nft-description.require',
                  }),
                },
              ]}
            >
              <Input.TextArea showCount={true} maxLength={1000} rows={6} />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          name={'price'}
          label={formatMessage({
            id: 'publish-nft-modal.nft-price',
          })}
          rules={[
            {
              required: true,
              message: formatMessage({
                id: 'publish-nft-modal.nft-price.require',
              }),
            },
          ]}
        >
          <InputNumber style={{ width: '100%' }} min={0} />
        </Form.Item>
        <Form.Item
          name={'totalSupply'}
          label={formatMessage({
            id: 'publish-nft-modal.nft-total-supply',
          })}
          rules={[
            {
              required: true,
              message: formatMessage({
                id: 'publish-nft-modal.nft-total-supply.require',
              }),
            },
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={1}
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            }
            parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
          />
        </Form.Item>
        <Form.Item
          name={'reservedAmount'}
          label={formatMessage({
            id: 'publish-nft-modal.nft-reserved-amount',
          })}
          rules={[
            {
              required: true,
              message: formatMessage({
                id: 'publish-nft-modal.nft-reserved-amount.require',
              }),
            },
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={1}
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            }
            parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
          />
        </Form.Item>
      </Form>
      <Button
        type={'primary'}
        block={true}
        onClick={form.submit}
        size={'large'}
        htmlType={'submit'}
      >
        {formatMessage({ id: 'publish-nft-modal.publish' })}
      </Button>
    </Modal>
  );
}
