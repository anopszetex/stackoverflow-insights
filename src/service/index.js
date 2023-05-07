import split2 from 'split2';

import { readdir, stat } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';
import { PassThrough } from 'node:stream';
import path from 'node:path';
import fs from 'node:fs';

import { setTimeout } from 'node:timers/promises';

import { TIMEOUT_SIGNAL } from './../helpers/index.js';

/**
 *
 * @param {import('node:fs').ReadStream[]} streams - array of streams to be concatenated
 * @returns {import('node:stream').PassThrough}
 */
function mergeStreams(streams) {
  return streams.reduce((prev, current, _, items) => {
    current.pipe(prev, { end: false });

    current.on('end', () => {
      const allStreamsEnded = items.every(stream => stream.ended);

      if (allStreamsEnded) {
        prev.end();
        return;
      }
    });

    return prev;
  }, new PassThrough());
}

/**
 *
 * @param {string[]}  files   - array of files to be read
 * @param {string}    folder  - folder to be read
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

/**
 *
 * @param {number}                             fileSize         - total size of files
 * @param {import('node:events').EventEmitter} progressnotifier - event emitter to emit progress
 */
function handleProgressBar(fileSize, progressnotifier) {
  return async function* progressBar(source) {
    let processedAlready = 0;

    for await (const chunk of source) {
      processedAlready += chunk.length;
      progressnotifier.emit('update', processedAlready, fileSize);
      await setTimeout(2);
    }
  };
}

/**
 *
 * @param {Object} params
 * @param {import('node:stream').PassThrough}  params.stream           - stream to be processed
 * @param {number}                             params.fileSize         - total size of files
 * @param {import('node:events').EventEmitter} params.progressNotifier - event emitter to emit progress
 * @returns {Promise<void>}
 */
async function runProcess(params) {
  const { stream, fileSize, progressNotifier } = params;

  return pipeline(
    stream,
    handleProgressBar(fileSize, progressNotifier),
    split2(JSON.parse),
    {
      signal: AbortSignal.timeout(TIMEOUT_SIGNAL),
    }
  );
}

/**
 *
 * @param {Object} params
 * @param {import('node:events').EventEmitter} params.progressNotifier - event emitter to emit progress
 * @param {string}                             params.inputFolder      - folder to be read
 * @param {string}                             params.outputFolder     - folder to be written
 * @param {import('pino').Logger}              params.logger           - logger to be used in the process
 * @returns {Promise<void>}
 */
async function runPipeline(params) {
  const { progressNotifier, inputFolder, outputFolder, logger } = params;

  const { stream, fileSize } = await prepareStream(inputFolder);

  return runProcess({ stream, fileSize, progressNotifier });
}

export { runPipeline };
