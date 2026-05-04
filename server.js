const { createServer } = require("node:http");

const next = require("next");

const port = Number.parseInt(process.env.PORT || "3000", 10);
const hostname = process.env.BIND_HOST || process.env.HOST || "0.0.0.0";
const app = next({ dev: false, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((request, response) => {
    handle(request, response);
  }).listen(port, hostname, () => {
    console.log(`Vortex ready on http://${hostname}:${port}`);
  });
});
