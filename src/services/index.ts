import { PREFIX } from '@/utils/const';
import { GraphQLClient } from 'graphql-request';

const API = `${PREFIX}/graphql/`;

export const client = new GraphQLClient(API, {
  headers: {},
});
