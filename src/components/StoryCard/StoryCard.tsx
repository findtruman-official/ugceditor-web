import { history } from 'umi';
import styles from './StoryCard.less';

interface StoryCardProps {
  id: number;
  img: string;
}

export default function StoryCard({ id, img }: StoryCardProps) {
  return (
    <img
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        history.push(`/stories/story/${id}`);
      }}
      src={img}
      className={styles.storyCard}
      // preview={false}
    />
  );
}
