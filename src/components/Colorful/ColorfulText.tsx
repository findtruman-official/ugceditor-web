import React from 'react';
import styles from './ColorfulText.less';

interface Props {
  className?: string;
  style?: React.CSSProperties;
  gradientDegree?: number;
  children: React.ReactNode;
  onClick?: () => void;
}

const ColorfulText: React.FC<Props> = ({
  className = '',
  style,
  gradientDegree = 45,
  children,
  onClick,
}) => {
  return (
    <div
      className={[styles.colorfulText, className].join(' ')}
      style={{
        backgroundImage: `linear-gradient(${gradientDegree}deg, #5b4fff 0%, #fb3120 50%, #e2bdb9 100%)`,
        ...(style || {}),
      }}
      onClick={() => {
        onClick && onClick();
      }}
    >
      {children}
    </div>
  );
};

export default ColorfulText;
