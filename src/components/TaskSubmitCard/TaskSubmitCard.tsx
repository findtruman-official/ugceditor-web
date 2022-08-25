import ViewMoreContainer from '@/components/ViewMoreContainer/ViewMoreContainer';
import { shortenAccount } from '@/utils/format';
import { useIntl } from '@@/exports';
import {
  ClockCircleOutlined,
  CloseOutlined,
  UserOutlined,
} from '@ant-design/icons';
import MDEditor from '@uiw/react-md-editor';
import { Col, Modal, Row } from 'antd';
import styles from './TaskSubmitCard.less';

interface TaskSubmitCardProps {
  data: API.StoryTaskSubmit;
  isOwner: boolean;
  onViewMore: () => void;
  onDelete: () => Promise<void>;
}

export default function TaskSubmitCard({
  data,
  isOwner,
  onViewMore,
  onDelete,
}: TaskSubmitCardProps) {
  const { formatMessage } = useIntl();
  return (
    <div className={styles.card}>
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
          {isOwner && (
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
      <ViewMoreContainer onViewMore={onViewMore} maxHeight={150}>
        <MDEditor.Markdown source={data.content} linkTarget={'_blank'} />
      </ViewMoreContainer>
    </div>
  );
}
