import { readdir, stat } from 'node:fs/promises';
import { PassThrough } from 'node:stream';
import path from 'node:path';
import fs from 'node:fs';

const FOLDER = './docs/state-of-js';

/**
 *
 * @param {import('node:fs').ReadStream[]} streams - array of streams to be concatenated
 * @returns {import('node:stream').PassThrough}
 */
function concatStream(streams) {
  return streams.reduce((acc, current, _, items) => {
    current.pipe(acc, { end: false });

    current.on('end', () => {
      return items.every(readStream => readStream.ended) && acc.end();
    });

    return acc;
  }, new PassThrough());
}

/**
 *
 * @param {string} folder - folder to be read
 */
async function prepareStream(folder) {
  const files = await readdir(folder);

  const streams = files.map(file => {
    return fs.createReadStream(path.join(folder, file));
  });

  const stream = concatStream(streams);

  return { stream };
}

await prepareStream(FOLDER);
