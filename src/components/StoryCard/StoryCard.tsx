import { useIntl } from '@@/plugin-locale';
import { Skeleton, Tag, Tooltip } from 'antd';
import { useState } from 'react';
import { history } from 'umi';
import styles from './StoryCard.less';

interface StoryCardProps {
  id?: number;
  img: string;
  chain: string;
}

export default function StoryCard({ id, img, chain }: StoryCardProps) {
  const { formatMessage } = useIntl();
  const [loaded, setLoaded] = useState(false);

  // TODO: 显示chain
  return (
    <div style={{ position: 'relative' }} className={styles.storyCard}>
      <img
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          history.push(`/story/${id}`);
        }}
        className={styles.cover}
        src={img}
        onLoad={() => setLoaded(true)}
      />
      {loaded && (
        <Tooltip
          title={formatMessage({ id: 'stories.published-on' }, { chain })}
        >
          <Tag className={styles.publishTag} color={'#3e38d9'}>
            {chain}
          </Tag>
        </Tooltip>
      )}
      {!loaded && (
        <Skeleton.Image
          style={{ position: 'absolute', left: 0, top: 0 }}
          active={true}
        />
      )}
    </div>
  );
}
