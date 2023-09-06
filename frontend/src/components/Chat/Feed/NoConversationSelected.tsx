import { GetConversationsData } from '@/util/types';
import { useQuery } from '@apollo/client';
import { Flex, Stack, Text } from '@chakra-ui/react';
import ConversationOperations from "../../../graphql/operations/conversation"
import React from 'react';
import { BiMessageSquareDots } from 'react-icons/bi';

type NoConversationSelectedProps = {

};

const NoConversationSelected: React.FC<NoConversationSelectedProps> = () => {

    const { data, loading, error } = useQuery<GetConversationsData>(
        ConversationOperations.Queries.getConversations
    );

    if (!data?.getConversations || loading || error) return null;

    const { getConversations } = data;

    const hasConversations = getConversations.length;

    const text = hasConversations
        ? "Select a Conversation"
        : "Let's Get Started 🥳";

    return (
        <Flex height="100%" justify="center" align="center">
            <Stack spacing={10} align="center">
                <Text fontSize={40}>{text}</Text>
                <BiMessageSquareDots fontSize={90} />
            </Stack>
        </Flex>
    );
}
export default NoConversationSelected;