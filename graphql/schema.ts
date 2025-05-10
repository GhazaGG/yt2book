import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type Book {
    id: ID!
    content: String!
    pdf: String!
  }

  type Mutation {
    generateBook(youtubeUrl: String!): Book!
  }
`;