const fs = require('fs');
const path = require('path');
const { logger } = require('~/config');
const { loadGroupsConfig } = require('~/server/services/Config/GroupsService');

// Cache for groups configuration
let groupsConfigCache = null;
let configFileWatcher = null;

/**
 * Initialize file watcher for groups-config.json
 */
function initializeFileWatcher() {
  const configPath = path.resolve(process.cwd(), 'groups-config.json');

  if (!fs.existsSync(configPath)) {
    logger.warn('[GroupsMiddleware] groups-config.json not found, file watcher not initialized');
    return;
  }

  try {
    // Clear existing watcher if any
    if (configFileWatcher) {
      configFileWatcher.close();
    }

    configFileWatcher = fs.watchFile(configPath, { interval: 1000 }, async (curr, prev) => {
      if (curr.mtime !== prev.mtime) {
        logger.info('[GroupsMiddleware] Detected changes in groups-config.json, reloading...');

        try {
          // Clear cache to force reload
          groupsConfigCache = null;

          // Preload the new configuration
          groupsConfigCache = await loadGroupsConfig();

          logger.info('[GroupsMiddleware] Groups configuration reloaded successfully');
        } catch (error) {
          logger.error('[GroupsMiddleware] Error reloading groups configuration:', error);
          // Keep the old cache if reload fails
        }
      }
    });

    logger.info('[GroupsMiddleware] File watcher initialized for groups-config.json');
  } catch (error) {
    logger.error('[GroupsMiddleware] Error initializing file watcher:', error);
  }
}

/**
 * Get cached groups configuration or load it if not cached
 */
async function getCachedGroupsConfig() {
  groupsConfigCache = await loadGroupsConfig();
  return groupsConfigCache;
}

/**
 * Middleware to attach groups configuration to request
 */
const attachGroupsConfig = async (req, res, next) => {
  try {
    req.groupsConfig = await getCachedGroupsConfig();
    next();
  } catch (error) {
    logger.error('[GroupsMiddleware] Error loading groups configuration:', error);
    // Continue without groups config to avoid breaking the application
    req.groupsConfig = null;
    next();
  }
};

/**
 * Cleanup function to close file watcher
 */
function cleanup() {
  if (configFileWatcher) {
    fs.unwatchFile(path.resolve(process.cwd(), 'groups-config.json'));
    configFileWatcher = null;
    logger.info('[GroupsMiddleware] File watcher closed');
  }
}

// Initialize file watcher on module load
initializeFileWatcher();

// Handle graceful shutdown
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

module.exports = {
  attachGroupsConfig,
  getCachedGroupsConfig,
  initializeFileWatcher,
  cleanup,
};
