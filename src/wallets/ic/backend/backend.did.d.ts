import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface Sale {
  'id' : bigint,
  'nft' : Principal,
  'token' : Principal,
  'total' : bigint,
  'authorClaimed' : bigint,
  'authorReserved' : bigint,
  'recv' : Principal,
  'sold' : bigint,
  'price' : bigint,
  'uriPrefix' : string,
}
export interface Story { 'id' : bigint, 'cid' : string, 'author' : Principal }
export interface StoryTaskInfo { 'nextTaskId' : bigint, 'storyId' : bigint }
export interface Task {
  'id' : bigint,
  'cid' : string,
  'nft' : Principal,
  'status' : bigint,
  'creator' : Principal,
  'storyId' : bigint,
  'rewardNfts' : BigUint64Array,
  'nextSubmitId' : bigint,
}
export interface TaskSubmit {
  'id' : bigint,
  'cid' : string,
  'status' : bigint,
  'creator' : Principal,
  'storyId' : bigint,
  'taskId' : bigint,
}
export interface _SERVICE {
  'cancelTask' : ActorMethod<[bigint, bigint], undefined>,
  'claimAuthorReservedNft' : ActorMethod<
    [bigint, bigint],
    [] | [BigUint64Array]
  >,
  'countSales' : ActorMethod<[], bigint>,
  'countStories' : ActorMethod<[], bigint>,
  'createTask' : ActorMethod<
    [bigint, string, Principal, BigUint64Array],
    [] | [Task]
  >,
  'createTaskSubmit' : ActorMethod<[bigint, bigint, string], TaskSubmit>,
  'getMagic' : ActorMethod<[], bigint>,
  'getSale' : ActorMethod<[bigint], [] | [Sale]>,
  'getStory' : ActorMethod<[bigint], [] | [Story]>,
  'getStoryTaskInfo' : ActorMethod<[bigint], [] | [StoryTaskInfo]>,
  'getTask' : ActorMethod<[bigint, bigint], [] | [Task]>,
  'getTaskSubmit' : ActorMethod<[bigint, bigint, bigint], [] | [TaskSubmit]>,
  'markTaskDone' : ActorMethod<[bigint, bigint, bigint], undefined>,
  'mintNft' : ActorMethod<[bigint], [] | [bigint]>,
  'publishNft' : ActorMethod<
    [
      bigint,
      bigint,
      bigint,
      Principal,
      Principal,
      bigint,
      string,
      string,
      string,
    ],
    [] | [Sale]
  >,
  'publishStory' : ActorMethod<[string], Story>,
  'updateStory' : ActorMethod<[bigint, string], [] | [Story]>,
  'updateTask' : ActorMethod<[bigint, bigint, string], [] | [Task]>,
  'withdrawTaskSubmit' : ActorMethod<[bigint, bigint, bigint], undefined>,
}
