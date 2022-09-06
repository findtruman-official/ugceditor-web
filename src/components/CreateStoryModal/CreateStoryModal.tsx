import ImageUploader from '@/components/ImageUploader/ImageUploader';
import { WalletContext, WalletContextType } from '@/layouts';
import { ChainWallet } from '@/models/walletModel';
import { getJson, uploadJson } from '@/services/api';
import { ChainType } from '@/wallets';
import { useModel } from '@@/exports';
import { useIntl } from '@@/plugin-locale';
import { InfoCircleOutlined, LeftOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { Button, Col, Form, Input, message, Modal, Row } from 'antd';
import { useContext, useEffect, useMemo, useState } from 'react';
import styles from './CreateStoryModal.less';

interface CreateStoryModalProps {
  id?: string;
  update?: boolean;
  contentHash?: string;
  visible: boolean;
  onClose: () => void;
}

const ChainItem = ({
  children,
  selected,
  onClick,
}: {
  children: any;
  selected: boolean;
  onClick: () => void;
}) => {
  return (
    <div
      className={[
        styles.chainItem,
        selected ? styles.chainItemSelected : '',
      ].join(' ')}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default function CreateStoryModal({
  id,
  update = false,
  contentHash,
  visible,
  onClose,
}: CreateStoryModalProps) {
  const { openWalletModal, confirmLogin } =
    useContext<WalletContextType>(WalletContext);
  const { formatMessage } = useIntl();
  const [form] = Form.useForm();

  const { getToken, connectedWallets, chainWallets, chains } = useModel(
    'walletModel',
    (model) => ({
      getToken: model.getToken,
      connectedWallets: model.connectedWallets,
      chainWallets: model.chainWallets,
      chains: model.chains,
    }),
  );
  const { addCreateStoryPolling, addUpdateStoryPolling, currentStory } =
    useModel('storyModel', (model) => ({
      currentStory: model.currentStory,
      addCreateStoryPolling: model.addCreateStoryPolling,
      addUpdateStoryPolling: model.addUpdateStoryPolling,
    }));
  const [chain, setChain] = useState<ChainType>();

  useEffect(() => {
    if (!visible) {
      setChain(undefined);
    } else if (!!contentHash) {
      setChain(currentStory.chainInfo.type);
    }
  }, [visible, contentHash]);

  const token = useMemo(() => {
    if (!chain) return '';
    return getToken(chain);
  }, [chain]);

  const { data: initialData } = useRequest(
    async () => {
      if (!!contentHash) {
        return await getJson<API.StoryDetail>(contentHash);
      }
    },
    {
      refreshDeps: [contentHash],
    },
  );

  useEffect(() => {
    if (!!initialData) {
      form.setFieldsValue({
        cover: initialData.cover,
        title: initialData.title,
        description: initialData.description,
      });
    }
  }, [initialData]);

  const { loading: publishing, run: publishStory } = useRequest(
    async (values: any) => {
      const wallet = connectedWallets[chain!!];
      if (!wallet) return;
      try {
        const currentTime = new Date().valueOf();
        const { cid } = await uploadJson<API.StoryDetail>(
          {
            title: values.title,
            cover: values.cover,
            description: values.description,
            chapters: initialData?.chapters || [],
            createAt: initialData?.createAt || currentTime,
            updateAt: currentTime,
            version: '1',
          },
          token,
        );

        if (update) {
          await wallet.provider.updateStory(id!!, cid);
          addUpdateStoryPolling({
            id: id!!,
            contentHash: cid,
            chainType: chain,
          });
        } else {
          const newStoryId = await wallet.provider.publishStory(cid);
          const chainName = chains.find(
            (c: API.Chain) => c.type === chain,
          ).name;
          addCreateStoryPolling({
            id: newStoryId,
            cover: values.cover,
            name: values.title,
            description: values.description,
            chain: chainName,
            chainType: chain,
            nftPublished: false,
            loading: true,
          });
        }

        message.success(
          formatMessage({
            id: update ? 'story.story-updated' : 'story.story-published',
          }),
        );
        form.resetFields();
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
      className={'create-story-modal'}
      open={visible}
      onCancel={() => {
        !publishing && onClose();
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
            !publishing && onClose();
          }}
        />
        <div>
          {formatMessage({
            id: update ? 'writer.edit-story' : 'writer.new-story',
          })}
        </div>
      </div>
      {!update && (
        <div className={styles.chainSelector}>
          <div className={styles.chainSelectorTitle}>
            {formatMessage({ id: 'publish-nft-modal.select-chain' })}
          </div>
          <div className={styles.chainItemRow}>
            {Object.keys(connectedWallets)
              .filter((chain) => !!connectedWallets[chain])
              .map((_chain) => {
                const chainWallet = chainWallets.find(
                  (c: ChainWallet) => c.chainType === _chain,
                );
                return (
                  <ChainItem
                    key={_chain}
                    selected={_chain === chain}
                    onClick={() => {
                      const token = getToken(_chain);
                      if (!token) {
                        confirmLogin(_chain as ChainType, {
                          onConfirm: () => setChain(_chain as ChainType),
                        });
                      } else {
                        setChain(_chain as ChainType);
                      }
                    }}
                  >
                    <img
                      src={chainWallet.icon}
                      className={styles.chainItemIcon}
                    />
                  </ChainItem>
                );
              })}
            <ChainItem selected={false} onClick={openWalletModal}>
              {formatMessage({ id: 'publish-nft-modal.select-chain-others' })}
            </ChainItem>
          </div>
        </div>
      )}
      {!!token && (
        <>
          <Form
            form={form}
            layout={'vertical'}
            onFinish={publishStory}
            disabled={publishing}
          >
            <Row gutter={24}>
              <Col span={9}>
                <Form.Item
                  name={'cover'}
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
                    aspect={2 / 3}
                    label={formatMessage({
                      id: 'create-story-modal.upload-cover',
                    })}
                    token={token}
                  />
                </Form.Item>
              </Col>
              <Col span={15}>
                <Form.Item
                  name={'title'}
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
                  name={'description'}
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
                  <Input.TextArea showCount={true} maxLength={300} rows={5} />
                </Form.Item>
              </Col>
            </Row>
          </Form>
          <div className={styles.deployTip}>
            <InfoCircleOutlined />
            <span>
              {formatMessage(
                {
                  id: update
                    ? 'create-story-modal.deployed-tip'
                    : 'create-story-modal.deploy-tip',
                },
                {
                  chain:
                    chains.find((c: API.Chain) => c.type === chain).name || '',
                },
              )}
            </span>
          </div>
          <Button
            disabled={!chain}
            type={'primary'}
            block={true}
            onClick={form.submit}
            size={'large'}
            loading={publishing}
          >
            {formatMessage({
              id: update
                ? 'create-story-modal.update'
                : 'create-story-modal.create',
            })}
          </Button>
        </>
      )}
    </Modal>
  );
}
