import ColorfulBorder from '@/components/Colorful/ColorfulBorder';
import { WalletContext, WalletContextType } from '@/layouts';
import { PREFIX } from '@/utils/const';
import { useIntl } from '@@/plugin-locale';
import { LoadingOutlined } from '@ant-design/icons';
import { BN } from '@project-serum/anchor';
import { useRequest } from 'ahooks';
import { Button, Col, message, Modal, Row, Spin, Tooltip } from 'antd';
import { useContext, useMemo } from 'react';
import { useModel } from 'umi';
import styles from './NftCard.less';

interface NftCardProps {
  loading: boolean;
  syncing: boolean;
  onPublish: () => void;
}

export default function NftCard({ loading, onPublish, syncing }: NftCardProps) {
  const { formatMessage } = useIntl();
  const { openWalletModal } = useContext<WalletContextType>(WalletContext);
  const { connectedWallets, chains, accounts } = useModel(
    'walletModel',
    (model) => ({
      connectedWallets: model.connectedWallets,
      chains: model.chains,
      accounts: model.accounts,
    }),
  );
  const { currentStory, isAuthor, isChainConnected, refreshCurrentStory } =
    useModel('storyModel', (model) => ({
      currentStory: model.currentStory,
      isAuthor: model.isAuthor,
      isChainConnected: model.isChainConnected,
      refreshCurrentStory: model.refreshCurrentStory,
    }));

  const chain = currentStory?.chainInfo.type;
  const account = accounts[chain];
  const wallet = connectedWallets[chain];

  const { data: mintDecimals } = useRequest(
    async () => {
      if (wallet) {
        return await wallet.provider.getMintDecimals();
      }
    },
    {
      refreshDeps: [wallet],
    },
  );

  const {
    data: balance,
    loading: gettingBalance,
    refresh: refreshBalance,
  } = useRequest(
    async () => {
      if (!wallet || !account || !currentStory?.nft) return 0;

      return await wallet.provider.balanceOfStoryNft(
        account,
        currentStory.nft.name,
        currentStory.chainStoryId,
      );
    },
    { refreshDeps: [account, currentStory] },
  );
  const { loading: minting, run: runMint } = useRequest(
    async () => {
      if (!wallet) return;

      try {
        await wallet.provider.mintStoryNft(
          currentStory.chainStoryId,
          currentStory.author,
          currentStory.nft.price,
          currentStory.nft.nftSaleAddr,
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
    <ColorfulBorder
      noHoverable={true}
      style={{
        width: 260,
      }}
    >
      {currentStory?.nft ? (
        <div className={styles.nftCard}>
          <img
            className={styles.nftCover}
            src={`${PREFIX}/ipfs/file/${encodeURIComponent(
              currentStory.nft.image.split('://')[1],
            )}`}
          />
          <div className={styles.nftMeta}>
            <Tooltip placement={'topLeft'} title={currentStory.nft.name}>
              <div className={styles.nftName}>{currentStory.nft.name}</div>
            </Tooltip>
            <Row gutter={[8, 8]} style={{ marginBottom: 12 }}>
              <Col span={12}>
                <div className={styles.nftMetaLabel}>
                  {formatMessage({ id: 'story.total' })}
                </div>
                <div className={styles.nftMetaValue}>
                  {currentStory.nft.total}
                </div>
              </Col>
              <Col span={12}>
                <div className={styles.nftMetaLabel}>
                  {formatMessage({ id: 'story.price' })}
                </div>
                <div className={styles.nftMetaValue}>
                  {mintDecimals
                    ? new BN(currentStory.nft.price)
                        .div(new BN(10).pow(new BN(mintDecimals)))
                        .toString()
                    : '-'}
                </div>
              </Col>
              <Col span={12}>
                <div className={styles.nftMetaLabel}>
                  {formatMessage({ id: 'story.rest' })}
                </div>
                <div className={styles.nftMetaValue}>{rest}</div>
              </Col>
              <Col span={12}>
                <div className={styles.nftMetaLabel}>
                  {formatMessage({ id: 'story.own' })}
                </div>
                <div className={styles.nftMetaValue}>
                  {!isChainConnected ? (
                    '-'
                  ) : gettingBalance ? (
                    <LoadingOutlined style={{ marginRight: 6 }} />
                  ) : (
                    `${balance || 0} NFT(s)`
                  )}
                </div>
              </Col>
            </Row>
            {isChainConnected ? (
              rest > 0 ? (
                <Button
                  type={'primary'}
                  loading={minting}
                  onClick={runMint}
                  block={true}
                >
                  {formatMessage({ id: 'story.claim' })}
                </Button>
              ) : (
                <Button type={'primary'} disabled={true} block={true}>
                  {formatMessage({ id: 'story.sold-out' })}
                </Button>
              )
            ) : (
              <Button type={'primary'} onClick={openWalletModal} block={true}>
                {formatMessage(
                  { id: 'connect-wallet-to' },
                  { chain: currentStory.chainInfo.name },
                )}
              </Button>
            )}
          </div>
        </div>
      ) : syncing ? (
        <div className={styles.publishCard}>
          <Spin
            spinning={true}
            tip={formatMessage({ id: 'story.waiting-for-sync' })}
          />
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
    </ColorfulBorder>
  );
}
