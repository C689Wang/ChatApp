import { gql } from "@apollo/client";
import { MessageFields } from "./message"

const ConversationFields = `
        id
        friends {
            user {
                id
                username
            }
            hasSeenLatestMessage
        }
        latestMessage {
            ${MessageFields}
        }
        updatedAt
`;

export default {
    Queries: {
        getConversations: gql`
            query GetConversations {
                getConversations {
                    ${ConversationFields}
                }
            }
        `
    },
    Mutations: {
        createConversation: gql`
            mutation CreateConversation($friendIds: [String]!) {
                createConversation(friendIds: $friendIds) {
                    conversationId
                }
            }
        `,
        markConversationAsRead: gql`
            mutation MarkConversationAsRead($userId: String!, $conversationId: String!) {
                markConversationAsRead(userId: $userId, conversationId: $conversationId)
            }
        `
    },
    Subscriptions: {
        conversationCreated: gql`
            subscription ConversationCreated {
                conversationCreated {
                    ${ConversationFields}
                }
            }
        `
    }
}