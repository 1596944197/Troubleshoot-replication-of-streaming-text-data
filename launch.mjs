import { exec, execSync } from "child_process";

const url = 'http://localhost:5173';
exec('nodemon ./index.mjs');
exec('yarn dev', (err, stdout, stderr) => {
  if (err) {
    throw err;
  }
});
execSync(`start ${url}`);
console.log('Launched!');