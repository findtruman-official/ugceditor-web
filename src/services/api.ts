import { client } from '@/services/index';
import { request } from '@umijs/max';
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
        factoryAddress
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

export const getStories = async (
  sort: 'Hotest' | 'Latest',
  author?: string[],
  chain?: string[],
) => {
  return await client.request<{ stories: API.Story[] }>(
    gql`
      query stories($author: [String!], $chain: [String!], $sort: StorySort) {
        stories(author: $author, chain: $chain, sort: $sort) {
          author
          chain
          chainStoryId
          nft {
            name
          }
          chainInfo {
            name
            type
          }
          contentHash
          createTime
          onChainAddr
          info {
            id
            cover
          }
        }
      }
    `,
    { author, chain, sort },
  );
};

export const getStory = async (chain: string, chainStoryId: string) => {
  return await client.request<{ story: API.Story }>(
    gql`
      query story($chain: String!, $chainStoryId: String!) {
        story(chain: $chain, chainStoryId: $chainStoryId) {
          author
          chainInfo {
            name
            type
          }
          chainStoryId
          contentHash
          info {
            chain
            chainStoryId
            id
            title
            cover
            description
            chapters {
              id
              name
              content
            }
            createAt
          }
          nft {
            price
            uriPrefix
          }
          createTime
        }
      }
    `,
    {
      chain,
      chainStoryId,
    },
  );
};

export const getChapter = async (id: number) => {
  return await client.request<{ chapter: API.StoryChapter }>(
    gql`
      query chapter($id: Int!) {
        chapter(id: $id) {
          id
          name
          content
          createAt
          updateAt
          info {
            chainStoryId
          }
        }
      }
    `,
    { id },
  );
};

export async function uploadJson<T>(data: T, token: string) {
  return await request<API.IpfsData>(`/api/ipfs/json`, {
    method: 'POST',
    data,
    headers: {
      'x-token': token,
    },
  });
}

export async function getJson<T>(cid: string) {
  return await request<T>(`/api/ipfs/json/${cid}`, { method: 'GET' });
}
