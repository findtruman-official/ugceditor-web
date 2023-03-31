import { GraphQLClient } from 'graphql-request';

const API = `/graphql/`;
// const API = `https://aiverse.me/graphql/`;

let onResponse = (response: any) => {};

export const client = new GraphQLClient(API);
