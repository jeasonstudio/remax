#!/usr/bin/env zx

import "zx/globals";

import http from "http";
import handler from "serve-handler";

const config = require("../vercel.json");

const server = http.createServer((request, response) => {
  // You pass two more arguments for config and middleware
  // More details here: https://github.com/vercel/serve-handler#options
  return handler(request, response, {
    public: config.outputDirectory,
    etag: true,
    // `cleanUrls` is false when production,
    // here we override it to make serve support historyApiFallback
    cleanUrls: ["!**/extensions/**/*", "!**/out/**/*"],
    // different with vercel.json rewrites config
    rewrites: [{ source: "/*", destination: "/index.html" }],
  });
});

const port = process.env.PORT || 3001;

server.listen(port, () => {
  console.log(`running at http://127.0.0.1:${port}`);
});
