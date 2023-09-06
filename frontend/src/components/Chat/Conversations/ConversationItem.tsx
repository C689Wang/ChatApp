import {
    Avatar,
    Box,
    Flex,
    Menu,
    MenuItem,
    MenuList,
    Stack,
    Text,
} from "@chakra-ui/react";
import { formatRelative } from "date-fns";
import enUS from "date-fns/locale/en-US";
import React, { useState } from "react";
import { GoPrimitiveDot } from "react-icons/go";
import { MdDeleteOutline } from "react-icons/md";
import { BiLogOut } from "react-icons/bi";
import { AiOutlineEdit } from "react-icons/ai";
import { formatUsernames } from "../../../util/functions";
import { ConversationPopulated } from "../../../../../backend/src/util/types";

const formatRelativeLocale = {
    lastWeek: "eeee",
    yesterday: "'Yesterday",
    today: "p",
    other: "MM/dd/yy",
};

interface ConversationItemProps {
    conversation: ConversationPopulated;
    userId: string;
    onClick: () => void;
    isSelected: boolean;
    hasSeenLatestMessage: boolean;
    onDeleteConversation: (conversationId: string) => void
};

const ConversationItem: React.FC<ConversationItemProps> = ({
    conversation,
    userId,
    onClick,
    isSelected,
    hasSeenLatestMessage,
    onDeleteConversation
}) => {

    const [menuOpen, setMenuOpen] = useState(false);

    const handleClick = (event: React.MouseEvent) => {
        if (event.type === "click") {
            onClick();
        } else if (event.type === "contextmenu") {
            event.preventDefault();
            setMenuOpen(true);
        }
    };


    return (
        <Stack
            direction="row"
            align="center"
            justify="space-between"
            p={4}
            cursor="pointer"
            borderRadius={4}
            bg={isSelected ? "whiteAlpha.200" : "none"}
            _hover={{ bg: "whiteAlpha.200" }}
            onClick={handleClick}
            onContextMenu={handleClick}
            position="relative"
        >
            <Menu isOpen={menuOpen} onClose={() => setMenuOpen(false)}>
                <MenuList bg="#2d2d2d">
                    {/* <MenuItem
                        icon={<AiOutlineEdit fontSize={20} />}
                        onClick={(event) => {
                            event.stopPropagation();
                            //   onEditConversation();
                        }}
                        bg="#2d2d2d"
                    >
                        Edit
                    </MenuItem> */}
                    {conversation.friends.length > 2 ? (
                        <MenuItem
                            icon={<BiLogOut fontSize={20} />}
                            onClick={(event) => {
                                event.stopPropagation();
                                // onLeaveConversation(conversation);
                            }}
                            bg="#2d2d2d"
                        >
                            Leave
                        </MenuItem>
                    ) : (
                        <MenuItem
                            icon={<MdDeleteOutline fontSize={20} />}
                            onClick={(event) => {
                                event.stopPropagation();
                                onDeleteConversation(conversation.id);
                            }}
                            bg="#2d2d2d"
                        >
                            Delete
                        </MenuItem>
                    )}
                </MenuList>
            </Menu>
            <Flex position="absolute" left="-6px">
                {hasSeenLatestMessage === false && (
                    <GoPrimitiveDot fontSize={18} color="#6B46C1" />
                )}
            </Flex>
            <Avatar />
            <Flex justify="space-between" width="80%" height="100%">
                <Flex direction="column" width="70%" height="100%">
                    <Text
                        fontWeight={600}
                        whiteSpace="nowrap"
                        overflow="hidden"
                        textOverflow="ellipsis"
                    >
                        {formatUsernames(conversation.friends, userId)}
                    </Text>
                    {conversation.latestMessage && (
                        <Box width="140%">
                            <Text
                                color="whiteAlpha.700"
                                whiteSpace="nowrap"
                                overflow="hidden"
                                textOverflow="ellipsis"
                            >
                                {conversation.latestMessage.body}
                            </Text>
                        </Box>
                    )}
                </Flex>
                <Text color="whiteAlpha.700" textAlign="right" position='absolute' right={4}>
                    {formatRelative(new Date(conversation.updatedAt), new Date(), {
                        locale: {
                            ...enUS,
                            formatRelative: (token: any) =>
                                formatRelativeLocale[
                                token as keyof typeof formatRelativeLocale
                                ],
                        },
                    })}
                </Text>
            </Flex>
        </Stack>
    );
}

export default ConversationItem;


