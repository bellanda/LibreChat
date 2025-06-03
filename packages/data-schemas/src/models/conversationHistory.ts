import conversationHistorySchema, { IConversationHistory } from '~/schema/conversationHistory';

/**
 * Creates or returns the ConversationHistory model using the provided mongoose instance and schema
 */
export function createConversationHistoryModel(mongoose: typeof import('mongoose')) {
  return (
    mongoose.models.ConversationHistory ||
    mongoose.model<IConversationHistory>('ConversationHistory', conversationHistorySchema)
  );
}
