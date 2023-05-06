import { readdir, stat } from 'node:fs/promises';
import { PassThrough } from 'node:stream';
import { log } from 'node:console';
import path from 'node:path';
import fs from 'node:fs';

const FOLDER = './docs/state-of-js';

/**
 *
 * @param {import('node:fs').ReadStream[]} streams - array of streams to be concatenated
 * @returns {import('node:stream').PassThrough}
 */
function mergeStream(streams) {
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
 * @param {string[]} files - array of files to be read
 * @param {string} folder  - folder to be read
 * @returns
 */
async function getFileSize(files, folder) {
  const stats = files.map(file => {
    return stat(path.join(folder, file));
  });

  const results = await Promise.all(stats);

  return results.reduce((acc, current) => {
    return acc + current.size;
  }, 0);
}

/**
 *
 * @param {string} folder - folder to be read
 */
async function prepareStream(folder) {
  const files = await readdir(folder);
  const fileSize = await getFileSize(files, folder);

  const streams = files.map(file => {
    return fs.createReadStream(path.join(folder, file));
  });

  const stream = mergeStream(streams);

  return { stream, fileSize };
}

await prepareStream(FOLDER);
