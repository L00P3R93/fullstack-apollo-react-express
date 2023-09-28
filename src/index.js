import cors from 'cors'
import express from 'express'
import jwt from 'jsonwebtoken';
import { ApolloServer } from 'apollo-server-express'
import { GraphQLError } from 'graphql';
import {faker} from '@faker-js/faker'

import 'dotenv/config'


import resolvers from './resolvers'
import schema from './schema'
import models, { sequelize } from './models'

const app = express()

app.use(cors())


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

const server = new ApolloServer({
    typeDefs: schema,
    resolvers,
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
    context: async ({req}) => {
        const me = await getMe(req);
        return {
            models,
            me,
            secret: process.env.SECRET
        };
    }
})

const eraseDatabaseOnSync = true;

server.start().then(() => {
    console.log('[!] Server started');


    server.applyMiddleware({ app, path: '/graphql' });
    sequelize.sync({ force: eraseDatabaseOnSync }).then(async () => {
        if(eraseDatabaseOnSync){
            console.log('[!] Database erased');
            createUsersWithMessages(new Date());
            await seedDB();   
        }
        console.log('[!] Database synced');
        app.listen({ port: 8000 }, () => {
            console.log('Apollo Server on http://localhost:8000/graphql')
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



