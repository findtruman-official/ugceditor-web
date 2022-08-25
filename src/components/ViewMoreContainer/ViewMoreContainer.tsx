import { useIntl } from '@@/exports';
import { Button } from 'antd';
import { useEffect, useRef, useState } from 'react';
import styles from './ViewMoreContainer.less';

interface ViewMoreContainerProps {
  children: any;
  maxHeight?: number;
  showViewMoreBtn?: boolean;
  onViewMore?: () => void;
}

export default function ViewMoreContainer({
  children,
  maxHeight = 300,
  showViewMoreBtn = true,
  onViewMore = () => {},
}: ViewMoreContainerProps) {
  const { formatMessage } = useIntl();
  const [shouldCollapse, setShouldCollapse] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const height = (ref.current as any)?.clientHeight;
    setShouldCollapse(height > maxHeight);
  }, [ref]);
  return (
    <div>
      <div
        ref={ref}
        className={[
          styles.container,
          shouldCollapse ? styles.viewMoreContainer : '',
        ].join(' ')}
        style={{ maxHeight: shouldCollapse ? maxHeight : 'unset' }}
      >
        {children}
      </div>
      {showViewMoreBtn && shouldCollapse && (
        <div style={{ textAlign: 'center' }}>
          <Button type="text" onClick={onViewMore}>
            {formatMessage({ id: 'view-more' })}
          </Button>
        </div>
      )}
    </div>
  );
}
