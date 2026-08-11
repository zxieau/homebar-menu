const test = require("node:test");
const assert = require("node:assert/strict");
const { deleteAllOrders } = require("./closeBar.js");

function createCollection(initialDocuments, { partialDelete = false } = {}) {
  const documents = [...initialDocuments];
  return {
    limit(limit) {
      return {
        async get() {
          return { data: documents.slice(0, limit) };
        }
      };
    },
    where(query) {
      const ids = query._id.values;
      return {
        async remove() {
          const targetIds = partialDelete ? ids.slice(0, 1) : ids;
          let deleted = 0;
          for (const id of targetIds) {
            const index = documents.findIndex((item) => item._id === id);
            if (index >= 0) {
              documents.splice(index, 1);
              deleted += 1;
            }
          }
          return { deleted };
        }
      };
    },
    remaining() {
      return documents.length;
    }
  };
}

const command = {
  in(values) {
    return { values };
  }
};

test("close bar deletes every order in bounded batches", async () => {
  const collection = createCollection(Array.from({ length: 7 }, (_, index) => ({ _id: `order-${index}` })));
  const result = await deleteAllOrders(collection, command, { batchSize: 3 });
  assert.deepEqual(result, { deleted: 7, remaining: 0 });
  assert.equal(collection.remaining(), 0);
});

test("close bar is idempotent when the collection is empty", async () => {
  const collection = createCollection([]);
  const result = await deleteAllOrders(collection, command);
  assert.deepEqual(result, { deleted: 0, remaining: 0 });
});

test("close bar reports a partial delete instead of claiming success", async () => {
  const collection = createCollection([{ _id: "a" }, { _id: "b" }], { partialDelete: true });
  await assert.rejects(() => deleteAllOrders(collection, command), /只删除了 1\/2 条/);
  assert.equal(collection.remaining(), 1);
});
