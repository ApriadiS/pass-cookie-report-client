// Utility untuk mengklasifikasi transaksi berdasarkan query
export interface ClassifiedData {
  commander: any[];
  online: any[];
  offline: any[];
  conflict: any[];
}

// Normalize query string: lowercase, trim, remove extra spaces
function normalizeQuery(query: string): string[] {
  return query
    .toLowerCase()
    .trim()
    .split(',')
    .map(q => q.trim())
    .filter(q => q.length > 0);
}

// Check if keterangan contains any query keywords
function containsKeywords(keterangan: string, keywords: string[]): boolean {
  const normalizedKeterangan = keterangan.toLowerCase();
  return keywords.some(keyword => normalizedKeterangan.includes(keyword));
}

// Classify single transaction
function classifyTransaction(transaction: any, onlineKeywords: string[], offlineKeywords: string[]): 'commander' | 'online' | 'offline' | 'conflict' {
  const keterangan = transaction.keterangan || '';
  
  const isOnline = containsKeywords(keterangan, onlineKeywords);
  const isOffline = containsKeywords(keterangan, offlineKeywords);
  
  if (isOnline && isOffline) return 'conflict';
  if (isOnline) return 'online';
  if (isOffline) return 'offline';
  return 'commander';
}

// Main classification function
export function classifyTransactions(data: any[], queryOnline: string, queryOffline: string): ClassifiedData {
  const onlineKeywords = normalizeQuery(queryOnline);
  const offlineKeywords = normalizeQuery(queryOffline);
  
  const result: ClassifiedData = {
    commander: [],
    online: [],
    offline: [],
    conflict: []
  };
  
  // Classify each transaction
  for (const transaction of data) {
    const category = classifyTransaction(transaction, onlineKeywords, offlineKeywords);
    result[category].push(transaction);
  }
  
  return result;
}