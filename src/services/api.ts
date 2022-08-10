import { client } from '@/services/index';
import { gql } from 'graphql-request';

export const login = async (
  account: string,
  chain: string,
  message: string,
  signature: string,
) => {
  return await client.request<{ login: API.Jwt }>(
    gql`
      mutation login(
        $account: String!
        $chain: String!
        $message: String!
        $signature: String!
      ) {
        login(
          account: $account
          chain: $chain
          message: $message
          signature: $signature
        ) {
          expiresIn
          token
        }
      }
    `,
    { account, chain, message, signature },
  );
};

export const getChains = async () => {
  return await client.request<{
    chains: API.Chain[];
  }>(gql`
    query chains {
      chains {
        name
        type
      }
    }
  `);
};

export const currentUser = async () => {
  return await client.request<{
    currentUser: API.User | null;
  }>(gql`
    query currentUser {
      currentUser {
        account
        chain
      }
    }
  `);
};

export const getStories = async () => {
  return await client.request<{ stories: API.Story[] }>(gql`
    query stories {
      stories {
        id
      }
    }
  `);
};
