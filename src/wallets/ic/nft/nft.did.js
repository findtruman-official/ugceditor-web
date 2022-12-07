export const idlFactory = ({ IDL }) => {
    return IDL.Service({
        nameDip721: IDL.Func([], [IDL.Text], ['query']),
        balanceOfDip721: IDL.Func([IDL.Principal], [IDL.Nat64], ['query']),
        getTokenIdsForUserDip721: IDL.Func([IDL.Principal], [IDL.Vec(IDL.Nat64)], ['query']),
    });
};
