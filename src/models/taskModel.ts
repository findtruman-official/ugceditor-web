import {
  cancelStoryTask,
  createStoryTask,
  createTaskSubmit,
  doneStoryTask,
  getStoryTask,
  getStoryTasks,
  removeTaskSubmit,
  updateStoryTask,
} from '@/services/api';
import { useModel } from '@@/exports';
import { useRequest } from 'ahooks';
import { useMemo, useState } from 'react';

// @ts-ignore
export default () => {
  const { chainType, storyId } = useModel('storyModel', (model) => ({
    chainType: model.chainType,
    storyId: model.storyId,
  }));

  const [taskId, setTaskId] = useState(0);

  const {
    data: storyTasks,
    loading: loadingStoryTasks,
    refresh: refreshStoryTasks,
  } = useRequest(
    async () => {
      if (!storyId || !chainType) return;
      return (await getStoryTasks(chainType, storyId)).storyTasks;
    },
    {
      refreshDeps: [chainType, storyId],
    },
  );

  const todoTasks = useMemo(() => {
    return storyTasks
      ? storyTasks.filter((t: API.StoryTask) => t.status === 'Todo')
      : [];
  }, [storyTasks]);
  const doneTasks = useMemo(() => {
    return storyTasks
      ? storyTasks.filter((t: API.StoryTask) => t.status === 'Done')
      : [];
  }, [storyTasks]);
  const cancelledTasks = useMemo(() => {
    return storyTasks
      ? storyTasks.filter((t: API.StoryTask) => t.status === 'Cancelled')
      : [];
  }, [storyTasks]);

  const {
    data: storyTask,
    loading: loadingStoryTask,
    refresh: refreshStoryTask,
    refreshAsync: refreshAsyncStoryTask,
  } = useRequest(
    async () => {
      if (!taskId) return;
      return (await getStoryTask(taskId)).storyTask;
    },
    {
      refreshDeps: [taskId],
    },
  );

  const { run: runCreateStoryTask, loading: loadingCreateStoryTask } =
    useRequest(
      async (title: string, description: string, token: string) => {
        await createStoryTask(chainType, storyId, title, description, token);
        refreshStoryTasks();
      },
      {
        manual: true,
      },
    );

  const { run: runCancelStoryTask, loading: loadingCancelStoryTask } =
    useRequest(
      async (token: string) => {
        await cancelStoryTask(taskId, token);
        refreshStoryTasks();
      },
      {
        manual: true,
      },
    );

  const { run: runDoneStoryTask, loading: loadingDoneStoryTask } = useRequest(
    async (submitIds: number[], token: string) => {
      await doneStoryTask(taskId, submitIds, token);
      refreshStoryTasks();
      await refreshAsyncStoryTask();
    },
    {
      manual: true,
    },
  );

  const { run: runUpdateStoryTask, loading: loadingUpdateStoryTask } =
    useRequest(
      async (title: string, description: string, token: string) => {
        await updateStoryTask(taskId, title, description, token);
        refreshStoryTasks();
        await refreshAsyncStoryTask();
      },
      {
        manual: true,
      },
    );

  const { run: runCreateTaskSubmit, loading: loadingCreateTaskSubmit } =
    useRequest(
      async (content: string, token: string) => {
        await createTaskSubmit(taskId, content, token);
        refreshStoryTasks();
        await refreshAsyncStoryTask();
      },
      {
        manual: true,
      },
    );

  const { run: runRemoveTaskSubmit, loading: loadingRemoveTaskSubmit } =
    useRequest(
      async (id: number, token: string) => {
        await removeTaskSubmit(id, token);
        refreshStoryTasks();
        await refreshAsyncStoryTask();
      },
      {
        manual: true,
      },
    );

  return {
    taskId,
    setTaskId,
    storyTasks,
    loadingStoryTasks,
    todoTasks,
    doneTasks,
    cancelledTasks,
    refreshStoryTasks,
    storyTask,
    loadingStoryTask,
    refreshStoryTask,
    runCreateStoryTask,
    loadingCreateStoryTask,
    runCancelStoryTask,
    loadingCancelStoryTask,
    runDoneStoryTask,
    loadingDoneStoryTask,
    runUpdateStoryTask,
    loadingUpdateStoryTask,
    runCreateTaskSubmit,
    loadingCreateTaskSubmit,
    runRemoveTaskSubmit,
    loadingRemoveTaskSubmit,
  };
};
