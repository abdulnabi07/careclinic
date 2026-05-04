/**
 * Single source of truth for all date-filtered calculations.
 * Used by: Dashboard, Reports, Exports, DateFilter.
 * Today uses IST locale comparison. Week/Month use standard Date math.
 */

export function calculateReports(data) {
  const todayIST = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata"
  });

  const getIST = (d) =>
    new Date(d).toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata"
    });

  const now = new Date();

  // TODAY — strict IST date match
  const today = data.filter(d => {
    if (!d.created_at) return false;
    return getIST(d.created_at) === todayIST;
  });

  // LAST 7 DAYS — rolling 7-day window
  const week = data.filter(d => {
    if (!d.created_at) return false;
    const diff = (now - new Date(d.created_at)) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff < 7;
  });

  // MONTH — same calendar month/year
  const month = data.filter(d => {
    if (!d.created_at) return false;
    const dDate = new Date(d.created_at);
    return dDate.getMonth() === now.getMonth() && dDate.getFullYear() === now.getFullYear();
  });

  // Debug
  console.log("TODAY IST:", todayIST);
  console.log("TOTAL:", data.length, "| TODAY:", today.length, "| WEEK:", week.length, "| MONTH:", month.length);

  const sum = arr => arr.reduce((a, b) => a + (Number(b.total_amount) || 0), 0);
  const isCash = d => d.payment_type === "cash";
  const isOnline = d => d.payment_type !== "cash";
  const hasService = (d, serviceName) =>
    Array.isArray(d.services) && d.services.some(s => s.toLowerCase().includes(serviceName));

  const buildStats = (arr) => ({
    count: arr.length,
    revenue: sum(arr),
    cash: sum(arr.filter(isCash)),
    online: sum(arr.filter(isOnline)),
    review: arr.filter(d => hasService(d, "review")).length,
    consultation: arr.filter(d => hasService(d, "consultation")).length,
    patients: arr
  });

  return {
    today: buildStats(today),
    week: buildStats(week),
    month: buildStats(month)
  };
}
