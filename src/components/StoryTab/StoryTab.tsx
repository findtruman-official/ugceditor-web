import styles from './StoryTab.less';

interface StoryTabProps {}

export default function StoryTab({}: StoryTabProps) {
  return (
    <div className={styles.container}>
      <div className={styles.chapterCard}>Chapter 1</div>
      <div className={styles.chapterCard}>Chapter 2</div>
      <div className={styles.chapterCard}>Chapter 3</div>
    </div>
  );
}
