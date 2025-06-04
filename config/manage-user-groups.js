const path = require('path');
const mongoose = require(path.resolve(__dirname, '..', 'api', 'node_modules', 'mongoose'));
const { User } = require('@librechat/data-schemas').createModels(mongoose);
const { loadGroupsConfig } = require('../api/server/services/Config/GroupsService');
require('module-alias')({ base: path.resolve(__dirname, '..', 'api') });
const connect = require('./connect');

/**
 * Display available groups from the configuration
 */
async function showAvailableGroups() {
  try {
    const groupsConfig = await loadGroupsConfig();
    console.log('\nAvailable Groups:');
    console.log('================');

    for (const [groupId, groupData] of Object.entries(groupsConfig.groups)) {
      console.log(`ID: ${groupId}`);
      console.log(`Name: ${groupData.name}`);
      console.log(`Description: ${groupData.description}`);
      console.log(`Endpoints: ${groupData.permissions.endpoints.join(', ')}`);
      console.log(`Models: ${JSON.stringify(groupData.permissions.models, null, 2)}`);
      console.log(`Assistants: ${groupData.permissions.assistants}`);
      console.log(`Plugins: ${groupData.permissions.plugins.join(', ')}`);
      console.log('---');
    }

    console.log(`Default Group: ${groupsConfig.defaultGroup}`);
  } catch (error) {
    console.error('Error loading groups configuration:', error);
  }
}

/**
 * List all users with their current groups
 */
async function listUsersWithGroups() {
  try {
    await connect();
    const users = await User.find({}, 'email name group createdAt').lean();

    console.log('\nUsers and their Groups:');
    console.log('======================');

    users.forEach((user) => {
      console.log(`Email: ${user.email}`);
      console.log(`Name: ${user.name || 'N/A'}`);
      console.log(`Group: ${user.group || 'default'}`);
      console.log(`Created: ${user.createdAt}`);
      console.log('---');
    });

    console.log(`\nTotal Users: ${users.length}`);
  } catch (error) {
    console.error('Error listing users:', error);
  }
}

/**
 * Update a user's group
 */
async function updateUserGroup(email, newGroup) {
  try {
    await connect();

    // Validate that the group exists
    const groupsConfig = await loadGroupsConfig();
    if (!groupsConfig.groups[newGroup]) {
      console.error(`Error: Group '${newGroup}' does not exist.`);
      console.log('\nAvailable groups:');
      Object.keys(groupsConfig.groups).forEach((group) => {
        console.log(`- ${group}`);
      });
      return;
    }

    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { group: newGroup },
      { new: true },
    );

    if (!user) {
      console.error(`User with email '${email}' not found.`);
      return;
    }

    console.log(`Successfully updated user '${email}' to group '${newGroup}'`);
  } catch (error) {
    console.error('Error updating user group:', error);
  }
}

/**
 * Bulk update users to a specific group based on email patterns
 */
async function bulkUpdateUserGroup(emailPattern, newGroup) {
  try {
    await connect();

    // Validate that the group exists
    const groupsConfig = await loadGroupsConfig();
    if (!groupsConfig.groups[newGroup]) {
      console.error(`Error: Group '${newGroup}' does not exist.`);
      return;
    }

    const regex = new RegExp(emailPattern, 'i');
    const result = await User.updateMany({ email: { $regex: regex } }, { group: newGroup });

    console.log(`Successfully updated ${result.modifiedCount} users to group '${newGroup}'`);
  } catch (error) {
    console.error('Error bulk updating user groups:', error);
  }
}

/**
 * Main function to handle command line arguments
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case 'list-groups':
        await showAvailableGroups();
        break;

      case 'list-users':
        await listUsersWithGroups();
        break;

      case 'update-user':
        if (args.length < 3) {
          console.log('Usage: node manage-user-groups.js update-user <email> <group>');
          return;
        }
        await updateUserGroup(args[1], args[2]);
        break;

      case 'bulk-update':
        if (args.length < 3) {
          console.log('Usage: node manage-user-groups.js bulk-update <email-pattern> <group>');
          console.log('Example: node manage-user-groups.js bulk-update "@company.com" premium');
          return;
        }
        await bulkUpdateUserGroup(args[1], args[2]);
        break;

      default:
        console.log('LibreChat User Groups Manager');
        console.log('============================');
        console.log('');
        console.log('Available commands:');
        console.log(
          '  list-groups                           - Show available groups from configuration',
        );
        console.log(
          '  list-users                            - List all users with their current groups',
        );
        console.log("  update-user <email> <group>           - Update a specific user's group");
        console.log(
          '  bulk-update <email-pattern> <group>   - Update multiple users based on email pattern',
        );
        console.log('');
        console.log('Examples:');
        console.log('  node manage-user-groups.js list-groups');
        console.log('  node manage-user-groups.js update-user user@example.com premium');
        console.log('  node manage-user-groups.js bulk-update "@company.com" premium');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  process.exit(0);
});

main();
