import style from './Ribbon.less';

interface RibbonContainerProps {
  children: any;
  className?: string;
}

export const RibbonContainer = ({
  children,
  className,
}: RibbonContainerProps) => {
  return (
    <div className={`${style.ribbonContainer} ${className || ''}`}>
      {children}
    </div>
  );
};

interface CornerRibbonProps {
  children: any;
  backgroundColor: string;
  color: string;
}

export const RightCornerRibbon = ({
  children,
  backgroundColor,
  color,
}: CornerRibbonProps) => {
  return (
    <div className={style.rightCornerRibbon}>
      <svg height="70" width="70">
        <polygon
          points="0 0, 0 10, 10 10"
          fill={`${backgroundColor}77`}
          strokeWidth="0"
        />
        <polygon
          points="0 0, 70 70, 70 40, 30 0"
          fill={backgroundColor}
          strokeWidth="0"
        />
        <polygon
          points="60 60, 60 70, 70 70"
          fill={`${backgroundColor}77`}
          strokeWidth="0"
        />
      </svg>
      <span style={{ color }} className={style.rightCornerRibbonText}>
        {children}
      </span>
    </div>
  );
};

export const RightCornerLargeRibbon = ({
  children,
  backgroundColor,
  color,
}: CornerRibbonProps) => {
  return (
    <div className={style.rightCornerLargeRibbon}>
      <svg height="84" width="84">
        <polygon
          points="0 0, 0 12, 12 12"
          fill={`${backgroundColor}77`}
          strokeWidth="0"
        />
        <polygon
          points="0 0, 84 84, 84 48, 36 0"
          fill={backgroundColor}
          strokeWidth="0"
        />
        <polygon
          points="72 72, 72 84, 84 84"
          fill={`${backgroundColor}77`}
          strokeWidth="0"
        />
      </svg>
      <span style={{ color }} className={style.rightCornerLargeRibbonText}>
        {children}
      </span>
    </div>
  );
};

export const LeftCornerRibbon = ({
  children,
  backgroundColor,
  color,
}: CornerRibbonProps) => {
  return (
    <div className={style.leftCornerRibbon}>
      <svg height="70" width="70">
        <g transform="rotate(-90, 35, 35)">
          <polygon
            points="0 0, 0 10, 10 10"
            fill={`${backgroundColor}77`}
            strokeWidth="0"
          />
          <polygon
            points="0 0, 70 70, 70 40, 30 0"
            fill={backgroundColor}
            strokeWidth="0"
          />
          <polygon
            points="60 60, 60 70, 70 70"
            fill={`${backgroundColor}77`}
            strokeWidth="0"
          />
        </g>
      </svg>
      <span style={{ color }} className={style.leftCornerRibbonText}>
        {children}
      </span>
    </div>
  );
};

export const LeftCornerLargeRibbon = ({
  children,
  backgroundColor,
  color,
}: CornerRibbonProps) => {
  return (
    <div className={style.leftCornerLargeRibbon}>
      <svg height="84" width="84">
        <g transform="rotate(-90, 42, 42)">
          <polygon
            points="0 0, 0 12, 12 12"
            fill={`${backgroundColor}77`}
            strokeWidth="0"
          />
          <polygon
            points="0 0, 84 84, 84 48, 36 0"
            fill={backgroundColor}
            strokeWidth="0"
          />
          <polygon
            points="72 72, 72 84, 84 84"
            fill={`${backgroundColor}77`}
            strokeWidth="0"
          />
        </g>
      </svg>
      <span style={{ color }} className={style.leftCornerLargeRibbonText}>
        {children}
      </span>
    </div>
  );
};

export const RightRibbon = ({
  children,
  backgroundColor,
  color,
}: CornerRibbonProps) => {
  return (
    <div className={style.rightRibbon}>
      <svg height="40" width="70">
        <polygon
          points="0 10, 10 20, 0 30, 70 30, 70 10"
          fill={backgroundColor}
          strokeWidth="0"
        />
        <polygon
          points="60 40, 60 30, 70 30"
          fill={`${backgroundColor}77`}
          strokeWidth="0"
        />
      </svg>
      <span style={{ color }} className={style.rightRibbonText}>
        {children}
      </span>
    </div>
  );
};

export const RightLargeRibbon = ({
  children,
  backgroundColor,
  color,
}: CornerRibbonProps) => {
  return (
    <div className={style.rightLargeRibbon}>
      <svg height="60" width="90">
        <polygon
          points="0 15, 15 30, 0 45, 90 45, 90 15"
          fill={backgroundColor}
          strokeWidth="0"
        />
        <polygon
          points="75 60, 75 40, 90 45"
          fill={`${backgroundColor}77`}
          strokeWidth="0"
        />
      </svg>
      <span style={{ color }} className={style.rightLargeRibbonText}>
        {children}
      </span>
    </div>
  );
};

export const LeftRibbon = ({
  children,
  backgroundColor,
  color,
}: CornerRibbonProps) => {
  return (
    <div className={style.leftRibbon}>
      <svg height="40" width="70">
        <g transform="scale(-1,1) translate(-70, 0)">
          <polygon
            points="0 10, 10 20, 0 30, 70 30, 70 10"
            fill={backgroundColor}
            strokeWidth="0"
          />
          <polygon
            points="60 40, 60 30, 70 30"
            fill={`${backgroundColor}77`}
            strokeWidth="0"
          />
        </g>
      </svg>
      <span style={{ color }} className={style.leftRibbonText}>
        {children}
      </span>
    </div>
  );
};

export const LeftLargeRibbon = ({
  children,
  backgroundColor,
  color,
}: CornerRibbonProps) => {
  return (
    <div className={style.leftLargeRibbon}>
      <svg height="60" width="90">
        <g transform="scale(-1,1) translate(-90, 0)">
          <polygon
            points="0 15, 15 30, 0 45, 90 45, 90 15"
            fill={backgroundColor}
            strokeWidth="0"
          />
          <polygon
            points="75 60, 75 40, 90 45"
            fill={`${backgroundColor}77`}
            strokeWidth="0"
          />
        </g>
      </svg>
      <span style={{ color }} className={style.leftLargeRibbonText}>
        {children}
      </span>
    </div>
  );
};
