import ImageUploader from '@/components/ImageUploader/ImageUploader';
import { getJson, syncStoryContentHash, uploadJson } from '@/services/api';
import { useModel } from '@@/exports';
import { useIntl } from '@@/plugin-locale';
import { InfoCircleOutlined, LeftOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { Button, Col, Form, Input, message, Modal, Row } from 'antd';
import { useEffect } from 'react';
import styles from './CreateStoryModal.less';

interface CreateStoryModalProps {
  id?: string;
  update?: boolean;
  contentHash?: string;
  visible: boolean;
  onClose: () => void;
}

export default function CreateStoryModal({
  id,
  update = false,
  contentHash,
  visible,
  onClose,
}: CreateStoryModalProps) {
  const { formatMessage } = useIntl();
  const [form] = Form.useForm();

  const { token, wallet, chains } = useModel('walletModel');
  const { addCreateStoryPolling, addUpdateStoryPolling } = useModel(
    'storyModel',
    (model) => ({
      addCreateStoryPolling: model.addCreateStoryPolling,
      addUpdateStoryPolling: model.addUpdateStoryPolling,
    }),
  );

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
      if (!wallet || !chains?.[0]) return;
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
          await wallet.provider.updateStory(
            id!!,
            cid,
            chains[0].factoryAddress,
          );
          addUpdateStoryPolling(id!!, cid);
          await syncStoryContentHash(chains[0].type, id!!);
        } else {
          const newStoryId = await wallet.provider.publishStory(
            cid,
            chains[0].factoryAddress,
          );
          addCreateStoryPolling({
            id: newStoryId,
            cover: values.cover,
            chain: chains[0].name,
          });
          await syncStoryContentHash(chains[0].type, newStoryId);
        }

        message.success(
          formatMessage({
            id: update ? 'story.story-updated' : 'story.story-published',
          }),
        );

        // refreshMyStories();
        // if (update) {
        //   refreshCurrentStory();
        // } else {
        //   refreshHottestStories();
        //   refreshLatestStories();
        // }

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
      visible={visible}
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
            { chain: chains?.[0].name || '' },
          )}
        </span>
      </div>
      <Button
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
    </Modal>
  );
}
