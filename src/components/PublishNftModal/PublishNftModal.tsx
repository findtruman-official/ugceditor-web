import ImageUploader from '@/components/ImageUploader/ImageUploader';
import { getMetadataUriPrefix } from '@/services/api';
import { useIntl } from '@@/plugin-locale';
import { LeftOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Row,
} from 'antd';
import { useModel } from 'umi';
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
  const { getToken, connectedWallets } = useModel('walletModel', (model) => ({
    getToken: model.getToken,
    connectedWallets: model.connectedWallets,
  }));
  const { currentStory, addNftSalePolling, refreshReservedNftRest } = useModel(
    'storyModel',
    (model) => ({
      currentStory: model.currentStory,
      addNftSalePolling: model.addNftSalePolling,
      refreshReservedNftRest: model.refreshReservedNftRest,
    }),
  );

  const chain = currentStory?.chainInfo.type;
  const token = getToken(chain);
  const wallet = connectedWallets[chain];

  const { loading: publishingNft, run: runPublishNft } = useRequest(
    async (values) => {
      if (!chain || !wallet) return;

      try {
        const name = `${currentStory.info?.title} NFT`;

        const { img, desc, price, totalSupply, reservedAmount } = values;
        if (reservedAmount >= totalSupply) {
          message.warning(
            formatMessage({ id: 'publish-nft-modal.reserve-less-than-total' }),
          );
          return;
        }

        const { url: uriPrefix } = (
          await getMetadataUriPrefix(totalSupply, chain, desc, img, name)
        ).metadataUriPrefix;

        await wallet.provider.publishStoryNft(
          currentStory.chainStoryId,
          price,
          totalSupply,
          reservedAmount,
          { name, desc, img },
          uriPrefix,
        );

        message.success(formatMessage({ id: 'publish-nft-modal.published' }));

        refreshReservedNftRest();
        addNftSalePolling({
          id: currentStory.chainStoryId,
          chainType: chain,
        });
        onClose();
      } catch (e) {
        console.log(e);
        message.error(formatMessage({ id: 'request-failed' }));
      }
    },
    { manual: true },
  );

  return (
    <Modal
      className={'publish-nft-modal'}
      open={visible}
      onCancel={() => {
        !publishingNft && onClose();
      }}
      title={null}
      closable={false}
      centered={true}
      footer={null}
      width={550}
    >
      <div className={styles.header}>
        <Button
          shape={'circle'}
          icon={<LeftOutlined />}
          onClick={() => {
            !publishingNft && onClose();
          }}
        />
        <div>{currentStory?.info?.title} NFT</div>
      </div>
      <Form
        form={form}
        layout={'vertical'}
        disabled={publishingNft || !token}
        onFinish={runPublishNft}
      >
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
              <ImageUploader
                aspect={1}
                label={formatMessage({ id: 'create-story-modal.upload-cover' })}
                token={token}
              />
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
              <Input.TextArea showCount={true} maxLength={500} rows={6} />
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
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            max={10000000000}
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            }
            parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
          />
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
            step={1}
            max={10000000000}
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
            min={0}
            step={1}
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
        loading={publishingNft}
      >
        {formatMessage({ id: 'publish-nft-modal.publish' })}
      </Button>
    </Modal>
  );
}
