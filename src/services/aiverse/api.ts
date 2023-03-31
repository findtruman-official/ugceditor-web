import { client } from '@/services/aiverse';
import { gql } from 'graphql-request';

export const getDevJwt = async (uid?: string) => {
  return await client.request<{
    devJwt: {
      token: string;
      expireAt: string | number;
    };
  }>(
    gql`
      query devJwt($uid: String!) {
        devJwt(uid: $uid) {
          token
          expireAt
        }
      }
    `,
    { uid },
  );
};

export const getCurrentUser = async (token: string, uid?: string) => {
  return client.request<{ currentUser: API.User }>(
    gql`
      query currentUser {
        currentUser {
          avatarUrl
          eth {
            address
            wallet
          }
          id
          neo {
            publicKey
            wallet
          }
          near {
            accountId
            publicKey
            wallet
          }
          twitter {
            id
            name
            profileImageUrl
            username
          }
          google {
            email
            firstName
            lastName
            picture
          }
          username
        }
      }
    `,
    { uid },
    {
      authorization: `Bearer ${token}`,
    },
  );
};


export const getActivity = async (id: string) => {
  return client.request<{ activity: API.Activity }>(
    gql`
      query activity($id: String!) {
        activity(id: $id) {
          coverImgUrl
          id
          name
          planFinishAt
          planStartAt
          rule
          status
        }
      }
    `,
    {
      id,
    },
  );
};


export const getActivities = async (status?: API.ActivityStatus) => {
  return client.request<{ activities: API.Activity[] }>(
    gql`
      query activities($statusIn: [ActivityStatus!]) {
        activities(statusIn: $statusIn) {
          coverImgUrl
          id
          name
          planFinishAt
          planStartAt
          rule
          status
        }
      }
    `,
    {
      statusIn: status ? [status] : undefined,
    },
  );
};


export const getActivitySubmissions = async (
  actId: string,
  page: number,
  pageSize: number,
  order: API.SubmissionOrder,
  orderBy: API.SubmissionOrderBy,
) => {
  return client.request<{ activitySubmissions: API.ActivitySubmission[] }>(
    gql`
      query activitySubmissions(
        $actId: String!
        $order: SubmissionOrder!
        $orderBy: SubmissionOrderBy!
        $page: Int!
        $pageSize: Int!
      ) {
        activitySubmissions(
          actId: $actId
          order: $order
          orderBy: $orderBy
          page: $page
          pageSize: $pageSize
        ) {
          activity {
            coverImgUrl
            id
            name
            status
          }
          content {
            contentId
            contentType
            pubInfo {
              ... on ActivityContentPublicInfoOutput {
                contentType
                image
              }
              ... on ActivityContentPublicInfoMicrostory {
                contentType
                contents {
                  description
                  id
                  order
                  outputId
                  outputUrl
                }
                coverOutputId
                coverOutputUrl
                description
                title
                uid
                microStoryId
              }
            }
            used
          }
          createTime
          id
          publisher
          publisherInfo {
            avatarUrl
            id
            username
          }
          uid
          votes
        }
      }
    `,
    { page, pageSize, order, orderBy, actId },
  );
};


export const getMicroStoryDetail = async (
  microStoryId: string,
) => {
  return client.request<{ getMicroStory: API.ActivityMicroStory }>(
    gql`
      query getMicroStory($microStoryId: String!) {
        getMicroStory(microStoryId: $microStoryId) {
          contents {
            description
            id
            order
            outputId
            outputUrl
          }
          coverOutputId
          coverOutputUrl
          description
          frozen
          id
          title
          uid
        }
      }
    `,
    { microStoryId },
  );
};


// 获取当前用户在act中的全部微故事
export const getUserActivityMicroStories = async (
  activityId: string,
  includeUsed: boolean,
  token: string,
  page: number,
  pageSize: number,
) => {
  return client.request<{ userActivityMicroStories: API.ActivityMicroStory[] }>(
    gql`
      query userActivityMicroStories(
        $activityId: String!
        $includeUsed: Boolean!
        $page: Float!
        $pageSize: Float!
      ) {
        userActivityMicroStories(
          activityId: $activityId
          includeUsed: $includeUsed
          page: $page
          pageSize: $pageSize
        ) {
          contents {
            description
            id
            order
            outputId
            outputUrl
          }
          coverOutputId
          coverOutputUrl
          description
          frozen
          id
          title
          uid
        }
      }
    `,
    { activityId, includeUsed, page, pageSize },
    {
      authorization: `Bearer ${token}`,
    },
  );
};

// 获取当前用户在act中的微故事的数量
export const getCountUserActivityMicroStories = async (
  activityId: string,
  includeUsed: boolean,
  token: string,
) => {
  return client.request<{
    countUserActivityMicroStories: API.ActivityMicroStory[];
  }>(
    gql`
      query countUserActivityMicroStories(
        $activityId: String!
        $includeUsed: Boolean!
      ) {
        countUserActivityMicroStories(
          activityId: $activityId
          includeUsed: $includeUsed
        )
      }
    `,
    { activityId, includeUsed },
    {
      authorization: `Bearer ${token}`,
    },
  );
};
