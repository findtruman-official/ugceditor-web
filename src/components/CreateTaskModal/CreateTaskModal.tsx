import MDEditorWithPreview from '@/components/MDEditorWithPreview/MDEditorWithPreview';
import { useIntl } from '@@/exports';
import { Button, Input, message, Modal, Select, Spin } from 'antd';
import { useEffect, useState } from 'react';
import { useModel } from 'umi';
import styles from './CreateTaskModal.less';

interface CreateTaskModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function CreateTaskModal({
  visible,
  onClose,
}: CreateTaskModalProps) {
  const { formatMessage } = useIntl();
  const { reservedNftRest } = useModel('storyModel', (model) => ({
    reservedNftRest: model.reservedNftRest,
  }));
  const { runCreateStoryTask, loadingCreateStoryTask, taskModule } = useModel(
    'taskModel',
    (model) => ({
      runCreateStoryTask: model.runCreateStoryTask,
      loadingCreateStoryTask: model.loadingCreateStoryTask,
      taskModule: model.taskModule,
    }),
  );
  const { getToken } = useModel('walletModel', (model) => ({
    getToken: model.getToken,
  }));
  const { currentStory, balanceOfStoryNft, nfts, gettingNfts } = useModel(
    'storyModel',
    (model) => ({
      currentStory: model.currentStory,
      balanceOfStoryNft: model.balanceOfStoryNft,
      nfts: model.nfts,
      gettingNfts: model.gettingNfts,
    }),
  );
  const chainType = currentStory?.chainInfo.type;
  const token = getToken(chainType);

  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [rewards, setRewards] = useState<number[]>([]);

  useEffect(() => {
    setRewards([]);
  }, [currentStory]);

  return (
    <Modal
      centered={true}
      open={visible}
      onCancel={() => {
        !loadingCreateStoryTask && onClose();
      }}
      footer={null}
      width={720}
    >
      {taskModule === 'Chain' && (
        <Select
          disabled={loadingCreateStoryTask}
          mode="multiple"
          allowClear
          style={{ width: '100%', marginTop: 24, padding: 0 }}
          size={'large'}
          bordered={false}
          placeholder={formatMessage({ id: 'create-task.reward.placeholder' })}
          loading={gettingNfts}
          options={nfts?.map((nft: number) => ({
            value: nft,
            label: `${currentStory?.info.title} NFT #${nft}`,
          }))}
          value={rewards}
          notFoundContent={
            <Spin spinning={gettingNfts}>
              <div className={styles.noNftTip}>
                {!!reservedNftRest ? (
                  <>
                    <div>
                      {formatMessage({ id: 'create-task.nft-not-claimed' })}
                    </div>
                  </>
                ) : balanceOfStoryNft === 0 ? (
                  <div>{formatMessage({ id: 'create-task.reward.empty' })}</div>
                ) : undefined}
              </div>
            </Spin>
          }
          onChange={setRewards}
        />
      )}
      <Input
        disabled={loadingCreateStoryTask}
        maxLength={30}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ fontSize: 24, padding: 0, margin: '24px 0' }}
        bordered={false}
        placeholder={formatMessage({ id: 'create-task.task-name.placeholder' })}
      />
      <MDEditorWithPreview
        value={desc}
        disabled={loadingCreateStoryTask}
        onChange={(e) => setDesc(e)}
        placeholder={formatMessage({
          id: 'create-task.task-desc.placeholder',
        })}
        style={{ fontSize: 16 }}
      />
      <Button
        size={'large'}
        type={'primary'}
        block={true}
        disabled={!title || !desc}
        loading={loadingCreateStoryTask}
        onClick={async () => {
          try {
            await runCreateStoryTask(
              { title, description: desc, rewards },
              token,
            );
            onClose();
            setTitle('');
            setDesc('');
            setRewards([]);
            message.success(formatMessage({ id: 'create-task.created' }));
          } catch (e) {
            message.error(formatMessage({ id: 'request-failed' }));
          }
        }}
      >
        {formatMessage({ id: 'create-task.create' })}
      </Button>
    </Modal>
  );
}
