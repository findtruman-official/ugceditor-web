import { GraphQLClient } from 'graphql-request';

const API = 'http://10.243.248.69:3000/graphql/';

export const client = new GraphQLClient(API, {
  headers: {},
});
