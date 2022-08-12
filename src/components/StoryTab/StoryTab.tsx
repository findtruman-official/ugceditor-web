import { useIntl } from '@@/plugin-locale';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Modal, Spin } from 'antd';
import { history, useModel } from 'umi';
import styles from './StoryTab.less';

interface StoryTabProps {
  loading: boolean;
  isAuthor: boolean;
  storyId: string;
}

const ChapterItem = ({
  isAuthor,
  chapter,
  storyId,
  deleted = false,
  onDelete,
  onUndoDelete,
}: {
  isAuthor: boolean;
  chapter: API.StoryChapter;
  storyId: string;
  deleted?: boolean;
  onDelete: () => void;
  onUndoDelete: () => void;
}) => {
  const { formatMessage } = useIntl();
  return (
    <div
      className={deleted ? styles.chapterCardDelete : styles.chapterCard}
      onClick={() => {
        !deleted && history.push(`/story/${storyId}/chapter/${chapter.id}`);
      }}
    >
      <div>{chapter.name}</div>
      {isAuthor &&
        (deleted ? (
          <div>
            <a
              className={styles.actionButton}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onUndoDelete();
              }}
            >
              {formatMessage({ id: 'story.undo-delete' })}
            </a>
          </div>
        ) : (
          <div>
            <a
              className={styles.actionButton}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                history.push(`/story/${storyId}/chapter/${chapter.id}/edit`);
              }}
            >
              {formatMessage({ id: 'story.edit' })}
            </a>
            <a
              className={styles.actionButton}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete();
              }}
            >
              {formatMessage({ id: 'story.delete' })}
            </a>
          </div>
        ))}
    </div>
  );
};

export default function StoryTab({
  loading,
  isAuthor,
  storyId,
}: StoryTabProps) {
  const { formatMessage } = useIntl();

  const { chapters, setChapters } = useModel('storyModel', (model) => ({
    chapters: model.chapters,
    setChapters: model.setChapters,
  }));

  const handleDelete = (id: number, name: string) => {
    Modal.confirm({
      centered: true,
      title: formatMessage({ id: 'story.delete-confirm-title' }, { name }),
      icon: <ExclamationCircleOutlined />,
      content: formatMessage({ id: 'story.delete-confirm-desc' }),
      okText: formatMessage({ id: 'story.delete-confirm.confirm' }),
      okType: 'danger',
      cancelText: formatMessage({ id: 'story.delete-confirm.cancel' }),
      onOk() {
        setChapters((state: API.StoryChapter[]) =>
          state.map((e) => {
            return {
              ...e,
              delete: e.id === id ? true : e.delete,
            };
          }),
        );
      },
      onCancel() {},
    });
  };

  const handleUndoDelete = (id: number) => {
    setChapters((state: API.StoryChapter[]) =>
      state.map((e) => {
        return {
          ...e,
          delete: e.id === id ? false : e.delete,
        };
      }),
    );
  };

  return (
    <div className={styles.container}>
      <Spin spinning={loading}>
        {chapters.length === 0 ? (
          <div className={styles.noChapterTip}>
            {formatMessage({ id: 'story.no-chapter-tip' })}
          </div>
        ) : (
          chapters.map((chapter: API.StoryChapter) => (
            <ChapterItem
              key={chapter.id}
              isAuthor={isAuthor}
              chapter={chapter}
              storyId={storyId}
              deleted={chapter.delete}
              onDelete={() => handleDelete(chapter.id, chapter.name)}
              onUndoDelete={() => handleUndoDelete(chapter.id)}
            />
          ))
        )}
      </Spin>
    </div>
  );
}
