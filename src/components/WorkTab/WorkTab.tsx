import CreateTaskModal from '@/components/CreateTaskModal/CreateTaskModal';
import ReviewModal from '@/components/ReviewModal/ReviewModal';
import TaskList from '@/components/TaskList/TaskList';
import TaskModal from '@/components/TaskModal/TaskModal';
import { WalletContext, WalletContextType } from '@/layouts';
import { useModel } from '@@/exports';
import { useIntl } from '@@/plugin-locale';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { Badge, Button, Card, Col, Row, Spin } from 'antd';
import { MacScrollbar } from 'mac-scrollbar';
import 'mac-scrollbar/dist/mac-scrollbar.css';
import { useContext, useEffect, useState } from 'react';
import styles from './WorkTab.less';

interface WorkTabProps {}

export default function WorkTab({}: WorkTabProps) {
  const { confirmLogin, openWalletModal } =
    useContext<WalletContextType>(WalletContext);
  const { formatMessage } = useIntl();

  const { chainType, isAuthor } = useModel('storyModel', (model) => ({
    chainType: model.chainType,
    isAuthor: model.isAuthor,
  }));

  const { getToken, accounts } = useModel('walletModel', (model) => ({
    getToken: model.getToken,
    accounts: model.accounts,
  }));

  const {
    loadingStoryTasks,
    todoTasks,
    doneTasks,
    cancelledTasks,
    setTaskId,
    createTaskPolling,
    cancelTaskPolling,
    doneTaskPolling,
  } = useModel('taskModel', (model) => ({
    loadingStoryTasks: model.loadingStoryTasks,
    todoTasks: model.todoTasks,
    doneTasks: model.doneTasks,
    cancelledTasks: model.cancelledTasks,
    setTaskId: model.setTaskId,
    createTaskPolling: model.createTaskPolling,
    cancelTaskPolling: model.cancelTaskPolling,
    doneTaskPolling: model.doneTaskPolling,
  }));

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);

  useEffect(() => {
    setCreateModalVisible(false);
    setTaskModalVisible(false);
    setReviewModalVisible(false);
  }, [accounts[chainType]]);

  const showTaskDetail = (taskId: number | string) => {
    if (!accounts[chainType]) {
      openWalletModal();
      return;
    }
    const token = getToken(chainType);
    if (!token) {
      confirmLogin(chainType, {
        onConfirm: () => {
          setTaskModalVisible(true);
          setTaskId(taskId);
        },
      });
    } else {
      setTaskModalVisible(true);
      setTaskId(taskId);
    }
  };

  return (
    <div>
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col>
          <Card
            className={styles.taskCard}
            title={
              <div className={styles.title}>
                <ClockCircleOutlined style={{ color: 'gold' }} />
                <span>{formatMessage({ id: 'task-status-type.todo' })}</span>
                <Badge
                  count={todoTasks?.length || 0}
                  style={{ background: '#2a2c37' }}
                />
              </div>
            }
          >
            <Spin
              spinning={
                loadingStoryTasks ||
                createTaskPolling ||
                cancelTaskPolling ||
                doneTaskPolling
              }
            >
              <MacScrollbar
                style={{ padding: 12, overflowY: 'auto', height: 500 }}
              >
                {isAuthor && (
                  <Button
                    className={styles.addBtn}
                    type="dashed"
                    block={true}
                    onClick={() => {
                      const token = getToken(chainType);
                      if (!token) {
                        confirmLogin(chainType, {
                          onConfirm: () => setCreateModalVisible(true),
                        });
                      } else {
                        setCreateModalVisible(true);
                      }
                    }}
                  >
                    <PlusOutlined />
                    {formatMessage({ id: 'task.add-todo' })}
                  </Button>
                )}
                <TaskList
                  taskList={todoTasks || []}
                  clickTask={(taskId) => showTaskDetail(taskId)}
                />
              </MacScrollbar>
            </Spin>
          </Card>
        </Col>
        <Col>
          <Card
            className={styles.taskCard}
            title={
              <div className={styles.title}>
                <CheckCircleOutlined style={{ color: 'rgb(91, 79, 255)' }} />
                <span>{formatMessage({ id: 'task-status-type.done' })}</span>
                <Badge
                  count={doneTasks?.length || 0}
                  style={{ background: '#2a2c37' }}
                />
              </div>
            }
          >
            <Spin spinning={loadingStoryTasks || doneTaskPolling}>
              <MacScrollbar
                style={{ padding: 12, overflowY: 'auto', height: 500 }}
              >
                <TaskList
                  taskList={doneTasks || []}
                  clickTask={(taskId) => showTaskDetail(taskId)}
                />
              </MacScrollbar>
            </Spin>
          </Card>
        </Col>
        <Col>
          <Card
            className={styles.taskCard}
            title={
              <div className={styles.title}>
                <StopOutlined style={{ color: 'rgb(251, 49, 32)' }} />
                <span>
                  {formatMessage({ id: 'task-status-type.cancelled' })}
                </span>
                <Badge
                  count={cancelledTasks?.length || 0}
                  style={{ background: '#2a2c37' }}
                />
              </div>
            }
          >
            <Spin spinning={loadingStoryTasks || cancelTaskPolling}>
              <MacScrollbar
                style={{ padding: 12, overflowY: 'auto', height: 500 }}
              >
                <TaskList
                  taskList={cancelledTasks || []}
                  clickTask={(taskId) => showTaskDetail(taskId)}
                />
              </MacScrollbar>
            </Spin>
          </Card>
        </Col>
      </Row>
      <CreateTaskModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
      />
      <TaskModal
        visible={taskModalVisible}
        onClose={() => {
          setTaskModalVisible(false);
          setTaskId(0);
        }}
        onReview={() => setReviewModalVisible(true)}
      />
      <ReviewModal
        visible={reviewModalVisible}
        onClose={() => setReviewModalVisible(false)}
      />
    </div>
  );
}
