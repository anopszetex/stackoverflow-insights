import split2 from 'split2';

import { readdir, stat } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';
import { EventEmitter } from 'node:events';
import { PassThrough } from 'node:stream';
import path from 'node:path';
import fs from 'node:fs';

import { rootLogger as logger } from './infra/logger.js';

const FOLDER = './docs/state-of-js';

const TEN_SECONDS = 10e3;

/**
 *
 * @param {import('node:fs').ReadStream[]} streams - array of streams to be concatenated
 * @returns {import('node:stream').PassThrough}
 */
function mergeStreams(streams) {
  return streams.reduce((prev, current, _, items) => {
    current.pipe(prev, { end: false });

    current.on('end', () => {
      return items.every(stream => stream.ended) && prev.end();
    });

    return prev;
  }, new PassThrough());
}

/**
 *
 * @param {string[]} files - array of files to be read
 * @param {string} folder  - folder to be read
 * @returns {Promise<number>} - total size of files
 */
async function getFileSize(files, folder) {
  const fileStats = files.map(file => {
    return stat(path.join(folder, file));
  });

  const statsArray = await Promise.all(fileStats);

  const totalSize = statsArray.reduce((acc, currentStat) => {
    return acc + currentStat.size;
  }, 0);

  return totalSize;
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

  const stream = mergeStreams(streams);

  return { stream, fileSize };
}

async function runProcess(params) {
  const { stream, fileSize, progressNotifier } = params;

  return await pipeline(
    stream,
    handleProgressBar(fileSize, progressNotifier),
    split2(JSON.parse),
    // progressBar,
    // mapFunction,
    {
      signal: AbortSignal.timeout(TEN_SECONDS),
    }
  );
}

/* async function* mapFunction(source) {
  for await (const chunk of source) {
    console.log('source', chunk);
    yield chunk;
  }
}
 */
function handleProgressBar(fileSize, progressnotifier) {
  return async function* progressBar(source) {
    let processedAlready = 0;

    for await (const chunk of source) {
      processedAlready += chunk.length;
      progressnotifier.emit('update', processedAlready, fileSize);
      yield chunk;
    }
  };
}

/* async function* progressBar(stream) {
  for await (const data of stream) {
    console.log('okspaokspoaps');
    yield data;
  }
} */

async function runPipeline(progressNotifier) {
  const { stream, fileSize } = await prepareStream(FOLDER);

  logger.debug({ fileSize }, 'Starting pipeline');

  return await runProcess({ stream, fileSize, progressNotifier });
}

const progressNotifier = new EventEmitter();

async function init() {
  progressNotifier.on('update', (processedAlready, fileSize) => {
    const percentage = Math.floor((processedAlready / fileSize) * 100);

    logger.debug({ processedAlready, fileSize }, `Progress: %${percentage}%`);
  });

  await runPipeline(progressNotifier);
}

init();
