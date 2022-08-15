import { GraphQLClient } from 'graphql-request';

// const API = '/api/graphql/';
const API = '/api/fcc-story/graphql/';

export const client = new GraphQLClient(API, {
  headers: {},
});
