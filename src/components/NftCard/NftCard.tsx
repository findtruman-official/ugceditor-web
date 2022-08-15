import { useIntl } from '@@/plugin-locale';
import { LoadingOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { Button, Col, message, Modal, Row } from 'antd';
import { useMemo } from 'react';
import { useModel } from 'umi';
import styles from './NftCard.less';

interface NftCardProps {
  loading: boolean;
  onPublish: () => void;
}

export default function NftCard({ loading, onPublish }: NftCardProps) {
  const { formatMessage } = useIntl();
  const { wallet, chains, account } = useModel('walletModel', (model) => ({
    wallet: model.wallet,
    chains: model.chains,
    account: model.account,
  }));
  const { currentStory, isAuthor, refreshCurrentStory } = useModel(
    'storyModel',
    (model) => ({
      currentStory: model.currentStory,
      isAuthor: model.isAuthor,
      refreshCurrentStory: model.refreshCurrentStory,
    }),
  );

  const {
    data: balance,
    loading: gettingBalance,
    refresh: refreshBalance,
  } = useRequest(
    async () => {
      if (!chains?.[0] || !wallet || !account || !currentStory?.nft) return 0;

      return await wallet.provider.balanceOfStoryNft(
        account,
        currentStory.nft.name,
      );
    },
    { refreshDeps: [account, chains, currentStory] },
  );
  const { loading: minting, run: runMint } = useRequest(
    async () => {
      if (!chains?.[0] || !wallet) return;

      try {
        await wallet.provider.mintStoryNft(
          currentStory.chainStoryId,
          currentStory.author,
          chains[0].factoryAddress,
          chains[0].findsAddress,
          currentStory.nft.price,
          (account: string, amount: string) => {
            Modal.error({
              title: formatMessage({ id: 'story.insufficient-finds-title' }),
              content: formatMessage(
                { id: 'story.insufficient-finds-desc' },
                { account, amount },
              ),
              centered: true,
            });
          },
        );

        message.success(formatMessage({ id: 'story.claimed' }));
        refreshBalance();
        refreshCurrentStory();
      } catch (e) {
        console.log(e);
        message.error(formatMessage({ id: 'mint-failed' }));
      }
    },
    {
      manual: true,
    },
  );

  const rest = useMemo(() => {
    if (currentStory?.nft) {
      return (
        currentStory.nft.total -
        currentStory.nft.sold -
        currentStory.nft.authorReserved
      );
    } else {
      return 0;
    }
  }, [currentStory]);

  return (
    <div className={styles.container}>
      {currentStory?.nft ? (
        <div className={styles.nftCard}>
          <img
            className={styles.nftCover}
            src={`/ipfs/file/${encodeURIComponent(
              currentStory.nft.image.split('://')[1],
            )}`}
          />
          <div className={styles.nftMeta}>
            <div className={styles.nftName}>{currentStory.nft.name}</div>
            <Row gutter={[8, 8]} style={{ marginBottom: 12 }}>
              <Col span={10}>
                <div className={styles.nftMetaLabel}>
                  {formatMessage({ id: 'story.total' })}
                </div>
                <div className={styles.nftMetaValue}>
                  {currentStory.nft.total}
                </div>
              </Col>
              <Col span={14}>
                <div className={styles.nftMetaLabel}>
                  {formatMessage({ id: 'story.price' })}
                </div>
                <div className={styles.nftMetaValue}>
                  {currentStory.nft.price}
                </div>
              </Col>
              <Col span={10}>
                <div className={styles.nftMetaLabel}>
                  {formatMessage({ id: 'story.rest' })}
                </div>
                <div className={styles.nftMetaValue}>{rest}</div>
              </Col>
              <Col span={14}>
                <div className={styles.nftMetaLabel}>
                  {formatMessage({ id: 'story.own' })}
                </div>
                <div className={styles.nftMetaValue}>
                  {gettingBalance ? (
                    <LoadingOutlined style={{ marginRight: 6 }} />
                  ) : (
                    balance || 0
                  )}{' '}
                  NFT
                </div>
              </Col>
            </Row>
            <Button
              type={'primary'}
              loading={minting}
              disabled={loading}
              onClick={runMint}
              block={true}
            >
              {formatMessage({ id: 'story.claim' })}
            </Button>
          </div>
        </div>
      ) : (
        <div className={styles.publishCard}>
          <div className={styles.publishTitle}>
            {formatMessage({
              id: isAuthor
                ? 'story.publish-story-nft'
                : 'story.nft-not-published',
            })}
          </div>
          {isAuthor && (
            <Button type={'primary'} onClick={onPublish} disabled={loading}>
              {formatMessage({ id: 'story.publish' })}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
