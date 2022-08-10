import StoryCard from '@/components/StoryCard/StoryCard';
import { useIntl } from '@@/plugin-locale';
import { PlusOutlined } from '@ant-design/icons';
import { Col, Row } from 'antd';
import styles from './StoryCard.less';

interface StoryCardListProps {
  createStory?: boolean;
  onCreateStory?: () => void;
}

export default function StoryCardList({
  createStory = false,
  onCreateStory,
}: StoryCardListProps) {
  const { formatMessage } = useIntl();

  return (
    <Row gutter={[24, 24]} style={{ minWidth: 1000 }}>
      {createStory && (
        <Col xxl={4} xl={4} lg={6} md={6} sm={6} xs={6}>
          <div className={styles.createCard} onClick={() => onCreateStory?.()}>
            <PlusOutlined />
            <div>{formatMessage({ id: 'writer.new-story' })}</div>
          </div>
        </Col>
      )}
      {new Array(6).fill(0).map((e, index) => (
        <Col key={index} xxl={4} xl={4} lg={6} md={6} sm={6} xs={6}>
          <StoryCard
            id={index}
            img={`https://picsum.photos/200/300?random=${index}`}
          />
        </Col>
      ))}
    </Row>
  );
}
