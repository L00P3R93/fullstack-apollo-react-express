import cors from 'cors'
import express from 'express'
import jwt from 'jsonwebtoken';
import { ApolloServer } from 'apollo-server-express'
import { createServer } from 'http';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws'
import { GraphQLError } from 'graphql';
import { faker } from '@faker-js/faker'
import DataLoader from 'dataloader';

import 'dotenv/config'

import resolvers from './resolvers'
import mergedTypeDefs from './schema'
import models, { sequelize } from './models'
import loaders from './loaders';

const mySchema = makeExecutableSchema({ 
    typeDefs: mergedTypeDefs, 
    resolvers 
})

const app = express()
const httpServer = createServer(app);

app.use(cors());

const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
})

const serverCleanup = useServer({ schema: mySchema } , wsServer);


const getMe = async req => {
    const token = req.headers['x-token'];

    if(token){
        try{
            return await jwt.verify(token, process.env.SECRET);
        }catch(e){
            throw new GraphQLError('Your session expired. Sign-In again', { extensions: { code: 'UNAUTHENTICATED' } });
        }
    }
}

const userLoader = new DataLoader(keys => loaders.user.batchUsers(keys, models))

const server = new ApolloServer({
    schema: mySchema,
    introspection: true,
    plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
        {
            async serverWillStart(){
                return {
                    async drainServer(){
                        await serverCleanup.dispose();
                    }
                }
            }
        },
    ],
    formatError: (error) => {
        // remove the internal sequelize error message
        // leave only the important validation error
        const message = error.message
            .replace('SequelizeValidationError: ', '')
            .replace('Validation error: ', '');
        return {
            ...error,
            message,
        };
    },
    context: async ({ req, connection }) => {
        if(connection){
            return { models };
        }

        const me = req ? await getMe(req) : null;
        return {
            models,
            me,
            secret: process.env.SECRET,
            loaders: {
                users: userLoader
            }
        };
    }
})

const eraseDatabaseOnSync = true;

server.start().then(() => {
    console.log('[!] Server started');
    server.applyMiddleware({ app });
    const isTest = !!process.env.TEST_DATABASE;
    sequelize.sync({ force: isTest }).then(async () => {
        if(isTest){
            console.log('[!] Database erased');
            await createUsersWithMessages(new Date());
            await seedDB();
        }
        console.log('[!] Database synced');
        httpServer.listen(process.env.PORT, () => {
            console.log(
                `🚀 Query endpoint ready at http://localhost:${process.env.PORT}${server.graphqlPath}`
            );
            console.log(
                `🚀 Subscription endpoint ready at ws://localhost:${process.env.PORT}${server.graphqlPath}`
            );
        });
    });
});



const createUsersWithMessages = async (date) => {
    await models.User.create(
        {
            username: 'sntaks',
            email: 'sntaks@sntaks.com',
            role: 'ADMIN',
            password: 'sntaks',
            messages: [
                {
                    text: 'Sntaks World',
                    createdAt: date.setSeconds(date.getSeconds() + 1),
                },
            ],
        },
        {
            include: [models.Message],
        }
    );

    await models.User.create(
        {
            username: 'malaq',
            email: 'malaq@sntaks.com',
            password: 'malaq',
            messages: [
                {
                    text: 'Another Sntaks World',
                    createdAt: date.setSeconds(date.getSeconds() + 1),
                },
                {
                    text: 'Malaq World ...',
                    createdAt: date.setSeconds(date.getSeconds() + 1),
                }
            ],
        },
        {
            include: [models.Message],
        }
    );
};

const seedDB = async () => {
    try {
        for(let i=4; i<10; i++){
            let user_name = faker.internet.userName()
            const user = await models.User.create({
                username: user_name,
                email: faker.internet.email(),
                password: user_name,
            })

            for(let j=0; j<3; j++){
                const message = await models.Message.create({
                    text: faker.lorem.sentence(),
                    createdAt: faker.date.anytime(),
                    userId: user.id,
                })
            }
        }
        console.log("[!] Database seeded");
    } catch (error) {
        console.log("[!] Error Seeding Database: ", error);
    }
}



