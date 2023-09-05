import { Prisma } from "../../../node_modules/.prisma/client";
import { GraphQLError } from "graphql";
import { withFilter } from "graphql-subscriptions";
import { userIsConversationFriend } from "../../util/functions"
import { GraphQLContext, MessagePopulated, MessageSentSubscriptionPayload, SendMessageArguments } from "../../util/types";
import { conversationPopulated } from "./conversation";

const resolvers = {
    Query: {
        getMessages: async (
            _: any,
            args: { conversationId: string},
            context: GraphQLContext
        ): Promise<Array<MessagePopulated>> => {
            const { session, prisma} = context;
            const { conversationId } = args;

            if (!session?.user) {
                throw new GraphQLError("Not authorized")
            }
            
            const {
                user: { id: userId}
            } = session;

            // checking if conversation exists and user is part of conversation
            const conversation = await prisma.conversation.findUnique({
                where: {
                    id: conversationId
                },
                include: conversationPopulated
            })
            if (!conversation) {
                throw new GraphQLError("Conversation Not Found");
            }
            const isAllowedToView = userIsConversationFriend(
                conversation.friends, 
                userId);
            if (!isAllowedToView) {
                throw new GraphQLError("Not authorized")
            }
            try {
                const messages = await prisma.message.findMany({
                    where: {
                        conversationId
                    },
                    include: messagePopulated,
                    orderBy: {
                        createdAt: "desc"
                    }
                });
                return messages;  
            } catch (error: any) {
                console.log('getMessages error', error)
                throw new GraphQLError(error?.message)
            }
        }
    },
    Mutation: {
        sendMessage: async (
            _: any,
            args: SendMessageArguments,
            context: GraphQLContext
        ): Promise<boolean> => {

            const { session, prisma, pubsub } = context;

            if (!session?.user) {
                throw new GraphQLError('Not authorized')
            }
            const { id: userId } = session.user;
            const { senderId, conversationId, body } = args;

            if (userId !== senderId) {
                throw new GraphQLError("Not Authorized");
            }

            try {
                // create new message instance
                const newMessage = await prisma.message.create({
                    data: {
                        conversationId,
                        senderId,
                        body
                    },
                    include: messagePopulated
                })
                // Find the conversationFriend
                const friend = await prisma.conversationFriend.findFirst({
                    where: {
                        userId,
                        conversationId
                    }
                })

                if (!friend) {
                    throw new GraphQLError("Not authorized")
                }

                // update conversation 
                const conversation = await prisma.conversation.update({
                    where: {
                        id: conversationId
                    },
                    data: {
                        latestMessageId: newMessage.id,
                        friends: {
                            update: {
                                where: {
                                    id: friend.id
                                },
                                data: {
                                    hasSeenLatestMessage: true
                                }
                            },
                            updateMany: {
                                where: {
                                    NOT: {
                                        userId
                                    }
                                },
                                data: {
                                    hasSeenLatestMessage: false
                                }
                            }
                        }
                    },
                    include: conversationPopulated
                });
                pubsub.publish('MESSAGE_SENT', {
                    messageSent: newMessage
                })
                // pubsub.publish('CONVERSATION_UPDATED', {
                //     conversationUpdated: conversation
                // })
            } catch (error: any) {
                console.log("sendMessage error", error);
                throw new GraphQLError("Error sending message");
            }
            return true;
        },
    },
    Subscription: {
        messageSent: {
            subscribe: withFilter((_:any, __: any, context: GraphQLContext) => {
                const { pubsub } = context;

                return pubsub.asyncIterator(["MESSAGE_SENT"]);
            }, 
            (payload: MessageSentSubscriptionPayload,
            args: { conversationId: string},
            context: GraphQLContext) => {
                return payload.messageSent.conversationId === args.conversationId;
            })
        }
    }
};

export const messagePopulated = Prisma.validator<Prisma.MessageInclude>()({
    sender: {
        select: {
            id: true,
            username: true
        }
    }
})

export default resolvers;