import CreateStoryModal from '@/components/CreateStoryModal/CreateStoryModal';
import NftCard from '@/components/NftCard/NftCard';
import PublishNftModal from '@/components/PublishNftModal/PublishNftModal';
import StoryTab from '@/components/StoryTab/StoryTab';
import { shortenAccount } from '@/utils/format';
import { useMatch } from '@@/exports';
import { useIntl } from '@@/plugin-locale';
import { EditOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { Badge, Button, Col, Row, Skeleton, Tabs, Typography } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useModel } from 'umi';
import styles from './index.less';

const Story: React.FC = () => {
  const { formatMessage } = useIntl();
  const match = useMatch('/story/:storyId');
  const { account } = useModel('walletModel', (model) => ({
    account: model.account,
  }));
  const { currentStory, setStoryId, storyId, gettingCurrentStory } = useModel(
    'storyModel',
    (model) => ({
      currentStory: model.currentStory,
      storyId: model.storyId,
      setStoryId: model.setStoryId,
      gettingCurrentStory: model.gettingCurrentStory,
    }),
  );

  const [nftModalVisible, setNftModalVisible] = useState(false);
  const [storyModalVisible, setStoryModalVisible] = useState(false);

  const isAuthor = useMemo(() => {
    if (currentStory && !!account) {
      return currentStory.author === account;
    } else {
      return false;
    }
  }, [currentStory, account]);

  useEffect(() => {
    if (match?.params.storyId) {
      setStoryId(match?.params.storyId);
    }
  }, [match]);

  return (
    <PageContainer style={{ margin: '0 88px' }} title={false} ghost>
      <Helmet title={currentStory?.info?.title} />
      <div className={['story-detail', styles.container].join(' ')}>
        <Row
          style={{ marginBottom: 24 }}
          gutter={[24, 48]}
          justify={'space-between'}
          wrap={true}
        >
          <Col>
            <Row gutter={48}>
              <Col>
                {gettingCurrentStory ? (
                  <Skeleton.Image active={true} />
                ) : (
                  <img
                    className={styles.cover}
                    src={`/ipfs/file/${currentStory?.info?.cover}`}
                  />
                )}
              </Col>
              <Col style={{ width: 400 }}>
                <Skeleton loading={gettingCurrentStory} active={true}>
                  <div className={styles.name}>
                    <div>{currentStory?.info?.title}</div>
                    <Button
                      icon={<EditOutlined />}
                      onClick={() => setStoryModalVisible(true)}
                    />
                  </div>
                  <div className={styles.infoGroup}>
                    <div className={styles.infoTitle}>
                      {formatMessage({ id: 'story.author' })}
                    </div>
                    <div className={styles.infoDescription}>
                      {shortenAccount(currentStory?.author)}
                    </div>
                  </div>
                  <div className={styles.infoGroup}>
                    <div className={styles.infoTitle}>
                      {formatMessage({ id: 'story.outline' })}
                    </div>
                    <Typography.Paragraph
                      ellipsis={{
                        rows: 8,
                        expandable: true,
                        symbol: 'more',
                        onExpand: (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        },
                      }}
                      className={styles.infoDescription}
                    >
                      {currentStory?.info?.description}
                    </Typography.Paragraph>
                  </div>
                  <div className={styles.infoGroup}>
                    <div className={styles.infoTitle}>
                      {formatMessage({ id: 'story.publish-at' })}
                    </div>
                    <div className={styles.infoDescription}>
                      {new Date(
                        currentStory?.info?.createAt,
                      ).toLocaleDateString()}
                    </div>
                  </div>
                </Skeleton>
              </Col>
            </Row>
          </Col>
          <Col>
            <NftCard
              isAuthor={isAuthor}
              published={!!currentStory?.nft}
              onPublish={() => setNftModalVisible(true)}
            />
          </Col>
        </Row>

        <Tabs
          defaultActiveKey={'story'}
          size={'large'}
          tabBarStyle={{
            fontSize: 18,
          }}
          tabBarExtraContent={
            <div>
              <Badge dot={currentStory?.info?.chapters.length === 0}>
                <Button>{formatMessage({ id: 'story.add-chapter' })}</Button>
              </Badge>
              <Button type={'primary'} style={{ marginLeft: 12 }}>
                {formatMessage({ id: 'story.save' })}
              </Button>
            </div>
          }
        >
          <Tabs.TabPane
            tab={formatMessage({ id: 'story.tab.story' })}
            key={'story'}
          >
            <StoryTab
              isAuthor={isAuthor}
              chapters={currentStory?.info?.chapters || []}
              storyId={storyId}
            />
          </Tabs.TabPane>
        </Tabs>
      </div>

      <PublishNftModal
        visible={nftModalVisible}
        onClose={() => setNftModalVisible(false)}
      />

      <CreateStoryModal
        id={currentStory?.info?.id}
        update={true}
        contentHash={currentStory?.contentHash}
        visible={storyModalVisible}
        onClose={() => setStoryModalVisible(false)}
      />
    </PageContainer>
  );
};

export default Story;
