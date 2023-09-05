import { gql } from "graphql-tag";

const typeDefs = gql`
    scalar Date
    
    type Conversation {
        id: String
        friends: [ConversationFriend]
        latestMessage: Message
        latestMessageId: String
        createdAt: Date
        updatedAt: Date
    }

    type ConversationFriend {
        id: String
        user: User
        hasSeenLatestMessage: Boolean
    }

    type ConversationUpdatedSubscriptionPayload {
        conversation: Conversation
    }

    type Query {
        getConversations: [Conversation]
    }

    type Mutation {
        createConversation(friendIds: [String]): CreateConversationResponse
    }

    type Mutation {
        markConversationAsRead(userId: String!, conversationId: String!): Boolean
    }

    type CreateConversationResponse {
        conversationId: String
    }

    type Subscription {
        conversationCreated: Conversation
    }

    type Subscription {
        conversationUpdated: ConversationUpdatedSubscriptionPayload
    }
`;

export default typeDefs;
