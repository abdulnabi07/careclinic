import { expect, test } from 'vitest';
import { calculateReports } from '../src/utils/reportUtils';

// Mock data spanning across different days relative to actual current time
const mockData = () => {
  const now = new Date();
  
  const today = new Date(now);
  const twoDaysAgo = new Date(now);
  twoDaysAgo.setDate(now.getDate() - 2);
  const tenDaysAgo = new Date(now);
  tenDaysAgo.setDate(now.getDate() - 10);
  
  return [
    { created_at: today.toISOString(), total_amount: 100, payment_type: "cash", services: ["Consultation"] },
    { created_at: today.toISOString(), total_amount: 200, payment_type: "cashless", services: ["Review Patient"] },
    { created_at: twoDaysAgo.toISOString(), total_amount: 150, payment_type: "cash", services: ["Consultation"] },
    { created_at: tenDaysAgo.toISOString(), total_amount: 300, payment_type: "cashless", services: ["Review Patient"] }
  ];
};

test("today count is correct", () => {
  const result = calculateReports(mockData());
  expect(result.today.count).toBe(2);
  expect(result.today.patients).toHaveLength(2);
});

test("today revenue is correct", () => {
  const result = calculateReports(mockData());
  expect(result.today.revenue).toBe(300); // 100 + 200
});

test("today is subset of week", () => {
  const result = calculateReports(mockData());
  expect(result.week.count).toBeGreaterThanOrEqual(result.today.count);
  expect(result.week.count).toBe(3); // today(2) + 2 days ago(1)
});

test("week revenue includes today + 2 days ago", () => {
  const result = calculateReports(mockData());
  expect(result.week.revenue).toBe(450); // 300 + 150
});

test("month count includes at least today", () => {
  const result = calculateReports(mockData());
  expect(result.month.count).toBeGreaterThanOrEqual(result.today.count);
});

test("patients arrays are returned for each period", () => {
  const result = calculateReports(mockData());
  expect(Array.isArray(result.today.patients)).toBe(true);
  expect(Array.isArray(result.week.patients)).toBe(true);
  expect(Array.isArray(result.month.patients)).toBe(true);
});

test("revenue is monotonically non-decreasing: today <= week", () => {
  const result = calculateReports(mockData());
  expect(result.today.revenue).toBeLessThanOrEqual(result.week.revenue);
});
