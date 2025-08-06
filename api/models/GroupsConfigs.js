const mongoose = require('mongoose');

// Schema flexível para aceitar qualquer estrutura
const GroupsConfigsSchema = new mongoose.Schema({}, { 
  strict: false,
  collection: 'groupsconfigs' // Nome da collection
});

const GroupsConfigs = mongoose.model('GroupsConfigs', GroupsConfigsSchema);

module.exports = GroupsConfigs; 