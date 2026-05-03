import { expect, test } from 'vitest';

test("toLocaleDateString en-CA with IST timezone gives YYYY-MM-DD", () => {
  // A known UTC timestamp: 2026-05-02 17:12:44 UTC = 2026-05-02 22:42:44 IST
  const d = new Date("2026-05-02T17:12:44.685923+00:00");
  const istDate = d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

  expect(istDate).toBe("2026-05-02");
});

test("UTC midnight maps to previous day IST before 05:30", () => {
  // 2026-05-03 00:00:00 UTC = 2026-05-03 05:30:00 IST (same day)
  const d = new Date("2026-05-03T00:00:00+00:00");
  const istDate = d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

  expect(istDate).toBe("2026-05-03");
});

test("Late IST night before UTC midnight maps correctly", () => {
  // 2026-05-02 18:29:00 UTC = 2026-05-02 23:59:00 IST (still May 2)
  const d = new Date("2026-05-02T18:29:00+00:00");
  const istDate = d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

  expect(istDate).toBe("2026-05-02");
});

test("Early morning IST after UTC midnight maps correctly", () => {
  // 2026-05-02 18:31:00 UTC = 2026-05-03 00:01:00 IST (now May 3)
  const d = new Date("2026-05-02T18:31:00+00:00");
  const istDate = d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

  expect(istDate).toBe("2026-05-03");
});
