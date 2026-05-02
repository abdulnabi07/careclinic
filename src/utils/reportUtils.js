import { parseDateSafe } from './dateUtils';

function getTodayRangeIST() {
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

function getWeekStartIST() {
  const now = new Date();
  const offset = 5.5 * 60 * 60 * 1000;

  const ist = new Date(now.getTime() + offset);
  ist.setDate(ist.getDate() - 6);
  ist.setHours(0, 0, 0, 0);

  return new Date(ist.getTime() - offset).getTime();
}

function getMonthStartIST() {
  const now = new Date();
  const offset = 5.5 * 60 * 60 * 1000;

  const ist = new Date(now.getTime() + offset);
  ist.setDate(1);
  ist.setHours(0, 0, 0, 0);

  return new Date(ist.getTime() - offset).getTime();
}

export function calculateReports(data) {
  const { start, end } = getTodayRangeIST();
  const weekStart = getWeekStartIST();
  const monthStart = getMonthStartIST();
  
  const today = data.filter(d => {
    const created = parseDateSafe(d.created_at);
    return created >= start && created <= end;
  });
  
  const week = data.filter(d => {
    const created = parseDateSafe(d.created_at);
    return created >= weekStart;
  });
  
  const month = data.filter(d => {
    const created = parseDateSafe(d.created_at);
    return created >= monthStart;
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
