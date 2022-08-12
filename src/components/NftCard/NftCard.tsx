import { useIntl } from '@@/plugin-locale';
import { Button, Col, InputNumber, Row } from 'antd';
import styles from './NftCard.less';

interface NftCardProps {
  isAuthor: boolean;
  published: boolean;
  onPublish: () => void;
}

export default function NftCard({
  isAuthor,
  published,
  onPublish,
}: NftCardProps) {
  const { formatMessage } = useIntl();
  return (
    <div className={styles.container}>
      {published ? (
        <div className={styles.nftCard}>
          <img
            className={styles.nftCover}
            src={'https://picsum.photos/200/200'}
          />
          <div className={styles.nftMeta}>
            <div className={styles.nftName}>Story A NFT</div>
            <Row gutter={[8, 8]} style={{ marginBottom: 12 }}>
              <Col span={12}>
                <div className={styles.nftMetaLabel}>
                  {formatMessage({ id: 'story.total' })}
                </div>
                <div className={styles.nftMetaValue}>5000</div>
              </Col>
              <Col span={12}>
                <div className={styles.nftMetaLabel}>
                  {formatMessage({ id: 'story.price' })}
                </div>
                <div className={styles.nftMetaValue}>200 $Finds</div>
              </Col>
              <Col span={12}>
                <div className={styles.nftMetaLabel}>
                  {formatMessage({ id: 'story.rest' })}
                </div>
                <div className={styles.nftMetaValue}>1524</div>
              </Col>
              <Col span={12}>
                <div className={styles.nftMetaLabel}>
                  {formatMessage({ id: 'story.own' })}
                </div>
                <div className={styles.nftMetaValue}>0 NFT</div>
              </Col>
            </Row>
            <Row gutter={12} wrap={false}>
              <Col flex={'auto'}>
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder={formatMessage({ id: 'story.amount' })}
                />
              </Col>
              <Col>
                <Button type={'primary'}>
                  {formatMessage({ id: 'story.claim' })}
                </Button>
              </Col>
            </Row>
          </div>
        </div>
      ) : (
        <div className={styles.publishCard}>
          <div className={styles.publishTitle}>
            {formatMessage({ id: 'story.publish-story-nft' })}
          </div>
          <Button type={'primary'} onClick={onPublish}>
            {formatMessage({ id: 'story.publish' })}
          </Button>
        </div>
      )}
    </div>
  );
}
