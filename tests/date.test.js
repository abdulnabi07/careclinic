import { expect, test } from 'vitest';
import { calculateReports } from '../src/utils/reportUtils';

test("IST today filter: current time is counted as today", () => {
  const now = new Date();
  const data = [{ created_at: now.toISOString(), total_amount: 100, payment_type: "cash", services: [] }];
  const result = calculateReports(data);
  expect(result.today.count).toBe(1);
});

test("IST today filter: yesterday is NOT counted as today", () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const data = [{ created_at: yesterday.toISOString(), total_amount: 100, payment_type: "cash", services: [] }];
  const result = calculateReports(data);
  expect(result.today.count).toBe(0);
});

test("week includes records from 6 days ago", () => {
  const sixDaysAgo = new Date();
  sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);
  const data = [{ created_at: sixDaysAgo.toISOString(), total_amount: 100, payment_type: "cash", services: [] }];
  const result = calculateReports(data);
  expect(result.week.count).toBe(1);
});

test("week excludes records from 7+ days ago", () => {
  const eightDaysAgo = new Date();
  eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);
  const data = [{ created_at: eightDaysAgo.toISOString(), total_amount: 100, payment_type: "cash", services: [] }];
  const result = calculateReports(data);
  expect(result.week.count).toBe(0);
});

test("null created_at records are excluded", () => {
  const data = [
    { created_at: null, total_amount: 100, payment_type: "cash", services: [] },
    { created_at: new Date().toISOString(), total_amount: 200, payment_type: "cash", services: [] }
  ];
  const result = calculateReports(data);
  expect(result.today.count).toBe(1);
  expect(result.week.count).toBe(1);
  expect(result.month.count).toBe(1);
});
