import CreateStoryModal from '@/components/CreateStoryModal/CreateStoryModal';
import NftCard from '@/components/NftCard/NftCard';
import PublishNftModal from '@/components/PublishNftModal/PublishNftModal';
import StoryTab from '@/components/StoryTab/StoryTab';
import WorkTab from '@/components/WorkTab/WorkTab';
import { WalletContext, WalletContextType } from '@/layouts';
import { uploadJson } from '@/services/api';
import { PREFIX } from '@/utils/const';
import { shortenAccount } from '@/utils/format';
import { ChainLogos } from '@/utils/logos';
import { ChainType } from '@/wallets';
import { useMatch } from '@@/exports';
import { useIntl } from '@@/plugin-locale';
import { EditOutlined, LeftOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useRequest } from 'ahooks';
import {
  Badge,
  Button,
  Col,
  message,
  Modal,
  Row,
  Skeleton,
  Spin,
  Tabs,
  Typography,
} from 'antd';
import React, { useContext, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { history, useModel } from 'umi';
import styles from './index.less';

const Story: React.FC = () => {
  const { confirmLogin } = useContext<WalletContextType>(WalletContext);
  const { formatMessage } = useIntl();
  const match = useMatch('/story/:chainType/:storyId');

  const { accounts, chains, getToken, getTokenAsync, connectedWallets } =
    useModel('walletModel', (model) => ({
      accounts: model.accounts,
      chains: model.chains,
      getToken: model.getToken,
      getTokenAsync: model.getTokenAsync,
      connectedWallets: model.connectedWallets,
    }));
  const {
    isAuthor,
    currentStory,
    chainType,
    setChainType,
    setStoryId,
    storyId,
    gettingCurrentStory,
    chapters,
    chapterCaches,
    clearChapterCaches,
    nftSalePolling,
    updateStoryPolling,
    addUpdateStoryPolling,
  } = useModel('storyModel', (model) => ({
    isAuthor: model.isAuthor,
    currentStory: model.currentStory,
    chainType: model.chainType,
    setChainType: model.setChainType,
    storyId: model.storyId,
    setStoryId: model.setStoryId,
    gettingCurrentStory: model.gettingCurrentStory,
    chapters: model.chapters,
    chapterCaches: model.chapterCaches,
    clearChapterCaches: model.clearChapterCaches,
    nftSalePolling: model.nftSalePolling,
    updateStoryPolling: model.updateStoryPolling,
    addUpdateStoryPolling: model.addUpdateStoryPolling,
  }));

  const chain = currentStory?.chainInfo.type;
  const account = accounts[chain];
  const wallet = connectedWallets[chain];

  const [nftModalVisible, setNftModalVisible] = useState(false);
  const [storyModalVisible, setStoryModalVisible] = useState(false);
  const [descModalVisible, setDescModalVisible] = useState(false);

  const [currentTab, setCurrentTab] = useState<string>('story');

  useEffect(() => {
    setNftModalVisible(false);
    setStoryModalVisible(false);
  }, [account]);

  useEffect(() => {
    if (match?.params.storyId && match?.params.chainType) {
      setChainType(match.params.chainType);
      setStoryId(match.params.storyId);
    }
  }, [match]);

  const { loading: saving, run: runSave } = useRequest(
    async () => {
      if (!chain || !wallet || !currentStory) return;

      let token = await getTokenAsync(chain, true);

      try {
        const { info } = currentStory;
        const currentTime = new Date().valueOf();
        const { cid } = await uploadJson<API.StoryDetail>(
          {
            title: info.title,
            cover: info.cover,
            description: info.description,
            chapters: [
              ...chapters
                .filter((c: API.StoryChapter) => !c.delete)
                .map((c: API.StoryChapter) => {
                  const cache = chapterCaches?.find(
                    (_c: API.ChapterStorage) => _c.id === c.id,
                  );
                  return {
                    name: cache?.name || c.name,
                    content: cache?.content || c.content,
                    createAt: c.createAt,
                    updateAt: cache?.timestamp || c.updateAt,
                  };
                }),
              ...chapterCaches
                ?.filter(
                  (chapter: API.ChapterStorage) =>
                    !chapters.find(
                      (c: API.StoryChapter) => c.id === chapter.id,
                    ),
                )
                .map((chapter: API.ChapterStorage) => ({
                  name: chapter.name,
                  content: chapter.content,
                  createAt: chapter.timestamp,
                  updateAt: chapter.timestamp,
                })),
            ],
            createAt: info.createAt,
            updateAt: currentTime,
            version: '1',
          },
          token,
        );
        await wallet.provider.updateStory(storyId, cid);

        addUpdateStoryPolling({
          id: storyId,
          contentHash: cid,
          chainType: chain,
        });

        message.success(
          formatMessage({
            id: 'story.story-updated',
          }),
        );
        clearChapterCaches();
        // refreshCurrentStory();
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
      <Helmet title={`${currentStory?.info?.title || ''} - UGCEditor`} />
      {gettingCurrentStory || currentStory ? (
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
                  <Spin
                    spinning={updateStoryPolling}
                    tip={formatMessage({ id: 'story.waiting-for-sync' })}
                  >
                    {gettingCurrentStory || !currentStory ? (
                      <Skeleton.Image active={true} />
                    ) : (
                      <img
                        className={styles.cover}
                        src={`${PREFIX}/ipfs/file/${encodeURIComponent(
                          currentStory.info?.cover,
                        )}`}
                      />
                    )}
                  </Spin>
                </Col>
                <Col style={{ width: 400 }}>
                  <Spin
                    spinning={updateStoryPolling}
                    tip={formatMessage({ id: 'story.waiting-for-sync' })}
                  >
                    <Skeleton loading={gettingCurrentStory} active={true}>
                      <div className={styles.name}>
                        <div>{currentStory?.info?.title}</div>
                        {isAuthor && (
                          <Button
                            disabled={saving}
                            size={'large'}
                            type={'text'}
                            icon={<EditOutlined />}
                            onClick={() => {
                              const chain = currentStory.chainInfo.type;
                              const token = getToken(chain);
                              if (!token) {
                                confirmLogin(chain, {
                                  onConfirm: () => setStoryModalVisible(true),
                                });
                              } else {
                                setStoryModalVisible(true);
                              }
                            }}
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
                            rows: 5,
                            expandable: true,
                            symbol: (
                              <span
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  setDescModalVisible(true);
                                }}
                              >
                                {formatMessage({ id: 'story.more' })}
                              </span>
                            ),
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
                      <div className={styles.infoGroup}>
                        <div className={styles.infoTitle}>
                          {formatMessage({ id: 'story.publish-on' })}
                        </div>
                        {currentStory?.chainInfo && (
                          <img
                            className={styles.infoDescriptionImg}
                            src={
                              ChainLogos[
                                currentStory.chainInfo.type as ChainType
                              ]
                            }
                          />
                        )}
                      </div>
                    </Skeleton>
                  </Spin>
                </Col>
              </Row>
            </Col>
            <Col>
              <NftCard
                syncing={nftSalePolling}
                loading={saving}
                onPublish={() => {
                  const chain = currentStory.chainInfo.type;
                  const token = getToken(chain);
                  if (!token) {
                    confirmLogin(chain, {
                      onConfirm: () => setNftModalVisible(true),
                    });
                  } else {
                    setNftModalVisible(true);
                  }
                }}
              />
            </Col>
          </Row>

          <Tabs
            onTabClick={(tab) => setCurrentTab(tab)}
            activeKey={currentTab}
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
                        history.push(
                          `/story/${chainType}/${storyId}/chapter/0/edit`,
                        )
                      }
                      disabled={saving || updateStoryPolling}
                    >
                      {formatMessage({ id: 'story.add-chapter' })}
                    </Button>
                  </Badge>
                  <Button
                    type={'primary'}
                    style={{ marginLeft: 12 }}
                    onClick={() => {
                      const chain = currentStory.chainInfo.type;
                      const token = getToken(chain);
                      if (!token) {
                        confirmLogin(chain, {
                          onConfirm: () => runSave(),
                        });
                      } else {
                        runSave();
                      }
                    }}
                    loading={saving || updateStoryPolling}
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
              <StoryTab
                loading={saving || updateStoryPolling}
                storyId={storyId}
                chainType={chainType}
              />
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={formatMessage({ id: 'story.tab.works' })}
              key={'work'}
            >
              <WorkTab />
            </Tabs.TabPane>
          </Tabs>
        </div>
      ) : (
        <div className={styles.notFoundTip}>
          <div>{formatMessage({ id: 'story.story-not-found' })}</div>
          <Button
            shape={'circle'}
            size={'large'}
            icon={<LeftOutlined />}
            onClick={() => {
              history.push(`/stories`);
            }}
          />
        </div>
      )}

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

      <Modal
        open={descModalVisible}
        onCancel={() => setDescModalVisible(false)}
        title={false}
        closable={false}
        centered={true}
        footer={false}
      >
        <div style={{ fontSize: 16, whiteSpace: 'pre-wrap' }}>
          {currentStory?.info?.description}
        </div>
      </Modal>
    </PageContainer>
  );
};

export default Story;
