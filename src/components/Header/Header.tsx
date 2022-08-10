import RightContent from '@/components/RightContent/RightContent';
import { useIntl } from '@@/plugin-locale';
import { useEffect } from 'react';
import { history, useLocation, useModel } from 'umi';
import styles from './Header.less';

export default function Header() {
  const { formatMessage } = useIntl();
  const location = useLocation();
  const { pathname } = location;

  const { storyName } = useModel('storyModel');

  useEffect(() => {
    window.scrollTo(0, 0);
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
          {!!storyName && (
            <div className={[styles.menuItem, styles.menuItemActive].join(' ')}>
              {storyName}
            </div>
          )}
        </div>
        <RightContent />
      </div>
    </>
  );
}
