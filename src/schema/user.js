import { gql } from "apollo-server-express";

const userSchema = gql`
    extend type Query {
        users: [User!]
        me: User
        user(id: ID!): User
    }

    type Token {
        token: String!
    }

    type User {
        id: ID!
        username: String!
        email: String!
        role: String
        messages: [Message!]
    }

    extend type Mutation {
        signUp(
            username: String!
            email: String!
            password: String!
        ): Token!

        signIn(login: String!, password: String!): Token!
        deleteUser(id: ID!): Boolean!
    }
`;

export default userSchema;