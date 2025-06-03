import { Schema } from 'mongoose';
import { IConversation } from '~/types';
import { conversationPreset } from './defaults';

// Interface para o histórico de conversas (igual à IConversation mas com campos adicionais)
export interface IConversationHistory extends IConversation {
  originalConversationId: string;
  deletedAt: Date;
  deletedBy: string;
  fullMessages?: any[]; // Array completo das mensagens para preservar o histórico
}

const conversationHistorySchema: Schema<IConversationHistory> = new Schema(
  {
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
    originalConversationId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: 'New Chat',
    },
    user: {
      type: String,
      index: true,
    },
    messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }], // IDs originais (podem não existir mais)
    fullMessages: [{ type: Schema.Types.Mixed }], // Mensagens completas preservadas
    agentOptions: {
      type: Schema.Types.Mixed,
    },
    ...conversationPreset,
    agent_id: {
      type: String,
    },
    tags: {
      type: [String],
      default: [],
    },
    files: {
      type: [String],
    },
    expiredAt: {
      type: Date,
    },
    deletedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    deletedBy: {
      type: String,
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

// Índices para otimizar consultas
conversationHistorySchema.index({ originalConversationId: 1, deletedBy: 1 });
conversationHistorySchema.index({ deletedAt: 1 });

export default conversationHistorySchema;
