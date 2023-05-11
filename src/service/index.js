import StreamConcat from 'stream-concat';
import split2 from 'split2';

import { readdir, stat } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';
import fs, { createWriteStream } from 'node:fs';
import path from 'node:path';

import { TIMEOUT_SIGNAL } from './../helpers/index.js';

import config from './../helpers/config.js';

/**
 *
 * @param {string[]}  files   - array of files to be read
 * @param {string}    folder  - folder to be read
 * @returns {Promise<number>} - total size of files
 */
async function getFilesSize(files, folder) {
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
async function prepareStreams(folder) {
  const files = await readdir(folder);
  const fileSize = await getFilesSize(files, folder);

  const streams = files.map(file => {
    return fs.createReadStream(path.join(folder, file));
  });

  const stream = new StreamConcat(streams);

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

      yield chunk;
    }
  };
}

async function* mapFunction(stream) {
  for await (const { tools, year } of stream) {
    const item = config.tecnologiesInAnalysis.reduce(
      (technologyAcc, technology) => {
        const { experience } = tools?.[technology] || {};

        const isExperienceLiked = config.likes.includes(experience);

        return { year, ...technologyAcc, [technology]: isExperienceLiked };
      },
      {}
    );

    yield item;
  }
}

function calculateTotalForYear(yearData) {
  return Object.keys(yearData).reduce((acc, current) => {
    if (current === 'total') return acc;

    return acc + yearData[current];
  }, 0);
}

function aggregateItemsPerYear(years) {
  const initialValuesForTechnologies = config.tecnologiesInAnalysis.reduce(
    (acc, technology) => {
      acc[technology] = 0;
      return acc;
    },
    {}
  );

  return years.reduce((acc, year) => {
    acc[year] = {
      ...initialValuesForTechnologies,
      get total() {
        return calculateTotalForYear(acc[year]);
      },
    };

    return acc;
  }, {});
}

function aggregate(graphNotifier) {
  return async function* feedGraph(stream) {
    const yearsInContext = aggregateItemsPerYear(config.years);

    for await (const data of stream) {
      const year = data.year;
      Reflect.deleteProperty(data, 'year');

      for (const key of Object.keys(data)) {
        yearsInContext[year][key] += data[key];
      }
    }

    yield JSON.stringify(yearsInContext);
  };
}

/**
 *
 * @param {Object} params
 * @param {import('node:stream').PassThrough}  params.stream           - stream to be processed
 * @param {number}                             params.fileSize         - total size of files
 * @param {import('node:events').EventEmitter} params.progressNotifier - event emitter to emit progress
 * @param {import('node:events').EventEmitter} params.graphNotifier    - event emitter to emit graph
 * @returns {Promise<void>}
 */
async function runProcess(params) {
  const { stream, fileSize, progressNotifier, graphNotifier, outputFolder } =
    params;

  return pipeline(
    stream,
    handleProgressBar(fileSize, progressNotifier),
    split2(JSON.parse),
    mapFunction,
    aggregate(graphNotifier),
    createWriteStream(outputFolder),
    {
      signal: AbortSignal.timeout(TIMEOUT_SIGNAL),
    }
  );
}

/**
 *
 * @param {Object} params
 * @param {import('node:events').EventEmitter} params.progressNotifier - event emitter to emit progress
 * @param {import('node:events').EventEmitter} params.graphNotifier    - event emitter to emit graph
 * @param {string}                             params.inputFolder      - folder to be read
 * @param {string}                             params.outputFolder     - folder to be written
 * @param {import('pino').Logger}              params.logger           - logger to be used in the process
 * @returns {Promise<void>}
 */
async function runPipeline(params) {
  const { progressNotifier, inputFolder, outputFolder, graphNotifier } = params;

  const { stream, fileSize } = await prepareStreams(inputFolder);

  return runProcess({
    stream,
    fileSize,
    progressNotifier,
    graphNotifier,
    outputFolder,
  });
}

export { runPipeline };
