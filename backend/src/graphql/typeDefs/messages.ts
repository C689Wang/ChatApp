import { gql } from "graphql-tag";

const typeDefs = gql`
    type Message {
        id: String
        sender: User
        body: String
        createdAt: Date
    }

    type Query {
        getMessages(conversationId: String): [Message]
    }

    type Mutation {
        sendMessage(
            conversationId: String, 
            senderId: String, 
            body: String
        ): Boolean
    }

    type Mutation {
        recallMessage(
            conversationId: String,
            messageId: String,
            senderId: String
        ): Boolean
    }

    type Subscription {
        messageSent(conversationId: String): Message
    }
`;

export default typeDefs;