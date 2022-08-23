import { ChainLogos } from '@/utils/logos';
import { ChainType } from '@/wallets';
import { useIntl } from '@@/plugin-locale';
import { Skeleton, Spin, Tooltip, Typography } from 'antd';
import { useState } from 'react';
import { history } from 'umi';
import styles from './StoryCard.less';

interface StoryCardProps {
  id?: string;
  img: string;
  name: string;
  description: string;
  nftPublished: boolean;
  chainType?: ChainType;
  chainName: string;
  loading?: boolean;
}

export default function StoryCard({
  id,
  img,
  name,
  description,
  nftPublished,
  chainType,
  chainName,
  loading = false,
}: StoryCardProps) {
  const { formatMessage } = useIntl();
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        chainType && history.push(`/story/${chainType}/${id}`);
      }}
      style={{ position: 'relative' }}
      className={styles.storyCard}
    >
      <Spin
        spinning={loading}
        tip={formatMessage({ id: 'story.waiting-for-sync' })}
      >
        <img
          className={styles.cover}
          src={img}
          onLoad={() => setLoaded(true)}
        />
        <div className={styles.meta}>
          <div className={styles.metaName}>{name}</div>
          <Typography.Paragraph
            style={{ marginBottom: 0 }}
            ellipsis={{
              expandable: false,
              rows: 2,
            }}
            className={styles.metaDesc}
          >
            {description}
          </Typography.Paragraph>
          <div className={styles.metaChain}>
            {nftPublished ? (
              <Tooltip title={`${name} NFT`}>
                <div className={styles.metaNft}>NFT</div>
              </Tooltip>
            ) : (
              <div />
            )}
            <Tooltip
              title={formatMessage(
                { id: 'stories.published-on' },
                { chain: chainName },
              )}
            >
              <img
                className={styles.metaChainImg}
                src={ChainLogos[chainType as ChainType]}
              />
            </Tooltip>
          </div>
        </div>
        {!loaded && (
          <Skeleton.Image
            style={{ position: 'absolute', left: 0, top: 0 }}
            active={true}
          />
        )}
      </Spin>
    </div>
  );
}
