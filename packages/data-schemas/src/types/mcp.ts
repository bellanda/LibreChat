import type { Document, Types } from 'mongoose';
import type { MCPOptions } from 'librechat-data-provider';

export interface IMCPServer {
  serverName: string;
  config: MCPOptions;
  author?: Types.ObjectId | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type MCPServerDocument = Document & IMCPServer;
