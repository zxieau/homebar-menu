const DEFAULT_CLOUDBASE_ORDER_API =
  "https://jimmysbar-d5grrbik0144c55a9-1256678114.ap-shanghai.app.tcloudbase.com/homebar-api";
const configuredApiUrl = import.meta.env.VITE_ORDER_API_URL?.trim();
const orderApiUrl = (configuredApiUrl || DEFAULT_CLOUDBASE_ORDER_API).replace(/\/$/, "");
const REQUEST_TIMEOUT_MS = 8000;

export const isOrderBackendConfigured = Boolean(orderApiUrl);
export const orderBackendName = "CloudBase";

function makeError(message, cause) {
  const error = new Error(message);
  error.cause = cause;
  return error;
}

async function requestApi(path, { method = "GET", body, adminPin, timeout = REQUEST_TIMEOUT_MS } = {}) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${orderApiUrl}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(adminPin ? { "X-Admin-Pin": adminPin } : {})
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
      cache: "no-store"
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw makeError(result.error || `订单服务返回 ${response.status}`, {
        status: response.status,
        data: result.data,
        requestId: result.requestId
      });
    }
    return result.data;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw makeError("订单服务响应超时", error);
    }
    throw error;
  } finally {
    window.clearTimeout(timer);
  }
}

export async function createOrder(payload) {
  if (orderApiUrl) {
    let lastError;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        return await requestApi("/orders", {
          method: "POST",
          body: payload,
          timeout: attempt === 0 ? 8000 : 10000
        });
      } catch (error) {
        lastError = error;
        // A validation or permission error will not improve by retrying.
        if (error?.cause?.status && error.cause.status < 500) throw error;
        if (attempt === 0) await new Promise((resolve) => window.setTimeout(resolve, 650));
      }
    }
    throw lastError || makeError("订单服务暂时不可用");
  }

  throw makeError("订单服务尚未配置");
}

export async function listOrders({ ids = [] } = {}) {
  if (orderApiUrl) {
    const query = ids.length ? `?ids=${encodeURIComponent(ids.join(","))}` : "";
    return requestApi(`/orders${query}`, { timeout: 8000 });
  }

  throw makeError("订单服务尚未配置");
}

export async function updateOrder(orderId, status, adminPin) {
  if (orderApiUrl) {
    return requestApi(`/orders/${encodeURIComponent(orderId)}`, {
      method: "PATCH",
      body: { status },
      adminPin
    });
  }

  throw makeError("订单服务尚未配置");
}

export async function clearOrders(adminPin) {
  if (orderApiUrl) {
    return requestApi("/orders", { method: "DELETE", adminPin, timeout: 12000 });
  }

  throw makeError("订单服务尚未配置");
}
