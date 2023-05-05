import { sum } from './../../src/sum.js';

import { strictEqual } from 'node:assert';
import { describe, it } from 'node:test';

describe('sum', () => {
  it('sums up two numbers', () => {
    const result = sum(1, 2);
    strictEqual(result, 3);
  });
});
