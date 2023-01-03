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
  history.replaceState(null, '', window.location.href.split('?')[0]);
}

const useWalletCallback = ({ search }: { search: string }) => {
  const { accounts } = useModel('walletModel', (state) => ({
    accounts: state.accounts,
  }));
  const { addCreateStoryPolling, addNftSalePolling, addUpdateStoryPolling } =
    useModel('storyModel', (state) => ({
      addCreateStoryPolling: state.addCreateStoryPolling,
      addNftSalePolling: state.addNftSalePolling,
      addUpdateStoryPolling: state.addUpdateStoryPolling,
    }));
  const { formatMessage } = useIntl();

  useEffect(() => {
    if (!search) return;

    const searchParams = new URLSearchParams(search);
    const callbackBase64 = searchParams.get('walletCallback');
    const errorCode = searchParams.get('errorCode');
    const errorMessage = searchParams.get('errorMessage');

    if (errorCode || errorMessage) {
      clearSearch();
      message.error(formatMessage({ id: 'transaction-failed' }));
      return;
    }

    if (!callbackBase64) return;

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
          console.log('[PublishStory]', payload);
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
          console.log('[UpdateStory]', payload);
          addUpdateStoryPolling(payload);
          message.success(
            formatMessage({
              id: 'story.story-updated',
            }),
          );
          break;
        }
        case 'nft-sale': {
          console.log('[NftSale]', payload);
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
