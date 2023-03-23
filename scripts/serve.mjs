#!/usr/bin/env zx

import 'zx/globals';

import handler from 'serve-handler';
import http from 'http';
import open from 'open';

const config = require('../vercel.json');

const server = http.createServer((request, response) => {
  // You pass two more arguments for config and middleware
  // More details here: https://github.com/vercel/serve-handler#options
  return handler(request, response, {
    public: config.outputDirectory,
    etag: true,
    // `cleanUrls` is false when production,
    // here we override it to make serve support historyApiFallback
    cleanUrls: ['!**/extensions/**/*', '!**/out/**/*'],
    // different with vercel.json rewrites config
    rewrites: [{ source: '/p/*', destination: '/index.html' }],
  });
});

const port = process.env.PORT || 3001;

server.listen(port, () => {
  console.log(`running at http://127.0.0.1:${port}`);
  setTimeout(() => {
    open(`http://127.0.0.1:${port}`, { app: { name: 'google chrome', arguments: ['--auto-open-devtools-for-tabs'] } });
  }, 5000);
});
