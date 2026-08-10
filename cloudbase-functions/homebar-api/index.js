const cloudbase = require("@cloudbase/node-sdk");
const crypto = require("crypto");
const { deleteAllOrders } = require("./closeBar.js");

const app = cloudbase.init({ env: cloudbase.SYMBOL_CURRENT_ENV });
const db = app.database();
const functionName = process.env.SCF_FUNCTIONNAME || process.env.TENCENTCLOUD_RUNENV || "";
const ordersCollectionName = process.env.ORDERS_COLLECTION || (functionName.includes("homebar-api-qa") ? "homebar_orders_qa" : "homebar_orders");
const orders = db.collection(ordersCollectionName);
const allowedStatuses = new Set(["queued", "mixing", "served", "cancelled"]);
const adminPinHash = "a3989830416a74226f2b3156f4a722b02357d43454305a3512f43cb944c66b8b";

function json(statusCode, data) {
  return {
    statusCode,
    isBase64Encoded: false,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    },
    body: JSON.stringify(data)
  };
}

function parseBody(event) {
  if (!event.body) return {};
  try {
    return typeof event.body === "string" ? JSON.parse(event.body) : event.body;
  } catch {
    return {};
  }
}

function header(event, name) {
  const headers = event.headers || {};
  const key = Object.keys(headers).find((item) => item.toLowerCase() === name.toLowerCase());
  return key ? String(headers[key]) : "";
}

function isAdmin(event) {
  const provided = header(event, "x-admin-pin");
  if (!provided) return false;
  const digest = crypto.createHash("sha256").update(provided).digest("hex");
  const left = Buffer.from(digest);
  const right = Buffer.from(adminPinHash);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function normalize(document) {
  if (!document) return document;
  const { _id, ...rest } = document;
  return { id: _id, ...rest };
}

function pathOf(event) {
  const raw = event.path || event.requestContext?.path || "/";
  // QA 与正式函数共用同一套路由；必须先匹配较长的 QA 前缀。
  const marker = raw.includes("/homebar-api-qa") ? "/homebar-api-qa" : "/homebar-api";
  const index = raw.indexOf(marker);
  const trimmed = index >= 0 ? raw.slice(index + marker.length) : raw;
  return trimmed || "/";
}

function queryOf(event) {
  if (event.queryStringParameters) return event.queryStringParameters;
  const result = {};
  new URLSearchParams(event.rawQueryString || "").forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

async function listOrders(event) {
  const { data = [] } = await orders.orderBy("created_at", "desc").limit(200).get();
  const ids = String(queryOf(event).ids || "").split(",").filter(Boolean);
  const filtered = ids.length ? data.filter((item) => ids.includes(item._id)) : data;
  return json(200, { data: filtered.map(normalize) });
}

async function createOrder(event) {
  const body = parseBody(event);
  const items = Array.isArray(body.items) ? body.items.slice(0, 30) : [];
  if (!items.length) return json(400, { error: "订单里还没有内容" });

  const requestId = String(body.client_request_id || "").slice(0, 80);
  if (requestId) {
    const { data: existing = [] } = await orders.where({ client_request_id: requestId }).limit(1).get();
    if (existing[0]) return json(200, { data: normalize(existing[0]) });
  }

  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const document = {
    _id: id,
    ticket_no: Number(`${Date.now()}`.slice(-6)),
    guest_name: String(body.guest_name || "Guest").trim().slice(0, 40) || "Guest",
    guest_id: String(body.guest_id || "").slice(0, 40),
    status: "queued",
    items,
    client_request_id: requestId,
    created_at: now,
    updated_at: now
  };
  await orders.add(document);
  return json(201, { data: normalize(document) });
}

async function updateOrder(event, orderId) {
  if (!isAdmin(event)) return json(403, { error: "后台 PIN 校验失败" });
  const body = parseBody(event);
  if (!allowedStatuses.has(body.status)) return json(400, { error: "订单状态无效" });
  await orders.doc(orderId).update({ status: body.status, updated_at: new Date().toISOString() });
  const { data = [] } = await orders.doc(orderId).get();
  if (!data[0]) return json(404, { error: "没有找到这张小票" });
  return json(200, { data: normalize(data[0]) });
}

async function closeBar(event) {
  if (!isAdmin(event)) return json(403, { error: "后台 PIN 校验失败" });
  try {
    const result = await deleteAllOrders(orders, db.command);
    if (result.remaining > 0) {
      return json(500, {
        error: "订单未完全清空，请重试",
        data: result
      });
    }
    return json(200, { data: result });
  } catch (error) {
    console.error("close-bar", error);
    return json(500, {
      error: error.message || "打烊清单失败，请稍后重试",
      data: {
        deleted: Number(error.deleted || 0),
        remaining: -1
      },
      requestId: error.requestId || error.request_id || ""
    });
  }
}

exports.main = async (event) => {
  const method = String(event.httpMethod || event.requestContext?.httpMethod || "GET").toUpperCase();
  if (method === "OPTIONS") return json(204, {});

  try {
    const path = pathOf(event);
    if (method === "GET" && (path === "/" || path === "/health")) {
      return json(200, { data: { ok: true, service: "homebar-api", collection: ordersCollectionName } });
    }
    if (method === "GET" && path === "/orders") return listOrders(event);
    if (method === "POST" && path === "/orders") return createOrder(event);
    if (method === "DELETE" && path === "/orders") return closeBar(event);

    const match = path.match(/^\/orders\/([^/]+)$/);
    if (method === "PATCH" && match) return updateOrder(event, decodeURIComponent(match[1]));
    return json(404, { error: "Not found" });
  } catch (error) {
    console.error("homebar-api", error);
    return json(500, { error: "吧台订单服务暂时开小差，请稍后重试" });
  }
};
