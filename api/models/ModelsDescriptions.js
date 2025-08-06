const mongoose = require('mongoose');

// Schema flexível para aceitar qualquer estrutura
const ModelsDescriptionsSchema = new mongoose.Schema({}, { 
  strict: false,
  collection: 'modelsdescriptions' // Nome da sua collection
});

const ModelsDescriptions = mongoose.model('ModelsDescriptions', ModelsDescriptionsSchema);

module.exports = ModelsDescriptions;