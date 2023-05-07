import { EventEmitter } from 'node:events';

import { calculatePercentage } from './helpers/index.js';
import { rootLogger as logger } from './infra/logger.js';
import { runPipeline } from './service/index.js';

const progressNotifier = new EventEmitter();

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

async function init() {
  progressNotifier.on('update', handleProgressBarUpdate());

  await runPipeline({
    progressNotifier,
    inputFolder: INPUT_FOLDER,
    outputFolder: OUTPUT_FOLDER,
  });
}

init();
