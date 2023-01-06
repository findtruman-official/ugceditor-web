import { ChainType } from '@/wallets';
import { useIntl } from '@@/plugin-locale';
import { message } from 'antd';
import { Base64 } from 'js-base64';
import { useEffect } from 'react';
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

const useWalletCallback = ({ search }: { search: string }) => {
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
  const { formatMessage } = useIntl();

  useEffect(() => {
    if (!search && !window.location.search) return;
    const walletSearchParams = new URLSearchParams(window.location.search);
    const searchParams = new URLSearchParams(search);
    const callbackBase64 = searchParams.get('walletCallback');
    const errorCode = walletSearchParams.get('errorCode');
    const errorMessage = walletSearchParams.get('errorMessage');
    console.log({ errorCode, errorMessage });
    if (errorCode || errorMessage) {
      clearSearch();
      message.error(formatMessage({ id: 'transaction-failed' }));
      return;
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
      }
      clearSearch();
    } catch (e) {}
  }, [search, accounts]);
  return {};
};

export default useWalletCallback;
