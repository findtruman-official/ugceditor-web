import {getActivitySubmissions} from '@/services/aiverse/api';
import {useAsyncEffect, useCreation, useRequest} from 'ahooks';
import {useState} from 'react';
import {useModel} from "@@/exports";
import {ChainType} from "@/wallets";

const PageSize = 16;
let page = 1;
let hasMore = true;

export default () => {
    const { accounts, connectedWallets } = useModel('walletModel', (model) => ({
        accounts: model.accounts,
        connectedWallets: model.connectedWallets,
    }));

    const account = useCreation(()=>accounts[ChainType.Near], [accounts])
    const connectedWallet = useCreation(()=>connectedWallets[ChainType.Near], [connectedWallets])

    useAsyncEffect(async () => {
        await runMyVotesOnMicroStory(account);
    }, [account]);

    const [usersCache, setUsersCache] = useState<
        Record<string, API.User | API.UserBasicInfo>
    >({});

    const {
        data: voteCache,
        runAsync: runMyVotesOnMicroStory,
    } = useRequest(
        async (accountId: string) => {
            if (!connectedWallet) return {};
            if(!accountId) return {};
            try {
                let voted = await connectedWallet.provider.getMyVotesOnMicroStory(
                    accountId,
                );
                let votedOfStories: Record<string, number> = {};
                for (let i in voted) {
                    let votedItem = voted[i];
                    let votedMicroStoryId = JSON.parse(
                        votedItem.metadata.extra,
                    ).microStoryId;
                    if (!votedOfStories[votedMicroStoryId]) {
                        votedOfStories[votedMicroStoryId] = 1;
                    } else {
                        votedOfStories[votedMicroStoryId] += 1;
                    }
                }
                return votedOfStories;
            } catch (e) {
                console.log(e);
                return {};
            }
        },
        {
            manual: true,
        },
    );

    const {
        data: votedMicroStories,
        runAsync: runVotedMicroStories,
        loading: loadingVotedMicroStories,
    } = useRequest(
        async (accountId: string, actId: string) => {
            if (!connectedWallet) return;
            try {
                let list = await connectedWallet.provider.getMyVotesOnMicroStory(
                    accountId,
                );
                let microStories: Record<string, boolean> = {};
                let votedOfStories = voteCache;
                for (let i in list) {
                    let listItem = list[i];
                    let activityId = JSON.parse(listItem.metadata.extra).activityId || '';
                    if (actId === activityId) {
                        let microStoryId = JSON.parse(listItem.metadata.extra).microStoryId;
                        microStories[microStoryId] = true;
                    }
                }

                const promise = Object.keys(microStories).map((id, i) => {
                    return new Promise(async (resolve) => {
                        let {getMicroStory} = await getMicroStoryDetail(id, token);
                        resolve(getMicroStory);
                    });
                });

                return await Promise.all(promise);
            } catch (e) {
                console.log(e);
                return [];
            }
        },
        {
            manual: true,
        },
    );


    const {
        data: microStories,
        runAsync: runAsyncMicroStories,
        loading: loadingMicroStories,
        mutate: mutateMicroStories,
    } = useRequest(
        async (reset = false, actId: string) => {
            if (!actId) return [];

            let _MicroStories: API.ActivityMicroStory[] = microStories || [];
            let _newMicroStories: API.ActivityMicroStory[] = [];
            if (reset) {
                hasMore = true;
                page = 1;
            }

            let {activitySubmissions} = await getActivitySubmissions(
                actId,
                page,
                PageSize,
                'DESC',
                'CREATETIME',
            );
            let userBasicInfos = usersCache;

            let _newMicroStorySubmissions = activitySubmissions.map((s) => {
                let {contentType, microStoryId, ...others} = s.content
                    .pubInfo as API.ActivityContentPublicInfoMicrostory;
                userBasicInfos[s.publisherInfo.id] = s.publisherInfo;
                return {id: microStoryId, frozen: true, ...others};
            });

            _newMicroStories =_newMicroStorySubmissions;
            setUsersCache(userBasicInfos);

            if (_newMicroStories.length !== PageSize) {
                hasMore = false;
            }
            page += 1;

            return reset ? _newMicroStories : [..._MicroStories, ..._newMicroStories];
        },
        {
            manual: true,
        },
    );

    return {
        voteCache,
        loadingVotedMicroStories,
        usersCache,
        hasMore,
        microStories,
        runAsyncMicroStories,
        loadingMicroStories,
        mutateMicroStories,
    };
};