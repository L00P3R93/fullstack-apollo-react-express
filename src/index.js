import cors from 'cors'
import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import { ApolloServer, gql } from 'apollo-server-express'
import 'dotenv/config'



const app = express()

app.use(cors())

const schema = gql`
    type Query {
        users: [User!]
        me: User
        user(id: ID!): User

        messages: [Message!]!
        message(id: ID!): Message!
    }

    type User {
        id: ID!
        username: String!,
        messages: [Message!]
    }

    type Message {
        id: ID!
        text: String!
        user: User!
    }

    type Mutation {
        createMessage(text: String!): Message!
        deleteMessage(id: ID!): Boolean!
    }
`;

let users = {
    1: {
        id: '1',
        username: 'Sntaks',
        messageIds: [1],
    },
    2: {
        id: '2',
        username: 'Vincent',
        messageIds: [2],
    }
}

let messages = {
    1: {
        id: '1',
        text: 'Hello World',
        userId: '1'
    },
    2: {
        id: '2',
        text: 'By All',
        userId: '2'
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
        me: (parent, args, { me }) => {
            return me
        },
        messages: () => {
            return Object.values(messages)
        },
        message: (parent, { id }) => {
            return messages[id]
        }
    },

    User: {
        username: user => {
            return user.username
        },
        messages: user => {
            return Object.values(messages).filter(
                message => message.userId === user.id
            )
        }
    },

    Message: {
        user: message => {
            return users[message.userId]
        }
    },

    Mutation: {
        createMessage: (parent, { text }, { me }) => {
            const id = uuidv4()
            const message = {
                id: id,
                text,
                userId: me.id,
            }
            messages[id] = message;
            users[me.id].messageIds.push(id);

            return message;
        },

        deleteMessage: (parent, { id }, { me }) => {
            const { [id]: message, ...otherMessages} = messages;
            if(!message) return false;
            messages = otherMessages;
            return true;
        }
    },
};

const server = new ApolloServer({
    typeDefs: schema,
    resolvers,
    context: {
        me: users[1]
    }    
})

server.start().then(() => {
    console.log('[!] Server started');

    server.applyMiddleware({ app, path: '/graphql' });

    app.listen({ port: 8000 }, () => {
        console.log('Apollo Server on http://localhost:8000/graphql')
    });
});




