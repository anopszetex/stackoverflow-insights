import { EventEmitter } from 'node:events';

import { calculatePercentage } from './helpers/index.js';
import { rootLogger as logger } from './infra/logger.js';
import { terminate } from './helpers/terminate.js';
import { runPipeline } from './service/index.js';

const progressNotifier = new EventEmitter();
const graphNotifier = new EventEmitter();

const DEFAULT_PATH = './docs';
const INPUT_FOLDER = `${DEFAULT_PATH}/state-of-js`;
const OUTPUT_FOLDER = `${DEFAULT_PATH}/final.json`;

// todo move this function to view layer
function handleProgressBarUpdate() {
  const stat = { lastUpdatedValue: 0 };

  return function onProgressUpdated(processedAlready, fileSize) {
    const percentage = calculatePercentage(processedAlready, fileSize);

    if (percentage === stat.lastUpdatedValue) {
      return;
    }

    stat.lastUpdatedValue = percentage;

    logger.debug({ processedAlready, fileSize }, `Progress: %${percentage}%`);
  };
}

const controller = new AbortController();

const exitHandler = terminate(controller, logger, {
  coredump: false,
  timeout: 500,
});

async function init() {
  progressNotifier.on('update', handleProgressBarUpdate());

  await runPipeline({
    controller,
    graphNotifier,
    progressNotifier,
    inputFolder: INPUT_FOLDER,
    outputFolder: OUTPUT_FOLDER,
  });
}

init();

process.on('uncaughtException', exitHandler(1, 'Unexpected Error'));
process.on('unhandledRejection', exitHandler(1, 'Unhandled Promise'));
process.on('SIGTERM', exitHandler(0, 'SIGTERM'));
process.on('SIGINT', exitHandler(0, 'SIGINT'));
