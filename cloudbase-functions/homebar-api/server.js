const http = require("http");
const { main } = require("./index.js");

const server = http.createServer(async (request, response) => {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const requestUrl = new URL(request.url, `http://${request.headers.host || "localhost"}`);

  const result = await main({
    httpMethod: request.method,
    path: requestUrl.pathname,
    rawQueryString: requestUrl.searchParams.toString(),
    headers: request.headers,
    body: Buffer.concat(chunks).toString("utf8")
  });

  response.statusCode = result.statusCode || 200;
  Object.entries(result.headers || {}).forEach(([name, value]) => response.setHeader(name, value));
  response.end(result.body || "");
});

server.listen(9000, "0.0.0.0", () => {
  console.log("homebar-api listening on 9000");
});
