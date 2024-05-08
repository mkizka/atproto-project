import { createRequestHandler } from "@remix-run/express";
import type { ServerBuild } from "@remix-run/node";
import express from "express";

import { createServer } from "./generated/server/index.js";

const viteDevServer =
  process.env.NODE_ENV === "production"
    ? null
    : await import("vite").then((vite) =>
        vite.createServer({
          server: { middlewareMode: true },
        }),
      );

const app = express();
app.use(
  viteDevServer ? viteDevServer.middlewares : express.static("build/client"),
);

const server = createServer();
server.dev.mkizka.sample.sampleMethod(() => {
  return {
    encoding: "application/json",
    body: {
      foo: "bar",
    },
  };
});
app.use(server.xrpc.router);

const build = viteDevServer
  ? () => viteDevServer.ssrLoadModule("virtual:remix/server-build")
  : await import("../build/server/index.js");

app.all("*", createRequestHandler({ build: build as ServerBuild }));

app.listen(3000, () => {
  console.log("App listening on http://localhost:3000");
});
