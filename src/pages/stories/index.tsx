import StoryCardList from '@/components/StoryCard/StoryCardList';
import { useIntl } from '@@/plugin-locale';
import { PageContainer } from '@ant-design/pro-components';
import React from 'react';
import { useModel } from 'umi';
import styles from './index.less';

const Stories: React.FC = () => {
  const { formatMessage } = useIntl();
  const {
    hottestStories,
    gettingHottestStories,
    latestStories,
    gettingLatestStories,
  } = useModel('storyModel');

  return (
    <PageContainer
      style={{ margin: '0 88px', minWidth: 1000 }}
      title={false}
      ghost
    >
      <div className={styles.section}>
        <div className={styles.title}>
          {formatMessage({ id: 'stories.title.hot-stories' })}
        </div>
        <StoryCardList
          stories={hottestStories}
          loading={gettingHottestStories}
          carousel={true}
        />
      </div>
      <div className={styles.section}>
        <div className={styles.title}>
          {formatMessage({ id: 'stories.title.latest-stories' })}
        </div>
        <StoryCardList stories={latestStories} loading={gettingLatestStories} />
      </div>
    </PageContainer>
  );
};

export default Stories;
