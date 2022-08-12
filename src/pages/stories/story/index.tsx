import CreateStoryModal from '@/components/CreateStoryModal/CreateStoryModal';
import NftCard from '@/components/NftCard/NftCard';
import PublishNftModal from '@/components/PublishNftModal/PublishNftModal';
import StoryTab from '@/components/StoryTab/StoryTab';
import { uploadJson } from '@/services/api';
import { shortenAccount } from '@/utils/format';
import { useMatch } from '@@/exports';
import { useIntl } from '@@/plugin-locale';
import { EditOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useRequest } from 'ahooks';
import {
  Badge,
  Button,
  Col,
  message,
  Row,
  Skeleton,
  Tabs,
  Typography,
} from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { history, useModel } from 'umi';
import styles from './index.less';

const Story: React.FC = () => {
  const { formatMessage } = useIntl();
  const match = useMatch('/story/:storyId');
  const { account, chains, token, wallet } = useModel(
    'walletModel',
    (model) => ({
      account: model.account,
      chains: model.chains,
      token: model.token,
      wallet: model.wallet,
    }),
  );
  const {
    currentStory,
    setStoryId,
    storyId,
    gettingCurrentStory,
    refreshCurrentStory,
    chapters,
  } = useModel('storyModel', (model) => ({
    currentStory: model.currentStory,
    storyId: model.storyId,
    setStoryId: model.setStoryId,
    gettingCurrentStory: model.gettingCurrentStory,
    refreshCurrentStory: model.refreshCurrentStory,
    chapters: model.chapters,
  }));

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

  const { loading: saving, run: runSave } = useRequest(
    async () => {
      if (!wallet || !chains?.[0] || !currentStory) return;
      try {
        const { info } = currentStory;
        const currentTime = new Date().valueOf();
        const { cid } = await uploadJson<API.StoryDetail>(
          {
            title: info.title,
            cover: info.cover,
            description: info.description,
            chapters: chapters
              .filter((c: API.StoryChapter) => !c.delete)
              .map((c: API.StoryChapter) => ({
                name: c.name,
                content: c.content,
                createAt: c.createAt,
                updateAt: c.updateAt,
              })),
            createAt: info.createAt,
            updateAt: currentTime,
            version: '1',
          },
          token,
        );
        console.log(cid);
        await wallet.provider.updateStory(
          storyId,
          cid,
          chains[0].factoryAddress,
        );
        message.success(
          formatMessage({
            id: 'story.story-updated',
          }),
        );
        refreshCurrentStory();
      } catch (e) {
        console.log(e);
        message.error(formatMessage({ id: 'request-failed' }));
      }
    },
    {
      manual: true,
    },
  );

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
                {gettingCurrentStory || !currentStory ? (
                  <Skeleton.Image active={true} />
                ) : (
                  <img
                    className={styles.cover}
                    src={`/ipfs/file/${currentStory.info.cover}`}
                  />
                )}
              </Col>
              <Col style={{ width: 400 }}>
                <Skeleton loading={gettingCurrentStory} active={true}>
                  <div className={styles.name}>
                    <div>{currentStory?.info?.title}</div>
                    {isAuthor && (
                      <Button
                        disabled={saving}
                        icon={<EditOutlined />}
                        onClick={() => setStoryModalVisible(true)}
                      />
                    )}
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
              loading={saving}
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
            isAuthor && (
              <div>
                <Badge dot={chapters.length === 0}>
                  <Button
                    onClick={() =>
                      history.push(`/story/${storyId}/chapter/0/edit`)
                    }
                    disabled={saving}
                  >
                    {formatMessage({ id: 'story.add-chapter' })}
                  </Button>
                </Badge>
                <Button
                  type={'primary'}
                  style={{ marginLeft: 12 }}
                  onClick={runSave}
                  loading={saving}
                >
                  {formatMessage({ id: 'story.save' })}
                </Button>
              </div>
            )
          }
        >
          <Tabs.TabPane
            tab={formatMessage({ id: 'story.tab.story' })}
            key={'story'}
          >
            <StoryTab loading={saving} isAuthor={isAuthor} storyId={storyId} />
          </Tabs.TabPane>
        </Tabs>
      </div>

      <PublishNftModal
        visible={nftModalVisible}
        onClose={() => setNftModalVisible(false)}
      />

      <CreateStoryModal
        id={currentStory?.chainStoryId}
        update={true}
        contentHash={currentStory?.contentHash}
        visible={storyModalVisible}
        onClose={() => setStoryModalVisible(false)}
      />
    </PageContainer>
  );
};

export default Story;
