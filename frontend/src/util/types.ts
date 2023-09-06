import { ConversationPopulated, MessagePopulated } from "../../../backend/src/util/types";

// Users

export interface CreateUsernameData {
    createUsername: {
        sucess: boolean;
        error: string;
    }
}

export interface CreateUsernameVariables {
    username: string;
}

export interface SearchUsersInput {
    username: string;
}

export interface SearchUsersData {
    searchUsers: Array<SearchedUser>;
}

export interface SearchedUser {
    id: string;
    username: string
}

// Conversations

export interface GetConversationsData {
    getConversations: Array<ConversationPopulated>
}

export interface CreateConversationData {
    createConversation: {
        conversationId: string;
    }
}

export interface CreateConversationInput {
    friendIds: Array<string>;
}

export interface ConversationUpdatedData {
    conversationUpdated: {
        conversation: ConversationPopulated;
    }
}

export interface ConversationDeletedData {
    conversationDeleted: {
        id: string
    }
}

// Messages

export interface GetMessagesData {
    getMessages: Array<MessagePopulated>
}

export interface GetMessagesInput {
    conversationId: string
}

export interface SendMessageData {
    sendMessage: boolean
}

export interface SendMessageInput {
    conversationId: string, 
    senderId: string, 
    body: string
}

export interface MessageSubscriptionData {
    subscriptionData: {
        data: {
            messageSent: MessagePopulated
        }
    }
}