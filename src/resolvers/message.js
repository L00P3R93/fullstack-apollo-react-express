import {v4 as uuidv4} from 'uuid';

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
        createMessage: async (parent, { text }, { me, models }) => {
            return await models.Message.create({
                text,
                userId: me.id,
            })
        },

        deleteMessage: async (parent, { id }, { models }) => {
            return await models.Message.destroy({ where: { id } })
        }
    },
}