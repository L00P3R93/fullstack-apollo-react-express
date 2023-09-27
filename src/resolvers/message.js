import { combineResolvers } from "graphql-resolvers";

import { isAuthenticated, isMessageOwner } from "./authorization";

export default {
    Query: {
        messages: async (parent, args, { models }) => {
            return await models.Message.findAll();
        },
        message: async (parent, { id }, { models }) => {
            return await models.Message.findByPk(id)
        }
    },

    Message: {
        user: async (message, args, { models }) => {
            return await models.User.findByPk(message.userId)
        }
    },

    Mutation: {
        createMessage: combineResolvers(
            isAuthenticated,
            async (parent, { text }, { me, models }) => {
                try {
                    return await models.Message.create({
                        text,
                        userId: me.id,
                    })
                } catch (error) {
                    throw new Error(error)
                }
            },  
        ), 

        deleteMessage: combineResolvers(
            isAuthenticated,
            isMessageOwner,
            async (parent, { id }, { models }) => {
                return await models.Message.destroy({ where: { id } })
            }
        ),
    },
}