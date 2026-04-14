import type { TConversation } from 'librechat-data-provider';
import { createContext, useContext } from 'react';
import type { SetterOrUpdater } from 'recoil';
import type { ConvoGenerator } from '~/common';

type TAddedChatContext = {
    conversation: TConversation | null;
    setConversation: SetterOrUpdater<TConversation | null>;
    generateConversation: ConvoGenerator;
    addedIndex?: number;
};

export const AddedChatContext = createContext<TAddedChatContext>({} as TAddedChatContext);
export const useAddedChatContext = () => useContext(AddedChatContext);
