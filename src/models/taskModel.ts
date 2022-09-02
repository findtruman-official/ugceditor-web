import {
  cancelStoryTask,
  createStoryTask,
  createTaskSubmit,
  doneStoryTask,
  getChainTask,
  getChainTasks,
  getStoryTask,
  getStoryTasks,
  removeTaskSubmit,
  updateStoryTask,
  uploadJson,
} from '@/services/api';
import { useModel } from '@@/exports';
import { useRequest } from 'ahooks';
import { useMemo, useState } from 'react';

// @ts-ignore
export default () => {
  const { chains, connectedWallets } = useModel('walletModel', (model) => ({
    chains: model.chains,
    connectedWallets: model.connectedWallets,
  }));
  const { chainType, storyId } = useModel('storyModel', (model) => ({
    chainType: model.chainType,
    storyId: model.storyId,
  }));

  const [taskId, setTaskId] = useState<number | string>(0);

  const taskModule = useMemo<'Basic' | 'Chain'>(() => {
    if (!chainType || !chains || !chains.length) return 'Basic';
    return (
      chains.find((e: API.Chain) => e.type === chainType)?.taskModule || 'Basic'
    );
  }, [chains, chainType]);

  const {
    data: storyTasks,
    loading: loadingStoryTasks,
    refresh: refreshStoryTasks,
  } = useRequest(
    async () => {
      if (!storyId || !chainType) return;
      if (taskModule === 'Basic') {
        return (await getStoryTasks(chainType, storyId)).storyTasks;
      } else {
        return (await getChainTasks(chainType, storyId)).chainTasks.map(
          (e) => ({
            ...e,
            id: e.chainTaskId,
          }),
        );
      }
    },
    {
      refreshDeps: [chainType, storyId, taskModule],
    },
  );

  const todoTasks = useMemo(() => {
    return storyTasks ? storyTasks.filter((t: any) => t.status === 'Todo') : [];
  }, [storyTasks]);
  const doneTasks = useMemo(() => {
    return storyTasks ? storyTasks.filter((t: any) => t.status === 'Done') : [];
  }, [storyTasks]);
  const cancelledTasks = useMemo(() => {
    return storyTasks
      ? storyTasks.filter((t: any) => t.status === 'Cancelled')
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

      if (taskModule === 'Basic') {
        return (await getStoryTask(taskId as number)).storyTask;
      } else {
        const res = (await getChainTask(chainType, storyId, taskId as string))
          .chainTask;
        return {
          ...res,
          submits: res.submits.map((e: API.StoryChainTaskSubmit) => ({
            ...e,
            id: e.chainSubmitId,
          })),
        };
      }
    },
    {
      refreshDeps: [taskId, taskModule, chainType, storyId],
    },
  );

  const { runAsync: runCreateStoryTask, loading: loadingCreateStoryTask } =
    useRequest(
      async (
        data: {
          title: string;
          description: string;
          rewards?: number[];
        },
        token: string,
      ) => {
        const { title, description, rewards = [] } = data;
        if (taskModule === 'Basic') {
          await createStoryTask(chainType, storyId, title, description, token);
        } else {
          if (!connectedWallets[chainType]) {
            return;
          }
          const { cid } = await uploadJson(
            {
              title,
              description,
            },
            token,
          );
          const provider = connectedWallets[chainType].provider;
          const nftAddress = await provider.getNftAddress(storyId);
          await provider.createTask(storyId, cid, nftAddress, rewards);
        }
        refreshStoryTasks();
      },
      {
        manual: true,
      },
    );

  const { runAsync: runCancelStoryTask, loading: loadingCancelStoryTask } =
    useRequest(
      async (token: string) => {
        if (taskModule === 'Basic') {
          await cancelStoryTask(taskId as number, token);
        } else {
          if (!connectedWallets[chainType]) {
            return;
          }
          await connectedWallets[chainType].provider.cancelTask(
            storyId,
            taskId as string,
          );
        }

        refreshStoryTasks();
      },
      {
        manual: true,
      },
    );

  const { runAsync: runDoneStoryTask, loading: loadingDoneStoryTask } =
    useRequest(
      async (submitId: number, token: string) => {
        if (taskModule === 'Basic') {
          await doneStoryTask(taskId as number, [submitId], token);
        } else {
          if (!connectedWallets[chainType]) {
            return;
          }
          await connectedWallets[chainType].provider.markTaskDone(
            storyId,
            taskId,
            submitId,
          );
        }

        refreshStoryTasks();
        await refreshAsyncStoryTask();
      },
      {
        manual: true,
      },
    );

  const { runAsync: runUpdateStoryTask, loading: loadingUpdateStoryTask } =
    useRequest(
      async (title: string, description: string, token: string) => {
        if (taskModule === 'Basic') {
          await updateStoryTask(taskId as number, title, description, token);
        } else {
          if (!connectedWallets[chainType]) {
            return;
          }
          const { cid } = await uploadJson(
            {
              title,
              description,
            },
            token,
          );
          await connectedWallets[chainType].provider.updateTask(
            storyId,
            taskId,
            cid,
          );
        }
        refreshStoryTasks();
        await refreshAsyncStoryTask();
      },
      {
        manual: true,
      },
    );

  const { runAsync: runCreateTaskSubmit, loading: loadingCreateTaskSubmit } =
    useRequest(
      async (content: string, token: string) => {
        if (taskModule === 'Basic') {
          await createTaskSubmit(taskId as number, content, token);
        } else {
          if (!connectedWallets[chainType]) {
            return;
          }
          const { cid } = await uploadJson(
            {
              content,
            },
            token,
          );
          await connectedWallets[chainType].provider.createTaskSubmit(
            storyId,
            taskId,
            cid,
          );
        }

        refreshStoryTasks();
        await refreshAsyncStoryTask();
      },
      {
        manual: true,
      },
    );

  const { runAsync: runRemoveTaskSubmit, loading: loadingRemoveTaskSubmit } =
    useRequest(
      async (id: number, token: string) => {
        if (taskModule === 'Basic') {
          await removeTaskSubmit(id, token);
        } else {
          if (!connectedWallets[chainType]) {
            return;
          }
          await connectedWallets[chainType].provider.withdrawTaskSubmit(
            storyId,
            taskId,
            id,
          );
        }

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
    taskModule,
  };
};
