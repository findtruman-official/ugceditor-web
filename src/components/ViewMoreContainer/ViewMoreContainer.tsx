import { useIntl } from '@@/exports';
import { Button } from 'antd';
import styles from './ViewMoreContainer.less';

interface ViewMoreContainerProps {
  children: any;
  minHeight?: number | string;
  maxHeight?: number | string;
  showViewMoreBtn?: boolean;
  onViewMore?: () => void;
}

export default function ViewMoreContainer({
  children,
  minHeight = 'unset',
  maxHeight = 300,
  showViewMoreBtn = true,
  onViewMore = () => {},
}: ViewMoreContainerProps) {
  const { formatMessage } = useIntl();
  // const [shouldCollapse, setShouldCollapse] = useState(true);
  // const ref = useRef(null);
  //
  // useEffect(() => {
  //   if (!ref.current) return;
  //   (ref.current as any).onload = () => {
  //     const height = (ref.current as any)?.clientHeight;
  //   };
  //   const height = (ref.current as any)?.clientHeight;
  //   setShouldCollapse(height > maxHeight);
  // }, [ref]);

  return (
    <div style={{ position: 'relative' }}>
      <div
        // ref={ref}
        className={[styles.container, styles.viewMoreContainer].join(' ')}
        style={{ maxHeight: maxHeight, minHeight: minHeight }}
      >
        {children}
      </div>
      <div className={styles.prevent} style={{ height: '100%' }} />
      {showViewMoreBtn && (
        <div style={{ textAlign: 'center' }}>
          <Button type="text" onClick={onViewMore}>
            {formatMessage({ id: 'view-more' })}
          </Button>
        </div>
      )}
    </div>
  );
}
