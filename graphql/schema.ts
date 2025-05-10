// src/graphql/schema.ts
import { gql } from 'apollo-server-micro';

export const typeDefs = gql`
  type Book {
    id: ID!
    content: String!
    pdf: String!
  }

  type Query {
    _dummy: String
  }

  type Mutation {
    generateBook(youtubeUrl: String!): Book!
  }
`;