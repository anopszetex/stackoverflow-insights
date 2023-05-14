import { deepStrictEqual, strictEqual } from 'node:assert';
import { describe, it, before } from 'node:test';

import { readFile } from 'node:fs/promises';

import path from 'node:path';
import * as url from 'url';

import { init } from './../../src/index.js';

describe('Read file', () => {
  let app = null;
  const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

  const expected = {
    2016: {
      angular: 5466,
      react: 8615,
      vuejs: 4195,
      ember: 2961,
      backbone: 2539,
      total: 23776,
    },
    2017: {
      angular: 10521,
      react: 20032,
      vuejs: 16823,
      ember: 5741,
      backbone: 3919,
      total: 57036,
    },
    2018: {
      angular: 6902,
      react: 16913,
      vuejs: 15200,
      ember: 3859,
      backbone: 0,
      total: 42874,
    },
    2019: {
      angular: 6348,
      react: 16792,
      vuejs: 14979,
      ember: 3594,
      backbone: 0,
      total: 41713,
    },
  };

  before(async () => {
    app = await init();
  });

  it('init application', async () => {
    strictEqual(app, undefined);

    const file = await readFile(
      path.join(__dirname, './../../docs/final.json'),
      'utf8'
    );

    deepStrictEqual(file, JSON.stringify(expected));
  });
});
