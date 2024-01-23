import { gql, GraphQLClient } from 'graphql-request';

const API =
  process.env.NODE_ENV === 'production'
    ? 'https://gql.mainnet.desmos.network/v1/graphql'
    : 'https://gql.morpheus.desmos.network/v1/graphql';

const client = new GraphQLClient(API, {
  headers: {},
});

export const getProfiles = async (address: string) => {
  return (
    await client.request<{ profile: Desmos.Profile[] }>(
      gql`
        query profile($where: profile_bool_exp, $limit: Int) {
          profile(where: $where, limit: $limit) {
            address
            nickname
            profile_pic
            dtag
          }
        }
      `,
      {
        where: {
          address: {
            _in: [address],
          },
        },
        limit: 10,
      },
    )
  ).profile;
};

export const getSubspace = async (name: string, address: string) => {
  return (
    await client.request<{ subspace: Desmos.Subspace[] }>(
      gql`
        query subspace($where: subspace_bool_exp) {
          subspace(where: $where) {
            description
            id
            name
            owner_address
            creator_address
          }
        }
      `,
      {
        where: {
          owner_address: {
            _in: [address],
          },
          name: {
            _eq: name,
          },
        },
      },
    )
  ).subspace[0];
};
