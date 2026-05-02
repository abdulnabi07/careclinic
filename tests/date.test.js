import { expect, test } from 'vitest';
import { parseDateSafe } from '../src/utils/dateUtils';

test("parseDateSafe works consistently", () => {
  const d1 = parseDateSafe("2026-05-02 17:12:44.685923+00");
  const d2 = parseDateSafe("2026-05-02T17:12:44.685923+00");
  
  expect(d1).toBe(d2);
});
