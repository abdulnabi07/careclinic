export function getTodayRangeIST() {
  const now = new Date();
  const offset = 5.5 * 60 * 60 * 1000;

  const ist = new Date(now.getTime() + offset);

  const start = new Date(ist);
  start.setHours(0, 0, 0, 0);

  const end = new Date(ist);
  end.setHours(23, 59, 59, 999);

  return {
    start: new Date(start.getTime() - offset).getTime(),
    end: new Date(end.getTime() - offset).getTime(),
  };
}
