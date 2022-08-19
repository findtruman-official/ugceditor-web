import { ChainType } from '@/wallets';
import { useIntl } from '@@/plugin-locale';
import { Skeleton, Spin, Tag, Tooltip } from 'antd';
import { useState } from 'react';
import { history } from 'umi';
import styles from './StoryCard.less';

interface StoryCardProps {
  id?: string;
  img: string;
  chainType?: ChainType;
  chainName: string;
  loading?: boolean;
}

export default function StoryCard({
  id,
  img,
  chainType,
  chainName,
  loading = false,
}: StoryCardProps) {
  const { formatMessage } = useIntl();
  const [loaded, setLoaded] = useState(false);

  return (
    <div style={{ position: 'relative' }} className={styles.storyCard}>
      <Spin
        spinning={loading}
        tip={formatMessage({ id: 'story.waiting-for-sync' })}
      >
        <img
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            chainType && history.push(`/story/${chainType}/${id}`);
          }}
          className={styles.cover}
          src={img}
          onLoad={() => setLoaded(true)}
        />
        {loaded && (
          <Tooltip
            title={formatMessage(
              { id: 'stories.published-on' },
              { chain: chainName },
            )}
          >
            <Tag className={styles.publishTag} color={'#3e38d9'}>
              {chainName}
            </Tag>
          </Tooltip>
        )}
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
