import {message, Tooltip, Modal} from 'antd';
import styles from './MicroStoryActionList.less';
import React from 'react';
import {
    LikeOutlined,
    ShareAltOutlined,
    TwitterOutlined,
    LoadingOutlined,
    EyeInvisibleOutlined,
} from '@ant-design/icons';
import {useIntl, useModel} from '@@/exports';
import {useCreation, useMemoizedFn} from 'ahooks';
import {getSubmissionTweetUrl} from '@/utils/tweet';
import {copy} from '@/utils/utils';
import {ChainType} from "@/wallets";

interface ActivityImageActionListProps {
    actId: string;
    style?: React.CSSProperties;
    iconSize?: string | number;
    isActivityEnded: boolean;
    story: API.ActivityMicroStory;
}

const MicroStoryActionList = ({
                                  actId,
                                  style = {},
                                  iconSize = '18px',
                                  isActivityEnded,
                                  story,
                              }: ActivityImageActionListProps) => {
    const {formatMessage} = useIntl();
    const [_message, messageContextHolder] = message.useMessage();
    const [modal, modalContextHolder] = Modal.useModal();

    const {accounts, connectedWallets} = useModel('walletModel', (model) => ({
        accounts: model.accounts,
        connectedWallets: model.connectedWallets,
    }));

    const {voteCache, runUnbindNear} = useModel(
        'near',
        (state) => ({
            voteCache: state.voteCache,
            runUnbindNear: state.runUnbindNear,
        }),
    );

    const account = useCreation(() => accounts[ChainType.Near], [accounts])
    const connectedWallet = useCreation(() => connectedWallets[ChainType.Near], [connectedWallets])

    const votedNum = useCreation(
        () => (voteCache && story ? voteCache[story?.id] : 0),
        [voteCache, story],
    );


    const updateQueryStringParameter = (key: string, value: string) => {
        let uri = window.location.href;
        if (!value) {
            return uri;
        }
        let re = new RegExp('([?&])' + key + '=.*?(&|$)', 'i');
        let separator = uri.indexOf('?') !== -1 ? '&' : '?';
        let newUrl = '';
        if (uri.match(re)) {
            newUrl = uri.replace(re, '$1' + key + '=' + value + '$2');
        } else {
            newUrl = uri + separator + key + '=' + value;
        }
        return newUrl;
    };
    const siteShareLink = () => {
        const clipBoardContent = updateQueryStringParameter('id', story.id);
        copy(clipBoardContent);
    };


    const tweetUrl = useCreation(() => {
        if (story) return getSubmissionTweetUrl(story.id);
    }, [story]);


    const renderVotedNum = useMemoizedFn(() => {
        let rcnode = <></>;
        if (votedNum) {
            rcnode = (
                <span>
          +
                    {Intl.NumberFormat('en-US', {
                        notation: 'compact',
                        maximumFractionDigits: 1,
                    }).format(votedNum)}
        </span>
            );
        } else {
            rcnode = <EyeInvisibleOutlined style={{color: '#afafaf'}}/>;
        }
        return rcnode;
    });


    return (
        <div className={styles.iconActionList} style={style}>
            <div
                className={styles.iconActionListItem}
                style={{fontSize: iconSize, width: iconSize}}
            >
                <Tooltip
                    placement={'bottom'}
                    title={formatMessage(
                        {
                            id: votedNum
                                ? 'activity-near.vote.not-author-voted'
                                : 'activity-near.vote.not-author-no-voted',
                        },
                        {
                            votes:  <span>{votedNum}</span>,
                        },
                    )}
                >
                    <div
                        className={styles.votesGroup}
                        onClick={()=>{
                             modal.confirm({
                                 title: formatMessage({
                                     id: 'model.title.confirm',
                                 }),
                                 content: formatMessage({
                                     id: 'activity-near.model.go-to-aiverse',
                                 }),
                                 okType: 'primary',
                                 okText: formatMessage( {
                                     id: 'model.button.ok',
                                 }),
                                 cancelText: formatMessage({
                                     id: 'model.button.cancel',
                                 }),
                                 maskClosable: true,
                                 centered: true,
                                 onOk: async () => {
                                     // window.open(`https://aiverse.me/pre/#/activity/NEAR"?id=${story.id}`)
                                     window.open(`http://192.168.0.105:8000/#/activity/NEAR?id=${story.id}`)
                                 },
                             })
                         }}
                    >
                        <LikeOutlined
                            style={{marginRight: 4}}
                            className={`${isActivityEnded ? styles.disabled : ''}`}
                            disabled={true}
                        />
                        <span>
                            {renderVotedNum()}
                        </span>
                    </div>
                </Tooltip>
            </div>

            <Tooltip
                placement={'bottom'}
                title={formatMessage({id: 'activity-near.copy-share-link'})}
            >
                <ShareAltOutlined
                    className={styles.iconActionListItem}
                    style={{fontSize: iconSize, width: iconSize}}
                    onClick={() => siteShareLink()}
                />
            </Tooltip>

            <Tooltip
                placement={'bottom'}
                title={formatMessage({
                    id: 'activity-near.share-micro-story-with-twitter',
                })}
            >
                <a href={tweetUrl} target={'_blank'} rel={'noreferrer noopener'}>
                    <TwitterOutlined
                        className={styles.iconActionListItem}
                        style={{color: '#1D9BF0', fontSize: iconSize, width: iconSize}}
                    />
                </a>
            </Tooltip>

            {messageContextHolder}
            {modalContextHolder}
        </div>
    );
};
export default MicroStoryActionList;
