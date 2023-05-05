import { sum } from './../../src/sum.js';

import { strictEqual } from 'node:assert';
import { describe, it } from 'node:test';

describe('sum', () => {
  it('sums up two numbers', () => {
    strictEqual(sum(1, 2), 3);
  });
});
