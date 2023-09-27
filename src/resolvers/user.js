import jwt from 'jsonwebtoken';
import { combineResolvers } from 'graphql-resolvers';
import {GraphQLError} from 'graphql';

import { isAdmin } from './authorization';

const createToken = async (user, secret, expiresIn) => {
    const { id, email, username, role } = user;
    return await jwt.sign({ id, email, username, role }, secret, { expiresIn });
}


export default {
    Query: {
        users: async (parent, args, { models }) => {
            return await models.User.findAll();
        },
        user: async (parent, { id }, { models }) => {
            return await models.User.findByPk(id);
        },
        me: async (parent, args, { me, models }) => {
            if(!me) return null;
            return await models.User.findByPk(me.id);
        },
    },

    Mutation: {
        signUp: async (
            parent, 
            { username, email, password }, 
            { models, secret }
        ) => {
            const user = await models.User.create({
                username,
                email,
                password,
            });

            return {
                token: createToken(user, secret, '30m'),
            };
        },

        signIn: async (parent, { login, password }, { models, secret }) => {
            const user = await models.User.findByLogin(login);

            if(!user){
                throw new GraphQLError('User not found', { extensions: { code: 'BAD_USER_INPUT' } });
            }

            const isValid = await user.validatePassword(password);

            if(!isValid){
                throw new GraphQLError('Invalid password', { extensions: { code: 'UNAUTHENTICATED' } });
            }

            return { token: createToken(user, secret, '30m') };
        },

        deleteUser: combineResolvers(
            isAdmin,
            async (parent, { id }, { models }) => {
                return await models.User.destroy({ where: { id } });
            }
        ) 
    },

    User: {
        messages: async (user, args, { models }) => {
            return await models.Message.findAll({
                where: {
                    userId: user.id
                }
            })
        }
    },
}