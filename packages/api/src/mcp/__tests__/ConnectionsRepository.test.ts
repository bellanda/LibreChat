import { logger } from '@librechat/data-schemas';
import { ConnectionsRepository } from '../ConnectionsRepository';
import { MCPConnectionFactory } from '../MCPConnectionFactory';
import { MCPConnection } from '../connection';
import type * as t from '../types';

// Mock external dependencies
jest.mock('@librechat/data-schemas', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
  },
}));

jest.mock('../MCPConnectionFactory', () => ({
  MCPConnectionFactory: {
    create: jest.fn(),
  },
}));

jest.mock('../connection');

jest.mock('~/mcp/registry/MCPServersRegistry', () => ({
  mcpServersRegistry: {
    getServerConfig: jest.fn(),
    getAllServerConfigs: jest.fn(),
  },
}));

const mockLogger = logger as jest.Mocked<typeof logger>;
const { mcpServersRegistry } = jest.requireMock('~/mcp/registry/MCPServersRegistry');

describe('ConnectionsRepository', () => {
  let repository: ConnectionsRepository;
  let mockServerConfigs: Record<string, t.ParsedServerConfig>;
  let mockConnection: jest.Mocked<MCPConnection>;

  beforeEach(() => {
    mockServerConfigs = {
      server1: { url: 'http://localhost:3001' } as t.ParsedServerConfig,
      server2: { command: 'test-command', args: ['--test'] } as t.ParsedServerConfig,
      server3: { url: 'ws://localhost:8080', type: 'websocket' } as t.ParsedServerConfig,
    };

    mockConnection = {
      isConnected: jest.fn().mockResolvedValue(true),
      disconnect: jest.fn().mockResolvedValue(undefined),
      isStale: jest.fn().mockReturnValue(false),
      createdAt: Date.now(),
    } as unknown as jest.Mocked<MCPConnection>;

    (MCPConnectionFactory.create as jest.Mock).mockResolvedValue(mockConnection);

    (mcpServersRegistry.getServerConfig as jest.Mock).mockImplementation(
      (serverName: string) => Promise.resolve(mockServerConfigs[serverName]),
    );
    (mcpServersRegistry.getAllServerConfigs as jest.Mock).mockResolvedValue(mockServerConfigs);

    repository = new ConnectionsRepository(undefined);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('has', () => {
    it('should return true for existing server', async () => {
      expect(await repository.has('server1')).toBe(true);
    });

    it('should return false for non-existing server', async () => {
      (mcpServersRegistry.getServerConfig as jest.Mock).mockResolvedValue(undefined);
      expect(await repository.has('nonexistent')).toBe(false);
    });
  });

  describe('get', () => {
    it('should return existing connected connection', async () => {
      mockConnection.isConnected.mockResolvedValue(true);
      repository['connections'].set('server1', mockConnection);

      const result = await repository.get('server1');

      expect(result).toBe(mockConnection);
      expect(MCPConnectionFactory.create).not.toHaveBeenCalled();
    });

    it('should create new connection if none exists', async () => {
      const result = await repository.get('server1');

      expect(result).toBe(mockConnection);
      expect(MCPConnectionFactory.create).toHaveBeenCalledWith(
        {
          serverName: 'server1',
          serverConfig: mockServerConfigs.server1,
        },
        undefined,
      );
      expect(repository['connections'].get('server1')).toBe(mockConnection);
    });

    it('should create new connection if existing connection is not connected', async () => {
      const oldConnection = {
        isConnected: jest.fn().mockResolvedValue(false),
        disconnect: jest.fn().mockResolvedValue(undefined),
        isStale: jest.fn().mockReturnValue(false),
        createdAt: Date.now(),
      } as unknown as jest.Mocked<MCPConnection>;
      repository['connections'].set('server1', oldConnection);

      const result = await repository.get('server1');

      expect(result).toBe(mockConnection);
      expect(oldConnection.disconnect).toHaveBeenCalled();
      expect(MCPConnectionFactory.create).toHaveBeenCalledWith(
        {
          serverName: 'server1',
          serverConfig: mockServerConfigs.server1,
        },
        undefined,
      );
    });

    it('should return null for non-existent server configuration', async () => {
      (mcpServersRegistry.getServerConfig as jest.Mock).mockResolvedValue(undefined);
      const result = await repository.get('nonexistent');
      expect(result).toBeNull();
    });

    it('should handle MCPConnectionFactory.create errors', async () => {
      const createError = new Error('Connection creation failed');
      (MCPConnectionFactory.create as jest.Mock).mockRejectedValue(createError);

      await expect(repository.get('server1')).rejects.toThrow('Connection creation failed');
    });
  });

  describe('getMany', () => {
    it('should return connections for multiple servers', async () => {
      const result = await repository.getMany(['server1', 'server3']);

      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(2);
      expect(result.get('server1')).toBe(mockConnection);
      expect(result.get('server3')).toBe(mockConnection);
    });
  });

  describe('getLoaded', () => {
    it('should return connections for loaded servers only', async () => {
      await repository.get('server1');

      const result = await repository.getLoaded();

      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(1);
      expect(result.get('server1')).toBe(mockConnection);
    });

    it('should return empty map when no connections are loaded', async () => {
      const result = await repository.getLoaded();

      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(0);
    });
  });

  describe('getAll', () => {
    it('should return connections for all configured servers', async () => {
      const result = await repository.getAll();

      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(3);
      expect(result.get('server1')).toBe(mockConnection);
      expect(result.get('server2')).toBe(mockConnection);
      expect(result.get('server3')).toBe(mockConnection);
    });
  });

  describe('disconnect', () => {
    it('should disconnect and remove existing connection', async () => {
      repository['connections'].set('server1', mockConnection);

      await repository.disconnect('server1');

      expect(mockConnection.disconnect).toHaveBeenCalled();
      expect(repository['connections'].has('server1')).toBe(false);
    });

    it('should handle disconnect error gracefully', async () => {
      const disconnectError = new Error('Disconnect failed');
      mockConnection.disconnect.mockRejectedValue(disconnectError);
      repository['connections'].set('server1', mockConnection);

      await repository.disconnect('server1');

      expect(mockConnection.disconnect).toHaveBeenCalled();
      expect(repository['connections'].has('server1')).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith(
        '[MCP][server1] Error disconnecting',
        disconnectError,
      );
    });
  });

  describe('disconnectAll', () => {
    it('should disconnect all active connections', () => {
      const mockConnection1 = {
        disconnect: jest.fn().mockResolvedValue(undefined),
      } as unknown as jest.Mocked<MCPConnection>;
      const mockConnection2 = {
        disconnect: jest.fn().mockResolvedValue(undefined),
      } as unknown as jest.Mocked<MCPConnection>;
      const mockConnection3 = {
        disconnect: jest.fn().mockResolvedValue(undefined),
      } as unknown as jest.Mocked<MCPConnection>;

      repository['connections'].set('server1', mockConnection1);
      repository['connections'].set('server2', mockConnection2);
      repository['connections'].set('server3', mockConnection3);

      const promises = repository.disconnectAll();

      expect(promises).toHaveLength(3);
      expect(Array.isArray(promises)).toBe(true);
    });
  });
});
