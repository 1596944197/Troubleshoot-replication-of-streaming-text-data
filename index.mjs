import { createReadStream } from "node:fs";
import { createServer } from "node:http";

const server = createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  createReadStream('./t.txt', { encoding: 'utf8', highWaterMark: 1 * 100 }).pipe(res);
});

server.listen(3002, () => console.log('is ok'));
