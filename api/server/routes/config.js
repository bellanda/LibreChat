const express = require('express');
const { logger } = require('@librechat/data-schemas');
const { isEnabled, getBalanceConfig } = require('@librechat/api');
const {
  Constants,
  CacheKeys,
  removeNullishValues,
  defaultSocialLogins,
} = require('librechat-data-provider');
const { getLdapConfig } = require('~/server/services/Config/ldap');
const { getAppConfig } = require('~/server/services/Config/app');
const { getProjectByName } = require('~/models/Project');
const { getMCPManager } = require('~/config');
const { getLogStores } = require('~/cache');
const { mcpServersRegistry } = require('@librechat/api');
const { getCachedGroupsConfig } = require('~/server/middleware/groupsMiddleware');
const { filterMcpServersByGroup } = require('~/server/services/Config/GroupsService');
const optionalJwtAuth = require('~/server/middleware/optionalJwtAuth');

const router = express.Router();
const emailLoginEnabled =
  process.env.ALLOW_EMAIL_LOGIN === undefined || isEnabled(process.env.ALLOW_EMAIL_LOGIN);
const passwordResetEnabled = isEnabled(process.env.ALLOW_PASSWORD_RESET);

const sharedLinksEnabled =
  process.env.ALLOW_SHARED_LINKS === undefined || isEnabled(process.env.ALLOW_SHARED_LINKS);

const publicSharedLinksEnabled =
  sharedLinksEnabled &&
  (process.env.ALLOW_SHARED_LINKS_PUBLIC === undefined ||
    isEnabled(process.env.ALLOW_SHARED_LINKS_PUBLIC));

const sharePointFilePickerEnabled = isEnabled(process.env.ENABLE_SHAREPOINT_FILEPICKER);
const openidReuseTokens = isEnabled(process.env.OPENID_REUSE_TOKENS);

const applyMcpFiltering = async (config, user) => {
  if (!config?.mcpServers) {
    return config;
  }

  const groupsConfig = await getCachedGroupsConfig();
  const filteredServers = filterMcpServersByGroup(config.mcpServers, user, groupsConfig);

  if (filteredServers === config.mcpServers) {
    return config;
  }

  return {
    ...config,
    mcpServers: filteredServers,
  };
};

/**
 * Fetches MCP servers from registry and adds them to the payload.
 * Uses appConfig definitions as the source of truth while enriching with registry data.
 */
const populateMcpServers = async (payload, appConfig) => {
  try {
    if (appConfig?.mcpConfig == null) {
      return;
    }

    const mcpManager = getMCPManager();
    if (!mcpManager) {
      return;
    }

    const registryServers = (await mcpServersRegistry.getAllServerConfigs()) ?? {};
    const configuredServerNames = Object.keys(appConfig.mcpConfig);
    const serverNames =
      configuredServerNames.length > 0 ? configuredServerNames : Object.keys(registryServers);

    if (serverNames.length === 0) {
      return;
    }

    for (const serverName of serverNames) {
      if (!payload.mcpServers) {
        payload.mcpServers = {};
      }

      const serverConfig = registryServers[serverName];
      const appServerConfig = appConfig.mcpConfig[serverName];

      payload.mcpServers[serverName] = removeNullishValues({
        startup: serverConfig?.startup ?? appServerConfig?.startup,
        chatMenu: serverConfig?.chatMenu ?? appServerConfig?.chatMenu,
        isOAuth: serverConfig?.requiresOAuth ?? appServerConfig?.requiresOAuth ?? false,
        customUserVars: serverConfig?.customUserVars ?? appServerConfig?.customUserVars,
      });
    }
  } catch (error) {
    logger.error('Error loading MCP servers', error);
  }
};

router.get('/', optionalJwtAuth, async function (req, res) {
  const cache = getLogStores(CacheKeys.CONFIG_STORE);

  const cachedStartupConfig = await cache.get(CacheKeys.STARTUP_CONFIG);
  if (cachedStartupConfig) {
    const payload = {
      ...cachedStartupConfig,
      mcpServers: cachedStartupConfig.mcpServers
        ? { ...cachedStartupConfig.mcpServers }
        : undefined,
    };
    const appConfig = await getAppConfig({ role: req.user?.role });
    await populateMcpServers(payload, appConfig);
    const responsePayload = await applyMcpFiltering(payload, req.user);
    res.send(responsePayload);
    return;
  }

  const isBirthday = () => {
    const today = new Date();
    return today.getMonth() === 1 && today.getDate() === 11;
  };

  const instanceProject = await getProjectByName(Constants.GLOBAL_PROJECT_NAME, '_id');

  const ldap = getLdapConfig();

  try {
    const appConfig = await getAppConfig({ role: req.user?.role });

    const isOpenIdEnabled =
      !!process.env.OPENID_CLIENT_ID &&
      !!process.env.OPENID_CLIENT_SECRET &&
      !!process.env.OPENID_ISSUER &&
      !!process.env.OPENID_SESSION_SECRET;

    const isSamlEnabled =
      !!process.env.SAML_ENTRY_POINT &&
      !!process.env.SAML_ISSUER &&
      !!process.env.SAML_CERT &&
      !!process.env.SAML_SESSION_SECRET;

    const balanceConfig = getBalanceConfig(appConfig);

    /** @type {TStartupConfig} */
    const payload = {
      appTitle: process.env.APP_TITLE || 'LibreChat',
      socialLogins: appConfig?.registration?.socialLogins ?? defaultSocialLogins,
      discordLoginEnabled: !!process.env.DISCORD_CLIENT_ID && !!process.env.DISCORD_CLIENT_SECRET,
      facebookLoginEnabled:
        !!process.env.FACEBOOK_CLIENT_ID && !!process.env.FACEBOOK_CLIENT_SECRET,
      githubLoginEnabled: !!process.env.GITHUB_CLIENT_ID && !!process.env.GITHUB_CLIENT_SECRET,
      googleLoginEnabled: !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET,
      appleLoginEnabled:
        !!process.env.APPLE_CLIENT_ID &&
        !!process.env.APPLE_TEAM_ID &&
        !!process.env.APPLE_KEY_ID &&
        !!process.env.APPLE_PRIVATE_KEY_PATH,
      openidLoginEnabled: isOpenIdEnabled,
      openidLabel: process.env.OPENID_BUTTON_LABEL || 'Continue with OpenID',
      openidImageUrl: process.env.OPENID_IMAGE_URL,
      openidAutoRedirect: isEnabled(process.env.OPENID_AUTO_REDIRECT),
      samlLoginEnabled: !isOpenIdEnabled && isSamlEnabled,
      samlLabel: process.env.SAML_BUTTON_LABEL,
      samlImageUrl: process.env.SAML_IMAGE_URL,
      serverDomain: process.env.DOMAIN_SERVER || 'http://localhost:3080',
      emailLoginEnabled,
      registrationEnabled: !ldap?.enabled && isEnabled(process.env.ALLOW_REGISTRATION),
      socialLoginEnabled: isEnabled(process.env.ALLOW_SOCIAL_LOGIN),
      emailEnabled:
        (!!process.env.EMAIL_SERVICE || !!process.env.EMAIL_HOST) &&
        !!process.env.EMAIL_USERNAME &&
        !!process.env.EMAIL_PASSWORD &&
        !!process.env.EMAIL_FROM,
      passwordResetEnabled,
      showBirthdayIcon:
        isBirthday() ||
        isEnabled(process.env.SHOW_BIRTHDAY_ICON) ||
        process.env.SHOW_BIRTHDAY_ICON === '',
      helpAndFaqURL: process.env.HELP_AND_FAQ_URL || 'https://librechat.ai',
      interface: appConfig?.interfaceConfig,
      turnstile: appConfig?.turnstileConfig,
      modelSpecs: appConfig?.modelSpecs,
      balance: balanceConfig,
      pythonToolsApiUrl: process.env.PYTHON_TOOLS_API_URL || 'http://localhost:15785',
      sharedLinksEnabled,
      publicSharedLinksEnabled,
      analyticsGtmId: process.env.ANALYTICS_GTM_ID,
      instanceProjectId: instanceProject._id.toString(),
      bundlerURL: process.env.SANDPACK_BUNDLER_URL,
      staticBundlerURL: process.env.SANDPACK_STATIC_BUNDLER_URL,
      sharePointFilePickerEnabled,
      sharePointBaseUrl: process.env.SHAREPOINT_BASE_URL,
      sharePointPickerGraphScope: process.env.SHAREPOINT_PICKER_GRAPH_SCOPE,
      sharePointPickerSharePointScope: process.env.SHAREPOINT_PICKER_SHAREPOINT_SCOPE,
      openidReuseTokens,
      conversationImportMaxFileSize: process.env.CONVERSATION_IMPORT_MAX_FILE_SIZE_BYTES
        ? parseInt(process.env.CONVERSATION_IMPORT_MAX_FILE_SIZE_BYTES, 10)
        : 0,
    };

    const minPasswordLength = parseInt(process.env.MIN_PASSWORD_LENGTH, 10);
    if (minPasswordLength && !isNaN(minPasswordLength)) {
      payload.minPasswordLength = minPasswordLength;
    }

    await populateMcpServers(payload, appConfig);
    const webSearchConfig = appConfig?.webSearch;
    if (
      webSearchConfig != null &&
      (webSearchConfig.searchProvider ||
        webSearchConfig.scraperProvider ||
        webSearchConfig.rerankerType)
    ) {
      payload.webSearch = {};
    }

    if (webSearchConfig?.searchProvider) {
      payload.webSearch.searchProvider = webSearchConfig.searchProvider;
    }
    if (webSearchConfig?.scraperProvider) {
      payload.webSearch.scraperProvider = webSearchConfig.scraperProvider;
    }
    if (webSearchConfig?.rerankerType) {
      payload.webSearch.rerankerType = webSearchConfig.rerankerType;
    }

    if (ldap) {
      payload.ldap = ldap;
    }

    if (typeof process.env.CUSTOM_FOOTER === 'string') {
      payload.customFooter = process.env.CUSTOM_FOOTER;
    }

    const responsePayload = await applyMcpFiltering(payload, req.user);
    await cache.set(CacheKeys.STARTUP_CONFIG, payload);
    return res.status(200).send(responsePayload);
  } catch (err) {
    logger.error('Error in startup config', err);
    return res.status(500).send({ error: err.message });
  }
});

module.exports = router;
