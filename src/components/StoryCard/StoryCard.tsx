import { Image } from 'antd';
import styles from './StoryCard.less';

interface StoryCardProps {
  img: string;
}

export default function StoryCard({ img }: StoryCardProps) {
  return (
    <div>
      <Image src={img} className={styles.storyCard} preview={false} />
    </div>
  );
}
