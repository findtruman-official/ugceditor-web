import ColorfulBorder from '@/components/Colorful/ColorfulBorder';
import { WalletContext, WalletContextType } from '@/layouts';
import { PREFIX } from '@/utils/const';
import { useIntl } from '@@/plugin-locale';
import { InfoCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import {
  Button,
  Col,
  InputNumber,
  message,
  Modal,
  Popover,
  Row,
  Skeleton,
  Spin,
  Tooltip,
} from 'antd';
import BigNumber from 'bignumber.js';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useModel } from 'umi';
import styles from './NftCard.less';

interface NftCardProps {
  loading: boolean;
  syncing: boolean;
  onPublish: () => void;
}

const NftCard = ({ loading, onPublish, syncing }: NftCardProps) => {
  const { formatMessage } = useIntl();
  const { openWalletModal } = useContext<WalletContextType>(WalletContext);
  const { connectedWallets } = useModel('walletModel', (model) => ({
    connectedWallets: model.connectedWallets,
  }));
  const {
    currentStory,
    isAuthor,
    isChainConnected,
    refreshCurrentStory,
    balanceOfStoryNft,
    gettingBalanceOfStoryNft,
    refreshBalanceOfStoryNft,
    restOfStoryNftOnChain,
    gettingRestOfStoryNftOnChain,
    refreshRestOfStoryNftOnChain,
    reservedNftRest,
    claimReservedNft,
    claimingReservedNft,
    refreshNfts,
  } = useModel('storyModel', (model) => ({
    currentStory: model.currentStory,
    isAuthor: model.isAuthor,
    isChainConnected: model.isChainConnected,
    refreshCurrentStory: model.refreshCurrentStory,
    balanceOfStoryNft: model.balanceOfStoryNft,
    gettingBalanceOfStoryNft: model.gettingBalanceOfStoryNft,
    refreshBalanceOfStoryNft: model.refreshBalanceOfStoryNft,
    restOfStoryNftOnChain: model.restOfStoryNftOnChain,
    gettingRestOfStoryNftOnChain: model.gettingRestOfStoryNftOnChain,
    refreshRestOfStoryNftOnChain: model.refreshRestOfStoryNftOnChain,
    reservedNftRest: model.reservedNftRest,
    claimReservedNft: model.claimReservedNft,
    claimingReservedNft: model.claimingReservedNft,
    refreshNfts: model.refreshNfts,
  }));
  const { taskModule } = useModel('taskModel', (model) => ({
    taskModule: model.taskModule,
  }));

  const [claimReservedOpen, setClaimReservedOpen] = useState(false);
  const [claimReservedAmount, setClaimReservedAmount] = useState(1);

  const chain = currentStory?.chainInfo.type;
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
        refreshBalanceOfStoryNft();
        refreshRestOfStoryNftOnChain();
        refreshNfts();
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
    if (restOfStoryNftOnChain != -1) {
      return restOfStoryNftOnChain;
    } else if (currentStory?.nft) {
      return (
        currentStory.nft.total -
        currentStory.nft.sold -
        currentStory.nft.authorReserved
      );
    } else {
      return 0;
    }
  }, [currentStory, restOfStoryNftOnChain]);

  useEffect(() => {
    if (reservedNftRest === 0) {
      setClaimReservedOpen(false);
    }
  }, [reservedNftRest]);

  return (
    <ColorfulBorder
      noHoverable={true}
      style={{
        width: 260,
      }}
    >
      {!currentStory ? (
        <div className={'nft-card-skeleton'} style={{ height: 480 }}>
          <Skeleton.Image active={true} />
          <Skeleton style={{ padding: '20px 24px' }} active={true} />
        </div>
      ) : currentStory.nft ? (
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
                    ? new BigNumber(currentStory.nft.price)
                        .div(new BigNumber(10).pow(new BigNumber(mintDecimals)))
                        .toString()
                    : '-'}
                </div>
              </Col>
              <Col span={12}>
                <div className={styles.nftMetaLabel}>
                  {formatMessage({ id: 'story.rest' })}
                </div>
                <div className={styles.nftMetaValue}>
                  {!isChainConnected ? (
                    rest
                  ) : gettingRestOfStoryNftOnChain ? (
                    <LoadingOutlined />
                  ) : restOfStoryNftOnChain === -1 ? (
                    rest
                  ) : (
                    restOfStoryNftOnChain
                  )}
                </div>
              </Col>
              <Col span={12}>
                <div className={styles.nftMetaLabel}>
                  {formatMessage({ id: 'story.own' })}
                </div>
                <div className={styles.nftMetaValue}>
                  {!isChainConnected ? (
                    '-'
                  ) : gettingBalanceOfStoryNft ? (
                    <LoadingOutlined style={{ marginRight: 6 }} />
                  ) : (
                    `${balanceOfStoryNft || 0} NFT(s)`
                  )}
                </div>
              </Col>
            </Row>
            {isChainConnected ? (
              <Row style={{ width: '100%' }} wrap={false}>
                {rest > 0 ? (
                  <Col flex={1}>
                    <Button
                      type={'primary'}
                      loading={minting}
                      disabled={claimingReservedNft}
                      onClick={runMint}
                      block={true}
                    >
                      {formatMessage({ id: 'story.claim' })}
                    </Button>
                  </Col>
                ) : (
                  <Col flex={1}>
                    <Button type={'primary'} disabled={true} block={true}>
                      {formatMessage({ id: 'story.sold-out' })}
                    </Button>
                  </Col>
                )}
                {isAuthor && taskModule === 'Chain' && (
                  <Col flex={1}>
                    {reservedNftRest > 0 ? (
                      <Popover
                        open={claimReservedOpen}
                        onOpenChange={(open) => {
                          if (!open && !claimingReservedNft) {
                            setClaimReservedOpen(false);
                          }
                        }}
                        trigger={'click'}
                        content={
                          <div>
                            <div style={{ marginBottom: 8, fontSize: 15 }}>
                              {formatMessage({
                                id: 'story.claim-reserved-nft',
                              })}
                            </div>
                            <div
                              style={{
                                color: 'rgba(255, 255, 255, .5)',
                                marginBottom: 8,
                              }}
                            >
                              <InfoCircleOutlined />{' '}
                              {formatMessage(
                                { id: 'story.nft-reserved' },
                                { count: reservedNftRest },
                              )}
                            </div>
                            <Row gutter={8}>
                              <Col>
                                <InputNumber
                                  disabled={claimingReservedNft}
                                  value={claimReservedAmount}
                                  onChange={(e) => setClaimReservedAmount(e)}
                                  step={1}
                                  min={1}
                                  max={reservedNftRest}
                                />
                              </Col>
                              <Col>
                                <Button
                                  type={'primary'}
                                  loading={claimingReservedNft}
                                  onClick={async () => {
                                    try {
                                      await claimReservedNft(
                                        claimReservedAmount,
                                      );
                                      setClaimReservedAmount(1);
                                      message.success(
                                        formatMessage({ id: 'story.claimed' }),
                                      );
                                    } catch (e) {
                                      console.log(e);
                                      message.error(
                                        formatMessage({ id: 'mint-failed' }),
                                      );
                                    }
                                  }}
                                >
                                  {formatMessage({ id: 'story.claim' })}
                                </Button>
                              </Col>
                            </Row>
                          </div>
                        }
                      >
                        <Button
                          style={{ marginLeft: 6 }}
                          type={'primary'}
                          disabled={minting}
                          onClick={() => setClaimReservedOpen(true)}
                          block={true}
                        >
                          {formatMessage({
                            id: 'story.claim-reserved',
                          })}
                        </Button>
                      </Popover>
                    ) : (
                      <Tooltip
                        title={formatMessage({
                          id: 'story.reserved-nft-claimed',
                        })}
                      >
                        <Button
                          style={{ marginLeft: 6 }}
                          type={'primary'}
                          disabled={true}
                          block={true}
                        >
                          {formatMessage({
                            id: 'story.reserved-claimed',
                          })}
                        </Button>
                      </Tooltip>
                    )}
                  </Col>
                )}
              </Row>
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
};

export default NftCard;
