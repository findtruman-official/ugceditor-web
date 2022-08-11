import { useIntl } from '@@/plugin-locale';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Modal } from 'antd';
import { history } from 'umi';
import styles from './StoryTab.less';

interface StoryTabProps {}

export default function StoryTab({}: StoryTabProps) {
  const { formatMessage } = useIntl();

  const handleDelete = (name: string) => {
    Modal.confirm({
      centered: true,
      title: formatMessage({ id: 'story.delete-confirm-title' }, { name }),
      icon: <ExclamationCircleOutlined />,
      content: formatMessage({ id: 'story.delete-confirm-desc' }),
      okText: formatMessage({ id: 'story.delete-confirm.confirm' }),
      okType: 'danger',
      cancelText: formatMessage({ id: 'story.delete-confirm.cancel' }),
      onOk() {},
      onCancel() {},
    });
  };

  return (
    <div className={styles.container}>
      <div
        className={styles.chapterCard}
        onClick={() => history.push('/story/0/chapter/0')}
      >
        <div>Chapter 1</div>
        <div>
          <a
            className={styles.actionButton}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              history.push('/story/0/chapter/0/edit');
            }}
          >
            Edit
          </a>
          <a
            className={styles.actionButton}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDelete('Chapter A');
            }}
          >
            Delete
          </a>
        </div>
      </div>
    </div>
  );
}
