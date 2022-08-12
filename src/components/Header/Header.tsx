import RightContent from '@/components/RightContent/RightContent';
import { useIntl } from '@@/plugin-locale';
import { useEffect, useMemo } from 'react';
import { history, useLocation, useModel } from 'umi';
import styles from './Header.less';

export default function Header() {
  const { formatMessage } = useIntl();
  const location = useLocation();
  const { pathname } = location;

  const { storyId, currentStory, currentChapter } = useModel(
    'storyModel',
    (model) => ({
      storyId: model.storyId,
      currentStory: model.currentStory,
      currentChapter: model.currentChapter,
    }),
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const storyPage = useMemo(() => {
    return /^\/story\/[a-zA-Z\d]+/g.test(pathname);
  }, [pathname]);

  const chapterPage = useMemo(() => {
    return /^\/story\/[a-zA-Z\d]+\/chapter\/[a-zA-Z\d]+/g.test(pathname);
  }, [pathname]);

  console.log('storyPage', storyPage);
  console.log('chapterPage', chapterPage);

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
              ].join(' ')}
              onClick={() => {
                chapterPage && history.push(`/story/${storyId}`);
              }}
            >
              {currentStory.info.title}
            </div>
          )}
          {chapterPage && !!currentChapter && (
            <div className={[styles.menuItem, styles.menuItemActive].join(' ')}>
              {currentChapter.name}
            </div>
          )}
        </div>
        <RightContent />
      </div>
    </>
  );
}
