import ViewMoreContainer from '@/components/ViewMoreContainer/ViewMoreContainer';
import { shortenAccount } from '@/utils/format';
import { useIntl } from '@@/exports';
import {
  ClockCircleOutlined,
  CloseOutlined,
  UserOutlined,
} from '@ant-design/icons';
import MDEditor from '@uiw/react-md-editor';
import { Col, Modal, Radio, Row } from 'antd';
import styles from './TaskSubmitCard.less';

export interface TaskSubmitCardProps {
  selected?: boolean;
  data: API.StoryTaskSubmit;
  removable?: boolean;
  onViewMore?: () => void;
  onDelete?: () => Promise<void>;
  active?: boolean;
  onClick?: () => void;
  onSelect?: () => void;
  minHeight?: number | string;
  maxHeight?: number | string;
}

export default function TaskSubmitCard({
  selected = false,
  data,
  removable = false,
  onViewMore,
  onDelete,
  active = false,
  onClick,
  onSelect,
  minHeight = 'unset',
  maxHeight = 150,
}: TaskSubmitCardProps) {
  const { formatMessage } = useIntl();

  // const renderStatusTag = useCallback((status: API.StoryTaskSubmitStatus) => {
  //   switch (status) {
  //     case 'Pending':
  //       return undefined;
  //     case 'Approved':
  //       return (
  //         <Tag color={'green'} style={{ marginRight: 12 }}>
  //           {formatMessage({ id: 'task-modal.approved' })}
  //         </Tag>
  //       );
  //     case 'Rejected':
  //       return (
  //         <Tag color={'red'} style={{ marginRight: 12 }}>
  //           {formatMessage({ id: 'task-modal.rejected' })}
  //         </Tag>
  //       );
  //   }
  // }, []);

  return (
    <div
      className={[
        styles.card,
        onClick && styles.cardClickable,
        active && styles.cardActive,
      ].join(' ')}
      onClick={onClick}
    >
      <Row justify={'space-between'} style={{ marginBottom: 12 }}>
        <Col>
          <span className={styles.account}>
            <UserOutlined style={{ marginRight: 8 }} />
            {shortenAccount(data.account)}
          </span>
          <span className={styles.createAt}>
            <ClockCircleOutlined style={{ marginRight: 8 }} />
            {new Date(data.createTime).toLocaleString()}
          </span>
        </Col>
        <Col>
          {onSelect && (
            <Radio
              checked={selected}
              onChange={(e) => {
                e.target.checked && onSelect();
              }}
            />
          )}
          {removable && (
            <CloseOutlined
              className={styles.removeBtn}
              onClick={() => {
                Modal.confirm({
                  centered: true,
                  title: formatMessage({ id: 'task-modal.delete-confirm' }),
                  onOk: onDelete,
                });
              }}
            />
          )}
        </Col>
      </Row>
      <ViewMoreContainer
        onViewMore={onViewMore}
        minHeight={minHeight}
        maxHeight={maxHeight}
        showViewMoreBtn={!!onViewMore}
      >
        <div data-color-mode="dark">
          <MDEditor.Markdown source={data.content} linkTarget={'_blank'} />
        </div>
      </ViewMoreContainer>
    </div>
  );
}
