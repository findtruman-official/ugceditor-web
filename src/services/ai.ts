import { client } from '@/services/index';
import { gql } from 'graphql-request';

export const createAIImage = async (
  prompt: string,
  ratio: string,
  style: string,
) => {
  return await client.request<{ createAiImage: API.AiImage }>(
    gql`
      mutation createAiImage(
        $prompt: String!
        $ratio: String!
        $style: String!
      ) {
        createAiImage(prompt: $prompt, ratio: $ratio, style: $style) {
          id
          imageUrl
          status
        }
      }
    `,
    { prompt, ratio, style },
  );
};

export const runAIChat = async (messages: string[]) => {
  return await client.request<{ runAichat: string }>(
    gql`
      mutation runAichat($messages: [String!]!) {
        runAichat(messages: $messages)
      }
    `,
    { messages },
  );
};

export const getAIImage = async (id: string) => {
  return await client.request<{ aiImage: API.AiImage }>(
    gql`
      query aiImage($id: String!) {
        aiImage(id: $id) {
          id
          imageUrl
          status
        }
      }
    `,
    { id },
  );
};
