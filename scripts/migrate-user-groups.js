const mongoose = require('mongoose');
const User = require('../api/models/User');
const { logger } = require('../api/config');

/**
 * Migration script to add userGroup field to existing users
 * This script will set all existing users to the 'default' group
 */
async function migrateUserGroups() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/LibreChat';
    await mongoose.connect(mongoUri);
    logger.info('Connected to MongoDB for user group migration');

    // Find all users without userGroup field
    const usersWithoutGroup = await User.find({
      $or: [{ userGroup: { $exists: false } }, { userGroup: null }, { userGroup: '' }],
    });

    logger.info(`Found ${usersWithoutGroup.length} users without userGroup field`);

    if (usersWithoutGroup.length === 0) {
      logger.info('All users already have userGroup field assigned');
      return;
    }

    // Update users to have default group
    const updateResult = await User.updateMany(
      {
        $or: [{ userGroup: { $exists: false } }, { userGroup: null }, { userGroup: '' }],
      },
      {
        $set: { userGroup: 'default' },
      },
    );

    logger.info(`Successfully updated ${updateResult.modifiedCount} users with default group`);

    // Verify the migration
    const usersStillWithoutGroup = await User.countDocuments({
      $or: [{ userGroup: { $exists: false } }, { userGroup: null }, { userGroup: '' }],
    });

    if (usersStillWithoutGroup === 0) {
      logger.info('Migration completed successfully - all users now have userGroup field');
    } else {
      logger.warn(`Migration incomplete - ${usersStillWithoutGroup} users still without userGroup`);
    }
  } catch (error) {
    logger.error('Error during user group migration:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  }
}

/**
 * Function to assign a specific group to a user by email
 * @param {string} email - User email
 * @param {string} group - Group name to assign
 */
async function assignUserToGroup(email, group) {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/LibreChat';
    await mongoose.connect(mongoUri);

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      logger.error(`User with email ${email} not found`);
      return false;
    }

    user.userGroup = group;
    await user.save();

    logger.info(`Successfully assigned user ${email} to group ${group}`);
    return true;
  } catch (error) {
    logger.error(`Error assigning user ${email} to group ${group}:`, error);
    return false;
  } finally {
    await mongoose.disconnect();
  }
}

/**
 * Function to list all users and their groups
 */
async function listUserGroups() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/LibreChat';
    await mongoose.connect(mongoUri);

    const users = await User.find({}, 'email userGroup name').sort({ email: 1 });

    console.log('\n=== User Groups ===');
    console.log('Email\t\t\t\tGroup\t\tName');
    console.log('-----------------------------------------------------------');

    users.forEach((user) => {
      const email = user.email.padEnd(30);
      const group = (user.userGroup || 'default').padEnd(15);
      const name = user.name || 'N/A';
      console.log(`${email}\t${group}\t${name}`);
    });

    console.log(`\nTotal users: ${users.length}`);

    // Group statistics
    const groupStats = await User.aggregate([
      {
        $group: {
          _id: '$userGroup',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    console.log('\n=== Group Statistics ===');
    groupStats.forEach((stat) => {
      console.log(`${stat._id || 'default'}: ${stat.count} users`);
    });
  } catch (error) {
    logger.error('Error listing user groups:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Command line interface
if (require.main === module) {
  const command = process.argv[2];
  const email = process.argv[3];
  const group = process.argv[4];

  switch (command) {
    case 'migrate':
      migrateUserGroups()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;

    case 'assign':
      if (!email || !group) {
        console.error('Usage: node migrate-user-groups.js assign <email> <group>');
        process.exit(1);
      }
      assignUserToGroup(email, group)
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;

    case 'list':
      listUserGroups()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;

    default:
      console.log('Usage:');
      console.log(
        '  node migrate-user-groups.js migrate          - Add userGroup field to all existing users',
      );
      console.log(
        '  node migrate-user-groups.js assign <email> <group> - Assign specific user to group',
      );
      console.log(
        '  node migrate-user-groups.js list             - List all users and their groups',
      );
      process.exit(1);
  }
}

module.exports = {
  migrateUserGroups,
  assignUserToGroup,
  listUserGroups,
};
