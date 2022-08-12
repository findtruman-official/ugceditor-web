import { useIntl } from '@@/plugin-locale';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Modal } from 'antd';
import { history } from 'umi';
import styles from './StoryTab.less';

interface StoryTabProps {
  isAuthor: boolean;
  storyId: string;
  chapters: API.StoryChapter[];
}

const ChapterItem = ({
  isAuthor,
  chapter,
  storyId,
  onDelete,
}: {
  isAuthor: boolean;
  chapter: API.StoryChapter;
  storyId: string;
  onDelete: () => void;
}) => {
  return (
    <div
      className={styles.chapterCard}
      onClick={() => history.push(`/story/${storyId}/chapter/${chapter.id}`)}
    >
      <div>{chapter.name}</div>
      {isAuthor && (
        <div>
          <a
            className={styles.actionButton}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              history.push(`/story/${storyId}/chapter/${chapter.id}/edit`);
            }}
          >
            Edit
          </a>
          <a
            className={styles.actionButton}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete();
            }}
          >
            Delete
          </a>
        </div>
      )}
    </div>
  );
};

export default function StoryTab({
  isAuthor,
  chapters = [],
  storyId,
}: StoryTabProps) {
  const { formatMessage } = useIntl();

  const handleDelete = (name: string) => {
    Modal.confirm({
      centered: true,
      title: formatMessage({ id: 'story.delete-confirm-title' }, { name }),
      icon: <ExclamationCircleOutlined />,
      content: formatMessage({ id: 'story.delete-confirm-desc' }),
      okText: formatMessage({ id: 'story.delete-confirm.confirm' }),
      okType: 'danger',
      cancelText: formatMessage({ id: 'story.delete-confirm.cancel' }),
      onOk() {},
      onCancel() {},
    });
  };

  return (
    <div className={styles.container}>
      {chapters?.length === 0 ? (
        <div className={styles.noChapterTip}>
          {formatMessage({ id: 'story.no-chapter-tip' })}
        </div>
      ) : (
        chapters?.map((chapter) => (
          <ChapterItem
            isAuthor={isAuthor}
            chapter={chapter}
            storyId={storyId}
            onDelete={() => {}}
          />
        ))
      )}
    </div>
  );
}
