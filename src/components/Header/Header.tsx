import ColorfulText from '@/components/Colorful/ColorfulText';
import RightContent from '@/components/RightContent/RightContent';
import { LINK_ACHIEVEMENTS, LINK_STORY_GAMEPLAY } from '@/utils/const';
import { isChapterPage, isStoryPage } from '@/utils/regExp';
import { useIntl } from '@@/plugin-locale';
import { useEffect, useMemo } from 'react';
import { history, useLocation, useModel } from 'umi';
import styles from './Header.less';

export default function Header() {
  const { formatMessage } = useIntl();
  const location = useLocation();
  const { pathname } = location;

  const { chainType, storyId, chapterId, currentStory, currentChapter } =
    useModel('storyModel', (model) => ({
      chainType: model.chainType,
      storyId: model.storyId,
      chapterId: model.chapterId,
      currentStory: model.currentStory,
      currentChapter: model.currentChapter,
    }));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const storyPage = useMemo(() => {
    return isStoryPage(pathname);
  }, [pathname]);

  const chapterPage = useMemo(() => {
    return isChapterPage(pathname);
  }, [pathname]);

  return (
    <>
      <div className={styles.header} />
      <div className={styles.fixedHeader}>
        <div className={styles.menus}>
          <div
            className={[
              styles.menuItem,
              pathname === '/stories' ? styles.menuItemActive : '',
            ].join(' ')}
            onClick={() => {
              pathname !== '/stories' && history.push('/stories');
            }}
          >
            {formatMessage({ id: 'menu.stories' })}
          </div>
          <div
            className={[
              styles.menuItem,
              pathname === '/writer' ? styles.menuItemActive : '',
            ].join(' ')}
            onClick={() => {
              pathname !== '/writer' && history.push('/writer');
            }}
          >
            {formatMessage({ id: 'menu.writer' })}
          </div>
          {storyPage && !!currentStory && (
            <div
              className={[
                styles.menuItem,
                chapterPage ? '' : styles.menuItemActive,
                styles.menuItemEllipsis,
              ].join(' ')}
              onClick={() => {
                if (chapterPage) {
                  history.push(`/story/${chainType}/${storyId}`);
                }
              }}
            >
              {currentStory.info?.title}
            </div>
          )}
          {chapterPage && (
            <div
              className={[
                styles.menuItem,
                styles.menuItemActive,
                styles.menuItemEllipsis,
              ].join(' ')}
            >
              {chapterId === 0
                ? formatMessage({ id: 'chapter.new-chapter' })
                : currentChapter?.name}
            </div>
          )}
        </div>
        <div className={styles.right}>
          <a
            style={{ marginRight: 24 }}
            href={LINK_STORY_GAMEPLAY}
            target={'_blank'}
          >
            <ColorfulText className={styles.extraLink}>
              {formatMessage({ id: 'menu.story-gameplay' })}
            </ColorfulText>
          </a>
          <a
            style={{ marginRight: 24 }}
            href={LINK_ACHIEVEMENTS}
            target={'_blank'}
          >
            <ColorfulText className={styles.extraLink}>
              {formatMessage({ id: 'menu.achievements' })}
            </ColorfulText>
          </a>
          <RightContent />
        </div>
      </div>
    </>
  );
}
