// src/graphql/schema.ts
import { gql } from 'apollo-server-micro';

export const typeDefs = gql`
  type Book {
    id: String!
    content: String!
    pdf: String!
    title: String!
    videoId: String!
  }

  type Query {
    _dummy: String
  }

  type Mutation {
    generateBook(youtubeUrl: String!): Book!
  }
`;