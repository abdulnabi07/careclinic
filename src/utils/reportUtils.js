/**
 * Report calculation using built-in Intl timezone handling.
 * No manual UTC offset logic — works consistently in local (IST) and Vercel (UTC).
 */

/** Convert a UTC timestamp to IST date string (YYYY-MM-DD) */
function toISTDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata"
  });
}

export function calculateReports(data) {
  const todayIST = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata"
  });

  // Debug logging (MANDATORY FOR VERIFICATION)
  console.log("TODAY IST:", todayIST);
  data.forEach(d => {
    const istDate = new Date(d.created_at).toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata"
    });
    console.log("UTC:", d.created_at, "→ IST:", istDate);
  });

  // Compute week start (6 days ago) and month start in IST
  const [y, m, d] = todayIST.split('-').map(Number);
  const weekAgoDate = new Date(y, m - 1, d - 6);
  const weekStartIST = `${weekAgoDate.getFullYear()}-${String(weekAgoDate.getMonth() + 1).padStart(2, '0')}-${String(weekAgoDate.getDate()).padStart(2, '0')}`;
  const monthStartIST = `${todayIST.slice(0, 8)}01`;

  // Filter using IST date string comparison (YYYY-MM-DD is lexicographically orderable)
  const today = data.filter(item => {
    if (!item.created_at) return false;
    return toISTDate(item.created_at) === todayIST;
  });

  const week = data.filter(item => {
    if (!item.created_at) return false;
    const itemDate = toISTDate(item.created_at);
    return itemDate >= weekStartIST && itemDate <= todayIST;
  });

  const month = data.filter(item => {
    if (!item.created_at) return false;
    const itemDate = toISTDate(item.created_at);
    return itemDate >= monthStartIST && itemDate <= todayIST;
  });

  console.log("TOTAL:", data.length);
  console.log("TODAY:", today.length);

  const sum = arr => arr.reduce((a, b) => a + (Number(b.total_amount) || 0), 0);
  const isCash = d => d.payment_type === "cash";
  const isOnline = d => d.payment_type !== "cash";

  // Safely check if a service exists in the services array
  const hasService = (d, serviceName) =>
    Array.isArray(d.services) && d.services.some(s => s.toLowerCase().includes(serviceName));

  return {
    today: {
      count: today.length,
      revenue: sum(today),
      cash: sum(today.filter(isCash)),
      online: sum(today.filter(isOnline)),
      review: today.filter(d => hasService(d, "review")).length,
      consultation: today.filter(d => hasService(d, "consultation")).length
    },
    week: {
      count: week.length,
      revenue: sum(week),
      cash: sum(week.filter(isCash)),
      online: sum(week.filter(isOnline)),
      review: week.filter(d => hasService(d, "review")).length,
      consultation: week.filter(d => hasService(d, "consultation")).length
    },
    month: {
      count: month.length,
      revenue: sum(month),
      cash: sum(month.filter(isCash)),
      online: sum(month.filter(isOnline)),
      review: month.filter(d => hasService(d, "review")).length,
      consultation: month.filter(d => hasService(d, "consultation")).length
    }
  };
}
