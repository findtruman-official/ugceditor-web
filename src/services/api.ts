import { client } from '@/services/index';
import { PREFIX } from '@/utils/const';
import { request } from '@umijs/max';
import { gql } from 'graphql-request';

export const login = async (
  account: string,
  chain: string,
  message: string,
  pubkey: string,
  signature: string,
) => {
  return await client.request<{ login: API.Jwt }>(
    gql`
      mutation login(
        $account: String!
        $chain: String!
        $message: String!
        $pubkey: String
        $signature: String!
      ) {
        login(
          account: $account
          chain: $chain
          message: $message
          pubkey: $pubkey
          signature: $signature
        ) {
          expiresIn
          token
        }
      }
    `,
    { account, chain, message, signature, pubkey },
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
        taskModule
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
            title
            description
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
            nftSaleAddr
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

export const getNftInfo = async (chain: string, chainStoryId: string) => {
  return await client.request<{ story: API.Story }>(
    gql`
      query story($chain: String!, $chainStoryId: String!) {
        story(chain: $chain, chainStoryId: $chainStoryId) {
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
  return await request<API.IpfsData>(`${PREFIX}/ipfs/json`, {
    method: 'POST',
    data,
    headers: {
      'x-token': token,
    },
  });
}

export async function getJson<T>(cid: string) {
  return await request<T>(`${PREFIX}/ipfs/json/${encodeURIComponent(cid)}`, {
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

export async function syncStoryContentHash(
  chain: string,
  chainStoryId: string,
) {
  return await client.request<{ story: API.Story }>(
    gql`
      mutation story($chain: String!, $chainStoryId: String!) {
        syncStoryContentHash(chain: $chain, chainStoryId: $chainStoryId) {
          chainStoryId
        }
      }
    `,
    { chain, chainStoryId },
  );
}

export async function syncStoryNftSale(chain: string, chainStoryId: string) {
  return await client.request<{ story: API.Story }>(
    gql`
      mutation story($chain: String!, $chainStoryId: String!) {
        syncStoryNftSale(chain: $chain, chainStoryId: $chainStoryId) {
          chainStoryId
        }
      }
    `,
    { chain, chainStoryId },
  );
}

export async function getStoryTasks(chain: string, chainStoryId: string) {
  return await client.request<{ storyTasks: API.StoryTask[] }>(
    gql`
      query storyTasks($chain: String!, $chainStoryId: String!) {
        storyTasks(chain: $chain, chainStoryId: $chainStoryId) {
          id
          status
          title
          submits {
            id
          }
        }
      }
    `,
    { chain, chainStoryId },
  );
}

export async function getChainTasks(chain: string, chainStoryId: string) {
  return await client.request<{ chainTasks: API.StoryChainTask[] }>(
    gql`
      query chainTasks($chain: String!, $chainStoryId: String!) {
        chainTasks(chain: $chain, chainStoryId: $chainStoryId) {
          chainTaskId
          status
          title
          cid
          submits {
            chainSubmitId
          }
        }
      }
    `,
    { chain, chainStoryId },
  );
}

export async function getStoryTask(taskId: number) {
  return await client.request<{ storyTask: API.StoryTask }>(
    gql`
      query storyTask($id: Float!) {
        storyTask(id: $id) {
          id
          status
          title
          description
          submits {
            id
            status
            content
            account
            createTime
          }
        }
      }
    `,
    { id: taskId },
  );
}

export async function getChainTask(
  chain: string,
  chainStoryId: string,
  chainTaskId: string,
) {
  return await client.request<{ chainTask: API.StoryChainTask }>(
    gql`
      query chainTask(
        $chain: String!
        $chainStoryId: String!
        $chainTaskId: String!
      ) {
        chainTask(
          chain: $chain
          chainStoryId: $chainStoryId
          chainTaskId: $chainTaskId
        ) {
          chain
          chainTaskId
          cid
          creator
          account
          createTime
          title
          description
          nft
          rewardNfts
          status
          submits {
            chainSubmitId
            chainTaskId
            cid
            content
            createTime
            creator
            account
            status
          }
        }
      }
    `,
    {
      chain,
      chainStoryId,
      chainTaskId,
    },
  );
}

export async function createStoryTask(
  chain: string,
  chainStoryId: string,
  title: string,
  description: string,
  token: string,
) {
  return await client.request(
    gql`
      mutation createStoryTask(
        $chain: String!
        $chainStoryId: String!
        $description: String!
        $title: String!
      ) {
        createStoryTask(
          chain: $chain
          chainStoryId: $chainStoryId
          description: $description
          title: $title
        ) {
          id
        }
      }
    `,
    { chain, chainStoryId, description, title },
    {
      'x-token': token,
    },
  );
}

export async function cancelStoryTask(id: number, token: string) {
  return await client.request(
    gql`
      mutation cancelStoryTask($id: Float!) {
        cancelStoryTask(id: $id) {
          id
        }
      }
    `,
    { id },
    {
      'x-token': token,
    },
  );
}

export async function doneStoryTask(
  id: number,
  submitIds: number[],
  token: string,
) {
  return await client.request(
    gql`
      mutation doneStoryTask($id: Float!, $submitIds: [Int!]!) {
        doneStoryTask(id: $id, submitIds: $submitIds) {
          id
        }
      }
    `,
    { id, submitIds },
    {
      'x-token': token,
    },
  );
}

export async function updateStoryTask(
  id: number,
  title: string,
  description: string,
  token: string,
) {
  return await client.request(
    gql`
      mutation updateStoryTask(
        $description: String
        $id: Int!
        $title: String
      ) {
        updateStoryTask(description: $description, id: $id, title: $title) {
          id
        }
      }
    `,
    { id, title, description },
    {
      'x-token': token,
    },
  );
}

export async function createTaskSubmit(
  taskId: number,
  content: string,
  token: string,
) {
  return await client.request(
    gql`
      mutation createTaskSubmit($content: String!, $taskId: Int!) {
        createTaskSubmit(content: $content, taskId: $taskId) {
          id
        }
      }
    `,
    { taskId, content },
    {
      'x-token': token,
    },
  );
}

export async function removeTaskSubmit(id: number, token: string) {
  return await client.request(
    gql`
      mutation removeTaskSubmit($id: Int!) {
        removeTaskSubmit(id: $id)
      }
    `,
    { id },
    {
      'x-token': token,
    },
  );
}
