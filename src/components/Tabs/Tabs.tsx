import { useCreation } from 'ahooks';
import { Tooltip } from 'antd';
import classNames from 'classnames';
import { useEffect, useRef, useState } from 'react';
import styles from './Tabs.less';

const Tab = ({
  label,
  icon,
  tooltip,
  disabled,
  active,
  style = {},
  onChange,
  onWidth,
}: {
  label: string;
  icon?: string | React.ReactNode;
  tooltip?: string;
  disabled?: boolean;
  active: boolean;
  style?: React.CSSProperties;
  onChange: VoidFunction;
  onWidth: (width: number) => void;
}) => {
  const ref = useRef<any>();
  useEffect(() => {
    if (ref.current) {
      onWidth(ref.current.offsetWidth);
    }
  }, [ref]);
  return (
    <div>
      <Tooltip
        placement={'right'}
        overlayInnerStyle={{ width: 'fit-content', whiteSpace: 'nowrap' }}
        title={tooltip}
      >
        <div
          onClick={() => onChange()}
          ref={ref}
          className={classNames(styles.tab, {
            [styles.tabDisabled]: disabled,
            [styles.tabActive]: active,
          })}
          style={style}
        >
          {icon && typeof icon === 'string' ? (
            <img className={styles.icon} src={icon} />
          ) : (
            <span style={{ marginRight: 6 }}>{icon}</span>
          )}
          {label}
        </div>
      </Tooltip>
    </div>
  );
};

const Tabs = ({
  tabs,
  activeKey,
  onChange,
  style = {},
  tabStyle = {},
  barHeight = 4,
}: {
  tabs: {
    label: string;
    key: string;
    tooltip?: string;
    disabled?: boolean;
    icon?: string | React.ReactNode;
  }[];
  activeKey: string;
  onChange: (key: string) => void;
  style?: React.CSSProperties;
  tabStyle?: React.CSSProperties;
  barHeight?: number;
}) => {
  const [tabWidths, setTabWidths] = useState<number[]>(tabs.map(() => 40));

  const activeIndex = useCreation(
    () => tabs.findIndex((t) => t.key === activeKey),
    [activeKey, tabs],
  );

  const inkBarStyleLeft = useCreation(() => {
    const _tabWidths = tabWidths.slice(0, activeIndex);
    return (
      (_tabWidths.length > 0
        ? _tabWidths.reduce((a: number, b: number) => a + b)
        : 0) +
      24 * activeIndex
    );
  }, [activeIndex, tabWidths]);

  const inkBarStyleWidth = useCreation(() => {
    return tabWidths[activeIndex] / 2;
  }, [activeIndex, tabWidths]);

  return (
    <div className={styles.tabs} style={style}>
      {tabs.map((data, index) => (
        <div key={data.key}>
          <Tab
            {...data}
            key={data.key}
            active={activeKey === data.key}
            onChange={() => onChange(data.key)}
            style={tabStyle}
            onWidth={(width) => {
              setTabWidths((value) => {
                const clone = [...value];
                clone[index] = width;
                return clone;
              });
            }}
          />
        </div>
      ))}
      <div
        className={styles.inkBar}
        style={{
          left: inkBarStyleLeft,
          width: inkBarStyleWidth,
          height: barHeight,
          borderRadius: Math.ceil(barHeight / 2),
        }}
      />
    </div>
  );
};

export default Tabs;
