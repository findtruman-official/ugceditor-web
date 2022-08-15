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
        findsAddress
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
              createAt
              updateAt
            }
            createAt
          }
          nft {
            price
            uriPrefix
            name
            total
            sold
            authorReserved
            authorClaimed
            image
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
  return await request<API.IpfsData>(`/fcc-story/ipfs/json`, {
    method: 'POST',
    data,
    headers: {
      'x-token': token,
    },
  });
}

export async function getJson<T>(cid: string) {
  return await request<T>(`/fcc-story/ipfs/json/${encodeURIComponent(cid)}`, {
    method: 'GET',
  });
}

export async function getMetadataUriPrefix(
  amount: number,
  chain: string,
  description: string,
  image: string,
  name: string,
) {
  return await client.request<{ metadataUriPrefix: API.IpfsResult }>(
    gql`
      mutation metadataUriPrefix(
        $amount: Int!
        $chain: String!
        $description: String!
        $image: String!
        $name: String!
      ) {
        metadataUriPrefix(
          amount: $amount
          chain: $chain
          description: $description
          image: $image
          name: $name
        ) {
          cid
          url
        }
      }
    `,
    { amount, chain, description, image, name },
  );
}
