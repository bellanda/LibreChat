/**
 * Resets _meiliIndex flags on a collection so documents will be re-indexed in MeiliSearch.
 * Used when MeiliSearch data has been deleted or corrupted and a full re-sync is needed.
 * @param {import('mongoose').mongo.Collection} collection - MongoDB collection (e.g. messages, conversations)
 * @returns {Promise<number>} - Number of documents whose flag was reset
 */
async function batchResetMeiliFlags(collection) {
  const result = await collection.updateMany(
    { _meiliIndex: true },
    { $set: { _meiliIndex: false } },
  );
  return result.modifiedCount ?? 0;
}

module.exports = { batchResetMeiliFlags };
