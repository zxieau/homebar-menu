const DEFAULT_BATCH_SIZE = 100;
const DEFAULT_MAX_ROUNDS = 100;

async function deleteAllOrders(collection, command, options = {}) {
  const batchSize = options.batchSize || DEFAULT_BATCH_SIZE;
  const maxRounds = options.maxRounds || DEFAULT_MAX_ROUNDS;
  let deleted = 0;

  for (let round = 0; round < maxRounds; round += 1) {
    const { data = [] } = await collection.limit(batchSize).get();
    const ids = data.map((item) => item._id).filter(Boolean);
    if (!ids.length) break;

    const result = await collection.where({ _id: command.in(ids) }).remove();
    const count = Number(result.deleted || 0);
    deleted += count;

    if (count !== ids.length) {
      const error = new Error(`订单只删除了 ${count}/${ids.length} 条`);
      error.deleted = deleted;
      throw error;
    }
  }

  const { data: remainingRows = [] } = await collection.limit(1).get();
  return { deleted, remaining: remainingRows.length };
}

module.exports = { deleteAllOrders };
