import React from 'react';

const ColorfulBorder: React.FC<{
  onClick?: React.DOMAttributes<HTMLDivElement>['onClick'];
  style?: React.CSSProperties;
  contentStyle?: React.CSSProperties;
  borderRadius?: React.CSSProperties['borderRadius'];
  borderWidth?: React.CSSProperties['padding'];
  noHoverable?: boolean;
  children?: any;
}> = ({
  style,
  contentStyle: innerStyle,
  borderWidth = 2,
  children,
  borderRadius = '4px',
  noHoverable = false,
  onClick,
}) => {
  let [isHover, setIsHover] = React.useState(false);
  isHover = noHoverable ? false : isHover;
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => {
        setIsHover(true);
      }}
      onMouseLeave={() => {
        setIsHover(false);
      }}
      style={{
        padding: borderWidth,
        backgroundImage: 'linear-gradient(135deg, #5b4fff, #fb3120, #e2bdb9)',
        boxSizing: 'border-box',
        borderRadius: borderRadius,
        width: 'fit-content',
        ...style,
      }}
    >
      <div
        style={{
          backgroundColor: noHoverable
            ? 'rgb(29, 29, 29, 255)'
            : isHover
            ? 'rgba(29, 29, 29, 0)'
            : 'rgba(29, 29, 29, 255)',
          transition: 'all 0.3s',
          borderRadius,
          ...innerStyle,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default ColorfulBorder;
