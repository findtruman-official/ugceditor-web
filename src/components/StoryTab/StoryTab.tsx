import { ChainType } from '@/wallets';
import { useIntl } from '@@/plugin-locale';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Modal, Spin, Tag } from 'antd';
import { history, useModel } from 'umi';
import styles from './StoryTab.less';

interface StoryTabProps {
  loading: boolean;
  storyId: string;
  chainType: ChainType;
}

const ChapterItem = ({
  type = 'default',
  isAuthor,
  chapter,
  chainType,
  storyId,
  deleted = false,
  onDelete,
  onUndoDelete,
}: {
  type: 'new' | 'modified' | 'default';
  isAuthor: boolean;
  chapter: { id: number; name: string };
  chainType: ChainType;
  storyId: string;
  deleted?: boolean;
  onDelete: () => void;
  onUndoDelete?: () => void;
}) => {
  const { formatMessage } = useIntl();
  return (
    <div
      className={
        isAuthor && deleted ? styles.chapterCardDelete : styles.chapterCard
      }
      onClick={() => {
        if (!isAuthor || (!deleted && type !== 'new')) {
          history.push(`/story/${chainType}/${storyId}/chapter/${chapter.id}`);
        }
      }}
    >
      <div>
        {isAuthor && type === 'modified' && (
          <Tag color={'#3e38d9'}>{formatMessage({ id: 'story.modified' })}</Tag>
        )}
        {isAuthor && type === 'new' && (
          <Tag color={'#3e38d9'}>{formatMessage({ id: 'story.new' })}</Tag>
        )}
        {chapter.name}
      </div>
      {isAuthor &&
        (deleted ? (
          <div>
            <a
              className={styles.actionButton}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onUndoDelete?.();
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
                history.push(
                  `/story/${chainType}/${storyId}/chapter/${chapter.id}/edit`,
                );
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
  storyId,
  chainType,
}: StoryTabProps) {
  const { formatMessage } = useIntl();

  const { isAuthor, chapters, chapterCaches, deleteChapterCache, setChapters } =
    useModel('storyModel', (model) => ({
      isAuthor: model.isAuthor,
      chapters: model.chapters,
      chapterCaches: model.chapterCaches,
      deleteChapterCache: model.deleteChapterCache,
      setChapters: model.setChapters,
    }));

  const handleDelete = (id: number, name: string, isCache = false) => {
    Modal.confirm({
      centered: true,
      title: formatMessage({ id: 'story.delete-confirm-title' }, { name }),
      icon: <ExclamationCircleOutlined />,
      content: !isCache && formatMessage({ id: 'story.delete-confirm-desc' }),
      okText: formatMessage({ id: 'story.delete-confirm.confirm' }),
      okType: 'danger',
      cancelText: formatMessage({ id: 'story.delete-confirm.cancel' }),
      onOk() {
        if (isCache) {
          deleteChapterCache(id);
        } else {
          setChapters((state: API.StoryChapter[]) =>
            state.map((e) => {
              return {
                ...e,
                delete: e.id === id ? true : e.delete,
              };
            }),
          );
        }
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
      <Spin
        spinning={loading}
        tip={formatMessage({ id: 'story.waiting-for-sync' })}
      >
        {chapters.length === 0 && chapterCaches?.length === 0 ? (
          <div className={styles.noChapterTip}>
            {formatMessage({ id: 'story.no-chapter-tip' })}
          </div>
        ) : (
          <>
            {chapters.map((chapter: API.StoryChapter) => {
              const cache =
                isAuthor &&
                chapterCaches?.find(
                  (c: API.ChapterStorage) => c.id === chapter.id,
                );
              return (
                <ChapterItem
                  type={!!cache ? 'modified' : 'default'}
                  key={chapter.id}
                  isAuthor={isAuthor}
                  chapter={cache || chapter}
                  storyId={storyId}
                  chainType={chainType}
                  deleted={chapter.delete}
                  onDelete={() => handleDelete(chapter.id, chapter.name)}
                  onUndoDelete={() => handleUndoDelete(chapter.id)}
                />
              );
            })}
            {isAuthor &&
              chapterCaches
                ?.filter(
                  (chapter: API.ChapterStorage) =>
                    !chapters.find(
                      (c: API.StoryChapter) => c.id === chapter.id,
                    ),
                )
                .map((chapter: API.ChapterStorage) => (
                  <ChapterItem
                    type={'new'}
                    key={chapter.id}
                    isAuthor={isAuthor}
                    chapter={chapter}
                    storyId={storyId}
                    chainType={chainType}
                    deleted={false}
                    onDelete={() =>
                      handleDelete(chapter.id, chapter.name, true)
                    }
                  />
                ))}
          </>
        )}
      </Spin>
    </div>
  );
}
