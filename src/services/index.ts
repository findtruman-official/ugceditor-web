import { GraphQLClient } from 'graphql-request';

const API = '/fcc-story/graphql/';

export const client = new GraphQLClient(API, {
  headers: {},
});
