import { createReadStream } from "node:fs";
import { createServer } from "node:http";

const server = createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  // v1.0.0
  // createReadStream('./t.txt', { encoding: 'utf8', highWaterMark: 1 * 100 }).pipe(res);
  // v2.0.0
  createReadStream('./t.md', { encoding: 'utf8', }).pipe(res);
});

server.listen(3002, () => console.log('is ok'));
