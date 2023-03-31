import styles from './OutputImg.less';
import React, { useRef } from 'react';
import { useIntl, useModel } from '@@/exports';
import { useHover } from 'ahooks';
import { UndoOutlined } from '@ant-design/icons';

interface OutputImgProps {
  outputUrl?: string | undefined;
  changeable: boolean;
  onSelectedImg?: VoidFunction;
  onChange?: VoidFunction;
  imageContainerStyle?: React.CSSProperties;
  imageStyle?: React.CSSProperties;
}
const OutputImg = ({
  outputUrl,
  imageContainerStyle = {},
  imageStyle = {},
  changeable = false,
  onSelectedImg,
  onChange,
}: OutputImgProps) => {
  const ref = useRef<any>();
  const hovered = useHover(ref);

  return (
    <div
      style={{ ...imageContainerStyle }}
      className={styles.coverContainer}
      ref={ref}
    >
      {outputUrl && (
        <img
          style={{ ...imageStyle }}
          className={styles.cover}
          src={outputUrl}
          loading="lazy"
          onClick={() => onSelectedImg?.()}
        />
      )}
      {changeable && (
        <div
          className={styles.coverMask}
          style={{ opacity: hovered ? 0.8 : 0 }}
        >
          <UndoOutlined style={{ fontSize: 30 }} onClick={() => onChange?.()} />
        </div>
      )}
    </div>
  );
};
export default OutputImg;
