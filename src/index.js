import cors from 'cors'
import express from 'express'
import { ApolloServer, gql } from 'apollo-server-express'
import 'dotenv/config'

const app = express()

app.use(cors())

const schema = gql`
    type Query {
        me: User
    }

    type User {
        username: String!
    }
`;
const resolvers = {
    Query: {
        me: () => ({
            username: process.env.USERNAME
        })
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




