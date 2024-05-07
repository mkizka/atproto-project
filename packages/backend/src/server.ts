import express from "express";
import { createServer } from "lexicon/server";
import cors from "cors";

const server = createServer();

const app = express();
app.use(cors());

app.use(server.xrpc.router);
server.dev.mkizka.sample.sampleMethod(() => {
  console.log("sampleMethod called");
  return {
    encoding: "application/json",
    body: {
      foo: "bar",
    },
  };
});

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
