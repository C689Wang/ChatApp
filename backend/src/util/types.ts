import { Prisma, PrismaClient } from "../../node_modules/.prisma/client";
import { ISODateString } from "next-auth";
import { conversationPopulated, friendPopulated } from "../graphql/resolvers/conversation";
import { Context } from 'graphql-ws/lib/server'
import { PubSub } from 'graphql-subscriptions';
import { messagePopulated } from "../graphql/resolvers/message"


// Server Configuration

export interface GraphQLContext {
    session: Session | null;
    prisma: PrismaClient;
    pubsub: PubSub
}


export interface Session {
    user: User;
    expires: ISODateString
}

export interface SubscriptionContext extends Context {
    connectionParams: {
        session?: Session
    }
}

// Users

export interface User {
    id: string;
    username: string;
    email: string;
    image: string;
    name: string;
    emailVerified: boolean;
}

export interface CreateUsernameResponse {
    success?: boolean;
    error?: string;
}

// Conversations

export interface ConversationCreatedSubscriptionPayload {
    conversationCreated: ConversationPopulated
}

export type ConversationPopulated = Prisma.ConversationGetPayload<{ 
    include: typeof conversationPopulated
}>

export type FriendPopulated = Prisma.ConversationFriendGetPayload<{
    include: typeof friendPopulated
}>

export interface ConversationUpdatedSubscriptionPayload {
    conversationUpdated: {
        conversation: ConversationPopulated
    }
}

// Messages

export interface SendMessageArguments {
    conversationId: string;
    senderId: string;
    body: string
}

export interface MessageSentSubscriptionPayload {
    messageSent: MessagePopulated
}

export type MessagePopulated = Prisma.MessageGetPayload<{
    include: typeof messagePopulated
}>