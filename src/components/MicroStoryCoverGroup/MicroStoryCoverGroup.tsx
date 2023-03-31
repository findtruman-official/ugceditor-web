import styles from './MicroStoryCoverGroup.less';
import OutputImg from '@/components/OutputImg/OutputImg';
import React from 'react';

const MicroStoryCoverGroup = ({
  style = {},
  storyCoverOutputUrl,
  contentOutputUrls,
  open,
}: {
  style?: React.CSSProperties;
  storyCoverOutputUrl: string;
  contentOutputUrls: string[];
  open?: VoidFunction;
}) => {
  return (
    <div
      style={{ ...style }}
      className={styles.imageGroupContainer}
      onClick={() => open?.()}
    >
      <OutputImg
        imageContainerStyle={{
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        }}
        imageStyle={{
          width: '100%',
          aspectRatio: 1,
          minHeight: 12,
          borderRadius: 0,
        }}
        outputUrl={storyCoverOutputUrl}
        changeable={false}
      />
      {!!contentOutputUrls?.length &&
        contentOutputUrls.map((url, idx) => (
          <OutputImg
            key={`${idx} - ${url}`}
            imageContainerStyle={{
              width: `${100 / 3}%`,
              aspectRatio: 1,
              borderRadius: 0,
              position: 'absolute',
              top: `${(idx * 100) / 3}%`,
              right: 0,
            }}
            imageStyle={{
              width: '100%',
              aspectRatio: 1,
              minHeight: 12,
              borderRadius: 0,
            }}
            outputUrl={url}
            changeable={false}
          />
        ))}
    </div>
  );
};

export default MicroStoryCoverGroup;
