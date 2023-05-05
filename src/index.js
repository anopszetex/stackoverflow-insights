import { readdir } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import path from 'node:path';

const folder = './docs/state-of-js';

async function prepareStream(folder) {
  const files = await readdir(folder);

  const streams = files.map(file => {
    return createReadStream(path.join(folder, file));
  });

  console.log(streams);
}

await prepareStream(folder);
