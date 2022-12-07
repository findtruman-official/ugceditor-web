export const idlFactory = ({ IDL }) => {
  const Task = IDL.Record({
    'id' : IDL.Nat,
    'cid' : IDL.Text,
    'nft' : IDL.Principal,
    'status' : IDL.Nat,
    'creator' : IDL.Principal,
    'storyId' : IDL.Nat,
    'rewardNfts' : IDL.Vec(IDL.Nat64),
    'nextSubmitId' : IDL.Nat,
  });
  const TaskSubmit = IDL.Record({
    'id' : IDL.Nat,
    'cid' : IDL.Text,
    'status' : IDL.Nat,
    'creator' : IDL.Principal,
    'storyId' : IDL.Nat,
    'taskId' : IDL.Nat,
  });
  const Sale = IDL.Record({
    'id' : IDL.Nat,
    'nft' : IDL.Principal,
    'token' : IDL.Principal,
    'total' : IDL.Nat,
    'authorClaimed' : IDL.Nat,
    'authorReserved' : IDL.Nat,
    'recv' : IDL.Principal,
    'sold' : IDL.Nat,
    'price' : IDL.Nat,
    'uriPrefix' : IDL.Text,
  });
  const Story = IDL.Record({
    'id' : IDL.Nat,
    'cid' : IDL.Text,
    'author' : IDL.Principal,
  });
  const StoryTaskInfo = IDL.Record({
    'nextTaskId' : IDL.Nat,
    'storyId' : IDL.Nat,
  });
  return IDL.Service({
    'cancelTask' : IDL.Func([IDL.Nat, IDL.Nat], [], ['oneway']),
    'claimAuthorReservedNft' : IDL.Func(
        [IDL.Nat, IDL.Nat],
        [IDL.Opt(IDL.Vec(IDL.Nat64))],
        [],
      ),
    'countSales' : IDL.Func([], [IDL.Nat], ['query']),
    'countStories' : IDL.Func([], [IDL.Nat], ['query']),
    'createTask' : IDL.Func(
        [IDL.Nat, IDL.Text, IDL.Principal, IDL.Vec(IDL.Nat64)],
        [IDL.Opt(Task)],
        [],
      ),
    'createTaskSubmit' : IDL.Func(
        [IDL.Nat, IDL.Nat, IDL.Text],
        [TaskSubmit],
        [],
      ),
    'getMagic' : IDL.Func([], [IDL.Nat], ['query']),
    'getSale' : IDL.Func([IDL.Nat], [IDL.Opt(Sale)], ['query']),
    'getStory' : IDL.Func([IDL.Nat], [IDL.Opt(Story)], ['query']),
    'getStoryTaskInfo' : IDL.Func(
        [IDL.Nat],
        [IDL.Opt(StoryTaskInfo)],
        ['query'],
      ),
    'getTask' : IDL.Func([IDL.Nat, IDL.Nat], [IDL.Opt(Task)], ['query']),
    'getTaskSubmit' : IDL.Func(
        [IDL.Nat, IDL.Nat, IDL.Nat],
        [IDL.Opt(TaskSubmit)],
        ['query'],
      ),
    'markTaskDone' : IDL.Func([IDL.Nat, IDL.Nat, IDL.Nat], [], ['oneway']),
    'mintNft' : IDL.Func([IDL.Nat], [IDL.Opt(IDL.Nat64)], []),
    'publishNft' : IDL.Func(
        [
          IDL.Nat,
          IDL.Nat,
          IDL.Nat,
          IDL.Principal,
          IDL.Principal,
          IDL.Nat,
          IDL.Text,
          IDL.Text,
          IDL.Text,
        ],
        [IDL.Opt(Sale)],
        [],
      ),
    'publishStory' : IDL.Func([IDL.Text], [Story], []),
    'updateStory' : IDL.Func([IDL.Nat, IDL.Text], [IDL.Opt(Story)], []),
    'updateTask' : IDL.Func([IDL.Nat, IDL.Nat, IDL.Text], [IDL.Opt(Task)], []),
    'withdrawTaskSubmit' : IDL.Func(
        [IDL.Nat, IDL.Nat, IDL.Nat],
        [],
        ['oneway'],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
