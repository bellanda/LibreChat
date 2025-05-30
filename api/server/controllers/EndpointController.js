const { getEndpointsConfig } = require('~/server/services/Config');
const groupPermissionService = require('~/server/services/GroupPermissionService');

async function endpointController(req, res) {
  try {
    const endpointsConfig = await getEndpointsConfig(req);
    const userGroup = req.user?.userGroup || 'default';

    // Filter endpoints based on user group permissions
    const filteredEndpointsConfig = groupPermissionService.filterEndpointsForUser(
      userGroup,
      endpointsConfig,
    );

    res.send(JSON.stringify(filteredEndpointsConfig));
  } catch (error) {
    console.error('Error in endpointController:', error);
    res.status(500).send({ error: error.message });
  }
}

module.exports = endpointController;
