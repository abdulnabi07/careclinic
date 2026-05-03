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

test("today is subset of week", () => {
  const data = mockData();
  const result = calculateReports(data);

  expect(result.week.count).toBeGreaterThanOrEqual(result.today.count);
  expect(result.today.count).toBe(2);
  expect(result.week.count).toBe(3);
});

test("week is subset of month", () => {
  const data = mockData();
  const result = calculateReports(data);

  expect(result.month.count).toBeGreaterThanOrEqual(result.week.count);
});

test("revenue consistency", () => {
  const data = mockData();
  const result = calculateReports(data);

  expect(result.today.revenue).toBeLessThanOrEqual(result.week.revenue);
  expect(result.week.revenue).toBeLessThanOrEqual(result.month.revenue);
  
  // Also verify specific values from mock data
  expect(result.today.revenue).toBe(300); // 100 + 200
  expect(result.week.revenue).toBe(450); // 300 + 150
});
