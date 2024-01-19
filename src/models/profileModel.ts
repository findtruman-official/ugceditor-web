import { getProfiles } from '@/services/desmos';
import { ChainType } from '@/wallets';
import { useModel } from '@@/exports';
import { useRequest } from 'ahooks';

export default () => {
  const { accounts } = useModel('walletModel', (state) => ({
    accounts: state.accounts,
  }));

  const {
    data: profiles,
    loading: profileLoading,
    refreshAsync: refreshProfile,
  } = useRequest(
    async () => {
      if (!accounts[ChainType.Desmos]) return undefined;
      return await getProfiles(accounts[ChainType.Desmos]);
    },
    {
      refreshDeps: [accounts],
    },
  );

  return { profiles, profileLoading, refreshProfile };
};
