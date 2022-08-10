import NftCard from '@/components/NftCard/NftCard';
import PublishNftModal from '@/components/PublishNftModal/PublishNftModal';
import StoryTab from '@/components/StoryTab/StoryTab';
import { useMatch } from '@@/exports';
import { useIntl } from '@@/plugin-locale';
import { PageContainer } from '@ant-design/pro-components';
import { Col, Row, Tabs, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useModel } from 'umi';
import styles from './index.less';

const Story: React.FC = () => {
  const { formatMessage } = useIntl();
  const match = useMatch('/stories/story/:id');
  const { setStoryName } = useModel('storyModel');
  const [nftModalVisible, setNftModalVisible] = useState(false);

  useEffect(() => {
    return () => {
      setStoryName('');
    };
  }, []);

  useEffect(() => {
    if (match?.params.id) {
      setStoryName('Story A');
    }
  }, [match]);

  return (
    <PageContainer style={{ margin: '0 88px' }} title={false} ghost>
      <Helmet title={match?.params.id} />
      <div className={styles.container}>
        <Row
          style={{ marginBottom: 24 }}
          gutter={[24, 48]}
          justify={'space-between'}
          wrap={true}
        >
          <Col>
            <Row gutter={48}>
              <Col>
                <img
                  className={styles.cover}
                  src={'https://picsum.photos/200/300'}
                />
              </Col>
              <Col style={{ width: 400 }}>
                <div className={styles.name}>Story A</div>
                <div className={styles.infoGroup}>
                  <div className={styles.infoTitle}>
                    {formatMessage({ id: 'story.author' })}
                  </div>
                  <div className={styles.infoDescription}>0x3a...xas</div>
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
                    Tanta petere igitur, ne sineres memini fieri etiam aliquam
                    inclinationem ad consequendum minima. Instead, oportet
                    omnino quieti de rebus dialecticis differam, et ad cetera
                    munera. Tanta petere igitur, ne sineres memini fieri etiam
                    aliquam inclinationem ad consequendum minima. Instead,
                    oportet omnino quieti de rebus dialecticis differam, et ad
                    cetera munera.
                  </Typography.Paragraph>
                </div>
                <div className={styles.infoGroup}>
                  <div className={styles.infoTitle}>
                    {formatMessage({ id: 'story.publish-at' })}
                  </div>
                  <div className={styles.infoDescription}>2022-07</div>
                </div>
              </Col>
            </Row>
          </Col>
          <Col>
            <NftCard
              published={true}
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
        >
          <Tabs.TabPane
            tab={formatMessage({ id: 'story.tab.story' })}
            key={'story'}
          >
            <StoryTab />
          </Tabs.TabPane>
        </Tabs>
      </div>

      <PublishNftModal
        visible={nftModalVisible}
        onClose={() => setNftModalVisible(false)}
      />
    </PageContainer>
  );
};

export default Story;
