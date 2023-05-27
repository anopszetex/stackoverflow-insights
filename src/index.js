import { EventEmitter } from 'node:events';

import { rootLogger as logger } from './infra/logger.js';
import { terminate, CODE } from './helpers/index.js';
import { runPipeline } from './service/index.js';
import { initialize } from './service/view.js';

import config from './helpers/config.js';

const DEFAULT_PATH = './docs';
const INPUT_FOLDER = `${DEFAULT_PATH}/state-of-js`;
const OUTPUT_FOLDER = `${DEFAULT_PATH}/final.json`;

const controller = new AbortController();

const exitHandler = terminate(controller, logger, {
  coredump: false,
  timeout: 500,
});

export async function init() {
  const progressNotifier = new EventEmitter();
  const graphNotifier = new EventEmitter();

  const view = initialize({
    years: config.years,
    lineChartData: config.lineChartData,
  })
    .buildInterface()
    .buildProgressBar();

  progressNotifier.on('update', view.handleProgressBarUpdate());
  graphNotifier.on('update', view.handleLineChartUpdate.bind(view)); //* bind is necessary because of the context

  await runPipeline({
    controller,
    graphNotifier,
    progressNotifier,
    inputFolder: INPUT_FOLDER,
    outputFolder: OUTPUT_FOLDER,
  });
}

init();

process.on('uncaughtException', exitHandler(CODE.ERROR, 'Unexpected Error'));
process.on('unhandledRejection', exitHandler(CODE.ERROR, 'Unhandled Promise'));
process.on('SIGTERM', exitHandler(CODE.SUCCESS, 'SIGTERM'));
process.on('SIGINT', exitHandler(CODE.SUCCESS, 'SIGINT'));
