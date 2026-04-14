import { createAccessRoleModel } from './accessRole';
import { createAclEntryModel } from './aclEntry';

import { createAgentModel } from './agent';
import { createAgentCategoryModel } from './agentCategory';
import { createMCPServerModel } from './mcpServer';
import { createRoleModel } from './role';
import { createActionModel } from './action';
import { createAssistantModel } from './assistant';
import { createBalanceModel } from './balance';
import { createBannerModel } from './banner';
import { createConversationHistoryModel } from './conversationHistory';
import { createConversationTagModel } from './conversationTag';
import { createConversationModel } from './convo';
import { createFileModel } from './file';
import { createGroupModel } from './group';
import { createKeyModel } from './key';
import { createMemoryModel } from './memory';
import { createMessageModel } from './message';
import { createPluginAuthModel } from './pluginAuth';
import { createPresetModel } from './preset';
import { createProjectModel } from './project';
import { createPromptModel } from './prompt';
import { createPromptGroupModel } from './promptGroup';
import { createSessionModel } from './session';
import { createSharedLinkModel } from './sharedLink';
import { createTokenModel } from './token';
import { createToolCallModel } from './toolCall';
import { createTransactionModel } from './transaction';
import { createUserModel } from './user';

/**
 * Creates all database models for all collections
 */
export function createModels(mongoose: typeof import('mongoose')) {
  return {
    User: createUserModel(mongoose),
    Token: createTokenModel(mongoose),
    Session: createSessionModel(mongoose),
    Balance: createBalanceModel(mongoose),
    Conversation: createConversationModel(mongoose),
    ConversationHistory: createConversationHistoryModel(mongoose),
    Message: createMessageModel(mongoose),
    Agent: createAgentModel(mongoose),
    AgentCategory: createAgentCategoryModel(mongoose),
    MCPServer: createMCPServerModel(mongoose),
    Role: createRoleModel(mongoose),
    Action: createActionModel(mongoose),
    Assistant: createAssistantModel(mongoose),
    File: createFileModel(mongoose),
    Banner: createBannerModel(mongoose),
    Project: createProjectModel(mongoose),
    Key: createKeyModel(mongoose),
    PluginAuth: createPluginAuthModel(mongoose),
    Transaction: createTransactionModel(mongoose),
    Preset: createPresetModel(mongoose),
    Prompt: createPromptModel(mongoose),
    PromptGroup: createPromptGroupModel(mongoose),
    ConversationTag: createConversationTagModel(mongoose),
    SharedLink: createSharedLinkModel(mongoose),
    ToolCall: createToolCallModel(mongoose),
    MemoryEntry: createMemoryModel(mongoose),
    AccessRole: createAccessRoleModel(mongoose),
    AclEntry: createAclEntryModel(mongoose),
    Group: createGroupModel(mongoose),
  };
}
