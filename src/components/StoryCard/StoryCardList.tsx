import StoryCard from '@/components/StoryCard/StoryCard';
import { PREFIX } from '@/utils/const';
import { ChainType } from '@/wallets';
import { useIntl } from '@@/plugin-locale';
import { PlusOutlined } from '@ant-design/icons';
import { Col, Row, Skeleton } from 'antd';
import styles from './StoryCard.less';

interface StoryCardListProps {
  stories?: {
    id: string;
    cover: string;
    name: string;
    description: string;
    nftPublished: boolean;
    chain: string;
    chainType?: ChainType;
    loading?: boolean;
  }[];
  loading: boolean;
  createStory?: boolean;
  onCreateStory?: () => void;
  carousel?: boolean;
}

export default function StoryCardList({
  stories = [],
  loading,
  createStory = false,
  onCreateStory,
  carousel = false,
}: StoryCardListProps) {
  const { formatMessage } = useIntl();

  return (
    <div style={{ position: 'relative' }}>
      {carousel && !loading && <div style={{ height: 470 }} />}
      <Row
        gutter={[24, 24]}
        style={{ minWidth: 1000 }}
        justify={'start'}
        wrap={!carousel}
        className={carousel && !loading ? styles.scrollList : ''}
      >
        {createStory && (
          <Col>
            <div
              className={styles.createCard}
              onClick={() => onCreateStory?.()}
            >
              <PlusOutlined />
              <div>{formatMessage({ id: 'writer.new-story' })}</div>
            </div>
          </Col>
        )}
        {loading ? (
          new Array(4).fill(0).map((e, index) => (
            <Col key={index}>
              <Skeleton.Image active={true} />
            </Col>
          ))
        ) : stories.length === 0 && !createStory ? (
          <div className={styles.noStoryTip}>
            {formatMessage({ id: 'stories.no-story-tip' })}
          </div>
        ) : (
          [
            ...stories
              ?.filter((e) => !!e)
              .map((e) => (
                <Col key={`1_${e.chainType}_${e.id}`}>
                  <StoryCard
                    id={e.id}
                    img={`${PREFIX}/ipfs/file/${encodeURIComponent(
                      e.cover || '',
                    )}`}
                    chainName={e.chain}
                    name={e.name}
                    description={e.description}
                    nftPublished={e.nftPublished}
                    chainType={e.chainType}
                    loading={e.loading}
                  />
                </Col>
              )),
            ...(carousel
              ? stories
                  ?.filter((e) => !!e)
                  .map((e) => (
                    <Col key={`2_${e.chainType}_${e.id}`}>
                      <StoryCard
                        id={e.id}
                        img={`${PREFIX}/ipfs/file/${encodeURIComponent(
                          e.cover || '',
                        )}`}
                        chainName={e.chain}
                        name={e.name}
                        description={e.description}
                        nftPublished={e.nftPublished}
                        chainType={e.chainType}
                        loading={e.loading}
                      />
                    </Col>
                  ))
              : []),
          ]
        )}
      </Row>
    </div>
  );
}
