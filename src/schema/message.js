import { gql } from "apollo-server-express";

const messageSchema = gql`
    extend type Query {
        messages(cursor: String, limit: Int): MessageConnection!
        message(id: ID!): Message!
    }

    type MessageConnection {
        edges: [Message!]!
        pageInfo: PageInfo!
    }

    type PageInfo {
        hasNextPage: Boolean!
        endCursor: String!
    }

    type Message {
        id: ID!
        text: String!
        createdAt: Date!
        user: User!
    }

    type MessageCreated {
        message: Message!
    }

    extend type Subscription {
        messageCreated: MessageCreated!
    }

    extend type Mutation {
        createMessage(text: String!): Message!
        deleteMessage(id: ID!): Boolean!
    }

    
`;

export default messageSchema;