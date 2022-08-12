import StoryCard from '@/components/StoryCard/StoryCard';
import { useIntl } from '@@/plugin-locale';
import { PlusOutlined } from '@ant-design/icons';
import { Col, Row, Skeleton } from 'antd';
import styles from './StoryCard.less';

interface StoryCardListProps {
  stories?: API.Story[];
  loading: boolean;
  createStory?: boolean;
  onCreateStory?: () => void;
}

export default function StoryCardList({
  stories = [],
  loading,
  createStory = false,
  onCreateStory,
}: StoryCardListProps) {
  const { formatMessage } = useIntl();

  return (
    <Row gutter={[24, 24]} style={{ minWidth: 1000 }}>
      {createStory && (
        <Col span={4}>
          <div className={styles.createCard} onClick={() => onCreateStory?.()}>
            <PlusOutlined />
            <div>{formatMessage({ id: 'writer.new-story' })}</div>
          </div>
        </Col>
      )}
      {loading ? (
        new Array(6).fill(0).map((e, index) => (
          <Col key={index} span={4}>
            <Skeleton.Image active={true} />
          </Col>
        ))
      ) : stories.length === 0 && !createStory ? (
        <div className={styles.noStoryTip}>
          {formatMessage({ id: 'stories.no-story-tip' })}
        </div>
      ) : (
        stories.map((e, index) => (
          <Col key={index} span={4}>
            <StoryCard
              id={e.info?.id}
              img={`/ipfs/file/${e.info?.cover}`}
              chain={e.chainInfo.name}
            />
          </Col>
        ))
      )}
    </Row>
  );
}
