import cors from 'cors'
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import 'dotenv/config'

import resolvers from './resolvers'
import schema from './schema'
import models from './models'

const app = express()

app.use(cors())

const server = new ApolloServer({
    typeDefs: schema,
    resolvers,
    context: {
        models,
        me: models.users[1]
    }    
})

server.start().then(() => {
    console.log('[!] Server started');

    server.applyMiddleware({ app, path: '/graphql' });

    app.listen({ port: 8000 }, () => {
        console.log('Apollo Server on http://localhost:8000/graphql')
    });
});




