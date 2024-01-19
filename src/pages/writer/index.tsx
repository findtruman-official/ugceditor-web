import CreateStoryModal from '@/components/CreateStoryModal/CreateStoryModal';
import StoryCardList from '@/components/StoryCard/StoryCardList';
import { WalletContext, WalletContextType } from '@/layouts';
import { useIntl } from '@@/plugin-locale';
import { useModel } from '@@/plugin-model';
import { PageContainer } from '@ant-design/pro-components';
import { Button, Modal } from 'antd';
import React, { useContext, useState } from 'react';
import styles from './index.less';

const Writer: React.FC = () => {
  const { formatMessage } = useIntl();

  const { openWalletModal } = useContext<WalletContextType>(WalletContext);
  const { myStories, gettingMyStories, createStoryPollingList } = useModel(
    'storyModel',
    (model) => ({
      myStories: model.myStories,
      gettingMyStories: model.gettingMyStories,
      createStoryPollingList: model.createStoryPollingList,
    }),
  );
  const { connectedWallets } = useModel('walletModel', (model) => ({
    connectedWallets: model.connectedWallets,
  }));
  const { profiles } = useModel('profileModel');

  const [createModalVisible, setCreateModalVisible] = useState(false);

  return (
    <PageContainer style={{ margin: '0 88px' }} title={false} ghost>
      <div className={styles.section}>
        <div className={styles.title}>
          {formatMessage({ id: 'writer.title.my-stories' })}
        </div>
        {Object.values(connectedWallets).some((w) => !!w) ? (
          <StoryCardList
            stories={createStoryPollingList.concat(myStories)}
            loading={gettingMyStories}
            createStory={true}
            onCreateStory={() => {
              if (profiles.length === 0) {
                Modal.confirm({
                  centered: true,
                  title: formatMessage({
                    id: 'profile.create-title',
                  }),
                  content: formatMessage({
                    id: 'profile.create-desc',
                  }),
                  okText: formatMessage({
                    id: 'profile.create-profile',
                  }),
                  onOk: () => {
                    window.open(
                      'https://dpm.desmos.network/',
                      '_blank',
                      'noreferrer noopener',
                    );
                  },
                });
              } else {
                setCreateModalVisible(true);
              }
            }}
          />
        ) : (
          <div style={{ textAlign: 'center' }}>
            <Button
              style={{ margin: '24px auto' }}
              shape={'round'}
              type={'primary'}
              size={'large'}
              onClick={openWalletModal}
            >
              {formatMessage({ id: 'header.connect-wallet' })}
            </Button>
          </div>
        )}
      </div>
      <CreateStoryModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
      />
    </PageContainer>
  );
};

export default Writer;
