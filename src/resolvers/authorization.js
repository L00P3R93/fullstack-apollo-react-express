import { GraphQLError } from "graphql";
import { combineResolvers, skip } from "graphql-resolvers";

export const isAuthenticated = (parent, args, { me }) => 
    me ? skip : new GraphQLError('Not Authenticated as user', { extensions: { code: 'FORBIDDEN' } });

export const isAdmin = combineResolvers(
    isAuthenticated,
    (parent, args, { me: { role } }) => 
        role === 'ADMIN'
            ? skip
            : new GraphQLError('Not Authorized as admin', { extensions: { code: 'FORBIDDEN' } }),
)

export const isMessageOwner = async(parent, { id }, { models, me }) => {
    const message = await models.Message.findByPk(id, { raw: true });

    if(message.userId !== me.id){
        throw new GraphQLError('Not Authenticated as owner', { extensions: { code: 'FORBIDDEN' } });
    }

    return skip
}
