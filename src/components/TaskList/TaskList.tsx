import { useIntl } from '@@/plugin-locale';
import { TeamOutlined } from '@ant-design/icons/lib';
import React from 'react';
import styles from './TaskList.less';

interface props {
  taskList: API.StoryChainTask[];
  clickTask: (taskId: number | string) => void;
}

const TaskList: React.FC<props> = ({ taskList, clickTask }) => {
  const { formatMessage } = useIntl();

  return (
    <div className={styles.taskListBox}>
      {taskList.length > 0 ? (
        taskList.map((task) => {
          return (
            <div
              key={task.id || task.chainTaskId}
              className={styles.taskItem}
              onClick={() => clickTask(task.id || task.chainTaskId)}
            >
              <div className={styles.taskTitle}>{task.title}</div>
              <div className={styles.submitsTag}>
                <TeamOutlined style={{ marginRight: 6 }} />
                {task.submits?.length || 0}
              </div>
            </div>
          );
        })
      ) : (
        <div className={styles.noTaskTip}>
          {formatMessage({ id: 'task.nodata' })}
        </div>
      )}
    </div>
  );
};

export default TaskList;
