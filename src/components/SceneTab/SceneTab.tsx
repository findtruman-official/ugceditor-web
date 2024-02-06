import Scene1 from '@/assets/scene/1508117989_10094850.jpg';
import Scene2 from '@/assets/scene/1687787811_10094826.jpg';
import Scene4 from '@/assets/scene/400993147_10092756.jpg';
import Scene0 from '@/assets/scene/587393369_10094725.jpg';
import Scene3 from '@/assets/scene/588629520_10093302.jpg';
import { SceneCard } from '@/components/SceneTab/SceneCard';
import { useModel } from '@@/exports';
import { useIntl } from '@@/plugin-locale';
import { Col, Row } from 'antd';
import styles from './SceneTab.less';

const Scenes = [Scene0, Scene1, Scene2, Scene3, Scene4];

export default function SceneTab() {
  const { formatMessage } = useIntl();

  const { isAuthor, chapters } = useModel('storyModel', (model) => ({
    isAuthor: model.isAuthor,
    chapters: model.chapters,
  }));

  return (
    <div className={styles.container}>
      {chapters.length === 0 ? (
        <div className={styles.noChapterTip}>
          {formatMessage({ id: 'story.no-chapter-tip' })}
        </div>
      ) : (
        <Row gutter={[24, 24]}>
          {chapters.map((chapter: API.StoryChapter, index) => (
            <Col span={6} key={chapter.id}>
              <SceneCard
                img={Scenes[index]}
                chapter={chapter}
                isAuthor={isAuthor}
              />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
