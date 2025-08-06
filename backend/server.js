const fs = require("fs");
const https = require("https");
const Fastify = require("fastify");
const websocketPlugin = require("@fastify/websocket");

const fastify = Fastify({
  logger: true,
  https: {
    key: fs.readFileSync("./certificates/privkey.pem"),
    cert: fs.readFileSync("./certificates/cert.pem"),
  },
});

fastify.register(websocketPlugin);

let connections = [];

fastify.get("/ws", { websocket: true }, (conn, req) => {
  conn.socket.on("message", (raw) => {
    const msg = JSON.parse(raw);
    if (msg.open) {
      connections = connections.filter(c => !(c.local === msg.open.local && c.remote === msg.open.remote));
      connections.push({ local: msg.open.local, remote: msg.open.remote, socket: conn.socket });
      for (const c of connections) {
        if (c.local === msg.open.remote && c.remote === msg.open.local) {
          c.socket.send(JSON.stringify({ start: "answer" }));
          conn.socket.send(JSON.stringify({ start: "offer" }));
        }
      }
      return;
    }

    const target = connections.find(c => c.local === msg.remote);
    if (target && target.socket.readyState === 1) {
      target.socket.send(raw);
    }
  });

  conn.socket.on("close", () => {
    connections = connections.filter(c => c.socket !== conn.socket);
  });
});

fastify.listen({ port: 3001, host: "0.0.0.0" }, (err, addr) => {
  if (err) throw err;
  console.log(`✅ WebSocket Server running at wss://${addr}/ws`);
});
