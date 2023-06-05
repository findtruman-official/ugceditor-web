export const idlFactory = ({ IDL }) => {
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
  return IDL.Service({
    'countSales' : IDL.Func([], [IDL.Nat], ['query']),
    'countStories' : IDL.Func([], [IDL.Nat], ['query']),
    'getSale' : IDL.Func([IDL.Nat], [IDL.Opt(Sale)], ['query']),
    'getStory' : IDL.Func([IDL.Nat], [IDL.Opt(Story)], ['query']),
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
  });
};
export const init = ({ IDL }) => { return []; };
