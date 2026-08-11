import test from "node:test";
import assert from "node:assert/strict";
import { isJimmyCoinItem, serializeJimmyCoin } from "./jimmyCoins.js";

test("new Jimmy Coin items use the stable jimmy-coin type", () => {
  const item = serializeJimmyCoin("j20");
  assert.equal(item.type, "jimmy-coin");
  assert.equal(item.name_zh, "吉米币");
  assert.equal(item.funny_money.amount, "20");
  assert.equal(item.remark, undefined);
});

test("unknown coin option does not create an item", () => {
  assert.equal(serializeJimmyCoin("missing"), null);
});

test("legacy bar-cash orders remain readable", () => {
  assert.equal(isJimmyCoinItem({ type: "jimmy-coin" }), true);
  assert.equal(isJimmyCoinItem({ type: "bar-cash" }), true);
  assert.equal(isJimmyCoinItem({ type: "drink" }), false);
});
