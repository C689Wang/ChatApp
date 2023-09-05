import { gql } from "graphql-tag";

export const MessageFields = `
    id
    sender {
        id
        username
    }
    body
    createdAt
`;

export default {
    Queries: {
        getMessages: gql`
            query GetMessages($conversationId: String!) {
                getMessages(conversationId: $conversationId) {
                    ${MessageFields}
                }
            }
        `
    },
    Mutations: {
        sendMessage: gql`
            mutation SendMessage(
                $conversationId: String!, 
                $senderId: String!, 
                $body: String!
            ) {
                sendMessage(, 
                    conversationId: $conversationId,
                    senderId: $senderId,
                    body: $body
                ) 
            }
        `
    },
    Subscriptions: {
        messageSent: gql`
            subscription MessageSent($conversationId: String!) {
                messageSent(conversationId: $conversationId) {
                    ${MessageFields}
                }
            }
        `
    }
}