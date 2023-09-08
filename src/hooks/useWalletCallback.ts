import { ChainType } from '@/wallets';
import { useIntl } from '@@/plugin-locale';
import { useAsyncEffect } from 'ahooks';
import { message, Modal } from 'antd';
import { Base64 } from 'js-base64';
import * as nearAPI from 'near-api-js';
import { useState } from 'react';
import { useModel } from 'umi';

export function getWalletCallbackSearchParam(
  type: WalletCallback.CallbackType,
  payload: WalletCallback.CallbackPayload,
  chainType: ChainType,
) {
  return `walletCallback=${Base64.encode(
    JSON.stringify({
      type,
      payload,
      chainType,
    }),
  )}`;
}

function clearSearch() {
  history.replaceState(
    null,
    '',
    `${window.location.origin}${window.location.pathname}${
      window.location.hash.split('?')[0]
    }`,
  );
}

const useWalletCallback = ({
  search,
  handle = true,
}: {
  search: string;
  handle?: boolean;
}) => {
  const { accounts } = useModel('walletModel', (state) => ({
    accounts: state.accounts,
  }));
  const {
    addCreateStoryPolling,
    addNftSalePolling,
    addUpdateStoryPolling,
    clearChapterCaches,
  } = useModel('storyModel', (state) => ({
    addCreateStoryPolling: state.addCreateStoryPolling,
    addNftSalePolling: state.addNftSalePolling,
    addUpdateStoryPolling: state.addUpdateStoryPolling,
    clearChapterCaches: state.clearChapterCaches,
  }));
  const {
    addCreateTaskPolling,
    addCancelTaskPolling,
    addDoneTaskPolling,
    addUpdateTaskPolling,
    addCreateSubmitPolling,
    addRemoveSubmitPolling,
  } = useModel('taskModel', (model) => ({
    addCreateTaskPolling: model.addCreateTaskPolling,
    addCancelTaskPolling: model.addCancelTaskPolling,
    addDoneTaskPolling: model.addDoneTaskPolling,
    addUpdateTaskPolling: model.addUpdateTaskPolling,
    addCreateSubmitPolling: model.addCreateSubmitPolling,
    addRemoveSubmitPolling: model.addRemoveSubmitPolling,
  }));
  const { formatMessage } = useIntl();

  const [type, setType] = useState<WalletCallback.CallbackType | undefined>();
  const [payload, setPayload] = useState<
    WalletCallback.CallbackPayload | undefined
  >();

  useAsyncEffect(async () => {
    return;
    setType(undefined);
    setPayload(undefined);

    if (!search && !window.location.search) return;
    const walletSearchParams = new URLSearchParams(window.location.search);
    const searchParams = new URLSearchParams(search);
    const callbackBase64 = searchParams.get('walletCallback');
    const errorCode = walletSearchParams.get('errorCode');
    const errorMessage = walletSearchParams.get('errorMessage');
    const transactionHashes = walletSearchParams.get('transactionHashes');
    transactionHashes &&
      localStorage.setItem('transactionHash', transactionHashes);

    console.log({ errorCode, errorMessage });
    if (handle && (errorCode || errorMessage)) {
      clearSearch();
      message.error(formatMessage({ id: 'transaction-failed' }));
      return;
    }
    const transactionHash = localStorage.getItem('transactionHash');
    if (!(errorCode || errorMessage) && transactionHash && handle) {
      const modal = Modal.info({
        title: '',
        content: formatMessage({ id: 'modal.check-status' }),
      });
      const connectionConfig = {
        networkId: 'testnet',
        keyStore: new nearAPI.keyStores.BrowserLocalStorageKeyStore(), // first create a key store
        nodeUrl: 'https://rpc.testnet.near.org',
        walletUrl: 'https://wallet.testnet.near.org',
        helperUrl: 'https://helper.testnet.near.org',
        explorerUrl: 'https://explorer.testnet.near.org',
      };
      try {
        const near = await nearAPI.connect(connectionConfig);
        const response = await near.connection.provider.txStatus(
          transactionHash,
          accounts[ChainType.Near],
        );
        const successValue = response?.status?.SuccessValue;
        const decodedData = successValue.length
          ? JSON.parse(Base64.decode(successValue))
          : null;
        modal.destroy();
        if (typeof decodedData == 'string') {
          clearSearch();
          message.error(decodedData);
          localStorage.setItem('transactionHash', null);
          return;
        } else {
          localStorage.setItem('transactionHash', null);
        }
      } catch (e) {
        modal.destroy();
      }
    }

    if (!callbackBase64) {
      clearSearch();
      return;
    }

    try {
      const callbackObj: WalletCallback.CallbackObject = JSON.parse(
        Base64.decode(callbackBase64),
      );
      if (!callbackObj.type || !callbackObj.payload || !callbackObj.chainType) {
        clearSearch();
        return;
      }

      let { type, payload, chainType } = callbackObj;

      // Wait for wallet connected
      if (!accounts[chainType]) {
        return;
      }

      setType(type);
      setPayload(payload);

      if (!handle) return;

      switch (type) {
        case 'publish-story': {
          addCreateStoryPolling({
            ...payload,
            nftPublished: false,
            loading: true,
          });
          message.success(
            formatMessage({
              id: 'story.story-published',
            }),
          );
          break;
        }
        case 'update-story': {
          addUpdateStoryPolling(payload);
          message.success(
            formatMessage({
              id: 'story.story-updated',
            }),
          );
          if (
            (payload as WalletCallback.UpdateStoryPayload).clearChapterCache
          ) {
            clearChapterCaches(payload.id);
          }
          break;
        }
        case 'nft-sale': {
          addNftSalePolling(payload);
          message.success(formatMessage({ id: 'publish-nft-modal.published' }));
          break;
        }
        case 'create-task': {
          addCreateTaskPolling(payload);
          message.success(formatMessage({ id: 'create-task.create' }));
          break;
        }
        case 'cancel-task': {
          addCancelTaskPolling(payload);
          message.success(formatMessage({ id: 'task-modal.closed' }));
          break;
        }
        case 'done-task': {
          addDoneTaskPolling(payload);
          message.success(formatMessage({ id: 'task-review.done' }));
          break;
        }
        case 'update-task': {
          addUpdateTaskPolling(payload);
          message.success(formatMessage({ id: 'task-modal.updated' }));
          break;
        }
        case 'task-create-submit': {
          addCreateSubmitPolling(payload);
          message.success(formatMessage({ id: 'task-modal.submitted' }));
          break;
        }
        case 'task-remove-submit': {
          addRemoveSubmitPolling(payload);
          message.success(formatMessage({ id: 'task-modal.removed' }));
          break;
        }
      }
      clearSearch();
    } catch (e) {}
  }, [search, accounts]);
  return {
    walletCallbackType: type,
    walletCallbackPayload: payload,
  };
};

export default useWalletCallback;
