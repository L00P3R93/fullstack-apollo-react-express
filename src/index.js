import cors from 'cors'
import express from 'express'
import { ApolloServer, gql } from 'apollo-server-express'
import 'dotenv/config'

const app = express()

app.use(cors())

const schema = gql`
    type Query {
        users: [User!]
        me: User
        user(id: ID!): User
    }

    type User {
        id: ID!
        username: String!
    }
`;

let users = {
    1: {
        id: '1',
        username: 'Sntaks'
    },
    2: {
        id: '2',
        username: 'Vincent'
    }
}

const me = users[1]

const resolvers = {
    Query: {
        users: () => {
            return Object.values(users)
        },
        user: (parent, { id }) => {
            return users[id];
        },
        me: () => {
            return me
        },
    }
}

const server = new ApolloServer({
    typeDefs: schema,
    resolvers    
})

server.start().then(() => {
    console.log('[!] Server started')

    server.applyMiddleware({ app, path: '/graphql' });

    app.listen({ port: 8000 }, () => {
        console.log('Apollo Server on http://localhost:8000/graphql')
    })
})




