import CreateStoryModal from '@/components/CreateStoryModal/CreateStoryModal';
import StoryCardList from '@/components/StoryCard/StoryCardList';
import { useIntl } from '@@/plugin-locale';
import { useModel } from '@@/plugin-model';
import { PageContainer } from '@ant-design/pro-components';
import React, { useState } from 'react';
import styles from './index.less';

const Writer: React.FC = () => {
  const { formatMessage } = useIntl();
  const { myStories, gettingMyStories } = useModel('storyModel');

  const [createModalVisible, setCreateModalVisible] = useState(false);

  return (
    <PageContainer style={{ margin: '0 88px' }} title={false} ghost>
      <div className={styles.section}>
        <div className={styles.title}>
          {formatMessage({ id: 'writer.title.my-stories' })}
        </div>
        <StoryCardList
          stories={myStories}
          loading={gettingMyStories}
          createStory={true}
          onCreateStory={() => setCreateModalVisible(true)}
        />
      </div>
      <CreateStoryModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
      />
    </PageContainer>
  );
};

export default Writer;
