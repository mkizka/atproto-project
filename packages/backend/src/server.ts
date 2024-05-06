import express from "express";
import { createServer } from "api";

const server = createServer();

const app = express();

app.use(server.xrpc.router);
// server.xrpc.method("foo.bar", () => {
//   return {
//     encoding: "application/json",
//     body: JSON.stringify({ message: "Hello World!" }),
//   };
// });

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(3000, () => {
  console.log("serve: http://localhost:3000");
});
