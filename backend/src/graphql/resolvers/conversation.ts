import { GraphQLError } from 'graphql';
import { withFilter } from "graphql-subscriptions";
import { Prisma } from "../../../node_modules/.prisma/client";
import { ConversationCreatedSubscriptionPayload, ConversationPopulated, GraphQLContext } from "../../util/types";


const resolvers = {
    Query: {
        getConversations: async (
            _: any,
            __: any,
            context: GraphQLContext
        ): Promise<Array<ConversationPopulated>> => {
            const { session, prisma} = context;

            if (!session?.user) {
                throw new GraphQLError("Not authorized")
            }

            const {
                user: { id: userId}
            } = session;

            try {
                const conversations = await prisma.conversation.findMany({
                    include: conversationPopulated,
                });
                return conversations.filter(conversation => 
                    !!conversation.friends.find(friend => friend.userId === userId));
            } catch (error: any) {
                console.log('getConversations error', error)
                throw new GraphQLError(error?.message)
            }
        }
    },
  
    Mutation: {
        createConversation: async (
            _: any,
            args: { friendIds: Array<string> },
            context: GraphQLContext
        ): Promise<{ conversationId: string}> => {
            const { session, prisma, pubsub } = context;
           const { friendIds } = args;
           if (!session?.user) {
            throw new GraphQLError("Not authorized");
           }
           const { user : { id: userId }} = session;

           try {
            const conversation = await prisma.conversation.create({
                data: {
                    friends: {
                        createMany: {
                            data: friendIds.map(id => ({
                                userId: id,
                                hasSeenLatestMessage: id === userId
                            }))
                        }
                    }
                },
                include: conversationPopulated
            })

            // emit a conversation_created event using pubsub
            pubsub.publish('CONVERSATION_CREATED', {
                conversationCreated: conversation
            })

            return {
                conversationId: conversation.id
            }
           } catch (error: any) {
            console.log('createConversation error', error);
            throw new GraphQLError("Error creating conversation")
           }
        },
        markConversationAsRead: async (
            _: any,
            args: { userId: string; conversationId: string },
            context: GraphQLContext
        ): Promise<boolean> => { 
            const { session, prisma } = context;
            const { userId, conversationId } = args;

            if (!session?.user) {
                throw new GraphQLError("Not Authorized");
            }

            try {
                // const friend = prisma.conversationFriend.findFirst({
                //     where: {
                //         userId,
                //         conversationId
                //     },
                // });
                // if (!friend) {
                //     throw new GraphQLError("Friend instance not found")
                // }
                // await prisma.conversationFriend.update({
                //     where: {
                //         id: 
                //     },
                //     data: {
                //         hasSeenLatestMessage: true
                //     }
                // })
                await prisma.conversationFriend.updateMany({
                    where: {
                      userId,
                      conversationId,
                    },
                    data: {
                      hasSeenLatestMessage: true,
                    },
                  });
            } catch (error: any) {
                console.log("markConversationAsRead error", error);
                throw new GraphQLError(error.message)
            }
            return true;
        }

    },
    Subscription: {
        conversationCreated: {
            subscribe: withFilter((_:any, __: any, context: GraphQLContext) => {
                const { pubsub } = context;

                return pubsub.asyncIterator(['CONVERSATION_CREATED']);
            }, 
            (payload: ConversationCreatedSubscriptionPayload,
            _,
            context: GraphQLContext) => {
                const { session } = context;
                const { conversationCreated: { friends } } = payload;

                const userIsFriend = !!friends.find(friend => friend.userId === session?.user?.id);
                return userIsFriend;
            })
        }
    }
};


export const friendPopulated = Prisma.validator<Prisma.ConversationFriendInclude>()({
    user: {
        select : {
            id: true,
            username: true
        }
    }
})

export const conversationPopulated = Prisma.validator<Prisma.ConversationInclude>()({
    friends: {
        include: friendPopulated
    },
    latestMessage: {
        include: {
            sender: {
                select: {
                    id: true,
                    username: true
                }
            }
        }
    }
})

export default resolvers;