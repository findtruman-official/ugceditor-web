import styles from './index.less';
import {useIntl, useLocation, useModel} from '@@/exports';
import {message, Button, Modal, Tooltip, Row, Col, Skeleton} from 'antd';
import React, {useEffect, useState} from 'react';
import {
    FormOutlined,
    AppstoreAddOutlined,
    PlusOutlined,
    VerticalAlignTopOutlined,
} from '@ant-design/icons';
import {
    useAsyncEffect,
    useCreation,
    useMemoizedFn,
    useCountDown,
} from 'ahooks';
import {getActivities} from '@/services/aiverse/api';
import MicroStoryActionList from '@/components/MicroStoryActionList/MicroStoryActionList';
import MicroStoryDetailModal from '@/components/MicroStoryDetailModal/MicroStoryDetailModal';
import MicroStoryCoverGroup from '@/components/MicroStoryCoverGroup/MicroStoryCoverGroup';
import {LoadingOutlined} from '@ant-design/icons';
import BG_ACTIVITY from '@/assets/activity-bg-findtruman-neo.webp';



const Index = () => {
    const {formatMessage} = useIntl();
    const [_message, messageContextHolder] = message.useMessage();
    const [modal, modalContextHolder] = Modal.useModal();
    const location = useLocation();
    const { search } = location;
    const searchParams = new URLSearchParams(search);
    const storyId = useCreation(() => searchParams.get('id'), [searchParams]);

    const [selectedMicroStoryId, setSelectedMicroStoryId] = useState<string>('');
    const [activity, setActivity] = useState<API.Activity>();
    const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
    const [showBackBtn, setShowBackBtn] = useState<boolean>(false);
    const [targetDate, setTargetDate] = useState<string | undefined>();
    const [selectedMircoStory, setSelectedMircoStory] =
        useState<API.ActivityMicroStory>();

    const [countdown, formattedRes] = useCountDown({
        targetDate,
        onEnd: () => onCountDownEnd(),
    });


    const onCountDownEnd = useMemoizedFn(async () => {
        await getActivityInfo();
    });


    const {
        usersCache,
        getMicroStorySubmissions,
        hasMore,
        microStories,
        runAsyncMicroStories,
        loadingMicroStories,
    } = useModel('near', (model) => ({
        usersCache: model.usersCache,
        getMicroStorySubmissions: model.getMicroStorySubmissions,
        hasMore: model.hasMore,
        microStories: model.microStories,
        runAsyncMicroStories: model.runAsyncMicroStories,
        loadingMicroStories: model.loadingMicroStories,
    }));

    useEffect(() => {
        if (!!storyId && activity) {
            setSelectedMicroStoryId(storyId);
            setDetailModalVisible(true);
        }
    }, [activity, storyId]);

    const getActivityInfo = async () => {
        let {activities} = await getActivities();
        const [activity] = activities.filter((item: API.Activity) => {
            // return item.rule === 'NEAR';
            return item.rule === 'NEAR' && item.id === '6';
        });
        if (!activity) return;
        setActivity(activity);
        if (activity.status === 'created') {
            setTargetDate(activity.planStartAt);
        } else if (activity.status === 'started') {
            setTargetDate(activity.planFinishAt);
        }
    };

    const onScroll = useMemoizedFn(() => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 2) {
            if (hasMore && !loadingMicroStories) {
                runAsyncMicroStories(false, activity?.id);
            }
        }

        if( window.scrollY >= 800){
            setShowBackBtn(true)
        }else{
            setShowBackBtn(false)
        }
    });

    useEffect(() => {
        window.addEventListener('scroll', onScroll);
        return () => {
            window.removeEventListener('scroll', onScroll);
        };
    }, []);


    useAsyncEffect(async () => {
        await getActivityInfo();
    }, []);

    useAsyncEffect(async () => {
        if (!activity) return;
        await runAsyncMicroStories(true, activity.id);
    }, [activity]);



    return (
        <div className={styles.container}>
            <img className={styles.activityBg} src={BG_ACTIVITY}/>

            {activity && activity?.status !== 'finished' && (
                <div className={styles.centerSection}>
                    <div className={styles.subtitle}>
                        {formatMessage({
                            id: `activity.activity-status-${activity?.status.toLowerCase()}`,
                        })}
                    </div>
                    {
                        <div className={styles.endTimeLine}>
                            <span>{formattedRes?.days || 0}</span>
                            <span>
                  {formatMessage({ id: 'activity.activity-end-in-days' })}
                </span>
                            <span>{formattedRes?.hours || 0}</span>
                            <span>
                  {formatMessage({ id: 'activity.activity-end-in-hours' })}
                </span>
                            <span>{formattedRes?.minutes || 0}</span>
                            <span>
                  {formatMessage({ id: 'activity.activity-end-in-minutes' })}
                </span>
                            <span>{formattedRes?.seconds || 0}</span>
                            <span>
                  {formatMessage({ id: 'activity.activity-end-in-seconds' })}
                </span>
                        </div>
                    }
                </div>
            )}

            <div className={styles.section}>
                <div className={styles.sectionTitle}>
                    {formatMessage({ id: 'activity.section-gallery' })}
                </div>

                <Row
                    gutter={[24, 24]}
                    style={{minWidth: 1000}}
                    justify={'start'}
                    wrap={true}
                    className={styles.scrollList}
                >
                    {!loadingMicroStories && microStories && microStories.length ? (
                        [
                            ...microStories
                                ?.filter((item: API.ActivityMicroStory) => !!item)
                                .map((item: API.ActivityMicroStory) => (
                                    <Col key={item.id}>
                                        <MicroStoryCard
                                            key={item.id}
                                            activity={activity}
                                            data={item}
                                            loading={item.loading}
                                            open={() => {
                                                setSelectedMircoStory(item);
                                                setDetailModalVisible(true);
                                            }}
                                        />
                                    </Col>
                                )),
                        ]
                    ) : !loadingMicroStories ? (
                        <div className={styles.emptyTip}>
                            <div>{formatMessage({id: 'activity.no-creation-tip'})}</div>
                        </div>
                    ) : null}
                </Row>

                {loadingMicroStories && (
                    <div className={styles.loading}>
                        <LoadingOutlined/>
                    </div>
                )}
            </div>

            {showBackBtn && <Button
                className={styles.backTop}
                type="default"
                shape="circle"
                icon={<VerticalAlignTopOutlined/>}
                onClick={() => {
                    document.body.scrollIntoView({behavior: 'smooth', block: 'start'});
                }}
            />}

            <div className={styles.btnContainer}>
                <span className={styles.submitBtn}
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
                                window.open("http://192.168.0.105:8000/#/activity/NEAR")
                            },
                        })
                    }}
                >{formatMessage({id: 'activity-near.submit'})}</span>
            </div>

            <MicroStoryDetailModal
                actId={activity?.id}
                storyId={selectedMicroStoryId}
                open={!!activity && detailModalVisible}
                onClose={async () => {
                    setDetailModalVisible(false);
                }}
                story={selectedMircoStory}
                isActivityEnded={!!activity && activity.status === 'finished'}
            />

            {messageContextHolder}
            {modalContextHolder}
        </div>
    );
};


const MicroStoryCard = ({
                            activity,
                            data,
                            open,
                            disable = false,
                            isAuthor = false,
                            createStory = false,
                            onCreateStory,
                            onEditStory,
                            onDeleteStory,
                            onPublishStory,
                            unBind,
                            onBind,
                            loading = false,
                        }: {
    activity: API.Activity | undefined;
    data: API.ActivityMicroStory | undefined;
    open?: () => void;
    disable?: boolean;
    isAuthor?: boolean;
    createStory?: boolean;
    onCreateStory?: () => void;
    onEditStory?: () => void;
    onDeleteStory?: () => void;
    onPublishStory?: () => void;
    unBind?: () => void;
    onBind?: () => void;
    loading?: boolean;
}) => {
    const {formatMessage} = useIntl();
    const {usersCache} = useModel('near', (state) => ({
        usersCache: state.usersCache,
    }));

    const isContnetsIncomplete = useMemoizedFn(() => {
        if (!data || !data.contents || data.contents.length < 3) return false;
        let conts = data.contents.filter((cont) => {
            if (!cont.description || !cont.outputId) return cont;
        });
        return data.contents.length ? (conts ? conts.length === 0 : false) : false;
    });

    let orderedContents = useCreation(() => {
        return data && data.contents && data.contents.length > 0
            ? data.contents
                .sort((a, b) => {
                    return a.order - b.order;
                })
                .map((o) => {
                    return o.outputUrl;
                })
            : [];
    }, [data]);


    return (
        <div className={styles.microStoryCard}>
            {createStory ? (
                <div className={styles.createCard} onClick={() => onCreateStory?.()}>
                    <PlusOutlined color={'#fff'}/>
                    <div className={styles.new}>
                        {formatMessage({id: 'activity-near.tab.my.new-story'})}
                    </div>
                </div>
            ) : (
                data && (
                    <div>
                        {isAuthor && data.frozen && (
                            <div className={styles.publishedTag}>
                                {formatMessage({id: 'activity-near.published-tag'})}
                            </div>
                        )}
                        <MicroStoryCoverGroup
                            storyCoverOutputUrl={data.coverOutputUrl}
                            contentOutputUrls={orderedContents}
                            open={() => (data?.frozen ? open?.() : onEditStory?.())}
                        />

                        <div className={styles.storyInfo}>
                            <div className={styles.title}>{data.title}</div>
                            {data.frozen && (
                                <>
                                    {!isAuthor && usersCache[data.uid] && (
                                        <div className={styles.userInfo}>
                                            <img
                                                className={styles.avatar}
                                                src={`${usersCache[data.uid].avatarUrl}`}
                                                loading="lazy"
                                                alt=""
                                            />
                                            <div className={styles.username}>
                                                {usersCache[data.uid].username}
                                            </div>
                                        </div>
                                    )}

                                    {activity && (
                                        <MicroStoryActionList
                                            story={data}
                                            actId={activity.id}
                                            isActivityEnded={activity.status === 'finished'}
                                        />
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )
            )}
        </div>
    );
};

export default Index;
