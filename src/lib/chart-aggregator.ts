// Optimized chart data aggregation for different time periods
import { classifyTransactions, type ClassifiedData } from "./query-classifier";

export type ChartPeriod = "harian" | "mingguan" | "bulanan";

export interface ChartDataPoint {
  date: Date;
  umum: number;
  online: number;
  offline: number;
  conflict: number;
  label: string;
}

// Efficient date key generation
function getDateKey(date: Date, period: ChartPeriod): string {
  const year = date.getFullYear();
  const month = date.getMonth();
  
  switch (period) {
    case "harian":
      return `${year}-${month}-${date.getDate()}`;
    case "mingguan":
      const weekOfMonth = Math.ceil(date.getDate() / 7);
      return `${year}-${month}-W${weekOfMonth}`;
    case "bulanan":
      return `${year}-${month}`;
    default:
      return `${year}-${month}-${date.getDate()}`;
  }
}

// Generate date range for period
function generateDateRange(period: ChartPeriod, baseDate: Date = new Date()): Date[] {
  const dates: Date[] = [];
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  
  switch (period) {
    case "harian":
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        dates.push(new Date(year, month, day));
      }
      break;
      
    case "mingguan":
      // 3 months (current + 2 previous)
      for (let monthOffset = -2; monthOffset <= 0; monthOffset++) {
        const targetMonth = month + monthOffset;
        const targetYear = targetMonth < 0 ? year - 1 : year;
        const adjustedMonth = targetMonth < 0 ? targetMonth + 12 : targetMonth;
        
        for (let week = 1; week <= 4; week++) {
          dates.push(new Date(targetYear, adjustedMonth, week * 7));
        }
      }
      break;
      
    case "bulanan":
      // 12 months
      for (let monthOffset = -11; monthOffset <= 0; monthOffset++) {
        const targetMonth = month + monthOffset;
        const targetYear = targetMonth < 0 ? year - 1 : year;
        const adjustedMonth = targetMonth < 0 ? targetMonth + 12 : targetMonth;
        dates.push(new Date(targetYear, adjustedMonth, 1));
      }
      break;
  }
  
  return dates;
}

// Format label for display - simple numbers only
function formatLabel(date: Date, period: ChartPeriod): string {
  switch (period) {
    case "harian":
      return date.getDate().toString();
    case "mingguan":
      const weekOfMonth = Math.ceil(date.getDate() / 7);
      return weekOfMonth.toString();
    case "bulanan":
      return (date.getMonth() + 1).toString();
    default:
      return date.getDate().toString();
  }
}

// Main aggregation function - optimized for large datasets
export function aggregateChartData(
  data: any[],
  period: ChartPeriod,
  queryOnline: string,
  queryOffline: string,
  baseDate: Date = new Date()
): ChartDataPoint[] {
  // Early return for empty data
  if (!data.length) return [];
  
  // Classify data once
  const hasQueries = queryOnline.trim() || queryOffline.trim();
  const classifiedData = hasQueries 
    ? classifyTransactions(data, queryOnline, queryOffline)
    : { commander: data, online: [], offline: [], conflict: [] };
  
  // Create aggregation maps for efficient lookup
  const aggregations = {
    umum: new Map<string, number>(),
    online: new Map<string, number>(),
    offline: new Map<string, number>(),
    conflict: new Map<string, number>()
  };
  
  // Process each category efficiently
  const processCategory = (items: any[], category: keyof typeof aggregations) => {
    for (const item of items) {
      const transactionDate = new Date(item.tanggal_transaksi);
      const key = getDateKey(transactionDate, period);
      const current = aggregations[category].get(key) || 0;
      aggregations[category].set(key, current + item.total_tagihan);
    }
  };
  
  processCategory(classifiedData.commander, 'umum');
  processCategory(classifiedData.online, 'online');
  processCategory(classifiedData.offline, 'offline');
  processCategory(classifiedData.conflict, 'conflict');
  
  // Generate chart data points
  const dateRange = generateDateRange(period, baseDate);
  
  return dateRange.map(date => {
    const key = getDateKey(date, period);
    
    return {
      date,
      umum: aggregations.umum.get(key) || 0,
      online: aggregations.online.get(key) || 0,
      offline: aggregations.offline.get(key) || 0,
      conflict: aggregations.conflict.get(key) || 0,
      label: formatLabel(date, period)
    };
  });
}