#!/usr/bin/env zx

import 'zx/globals';

import handler from 'serve-handler';
import http from 'http';

const { outputDirectory, ...config } = require('../vercel.json');

const server = http.createServer((request, response) => {
  // You pass two more arguments for config and middleware
  // More details here: https://github.com/vercel/serve-handler#options
  return handler(request, response, {
    ...config,
    public: outputDirectory,
    // `cleanUrls` is false when production,
    // here we override it to make serve support historyApiFallback
    cleanUrls: ['!**/extensions/**/*', '!**/out/**/*'],
  });
});

const port = process.env.PORT || 3001;

server.listen(port, () => {
  console.log(`running at http://127.0.0.1:${port}`);
});
