import type { DateValue } from "@internationalized/date";
import { getLocalTimeZone } from "@internationalized/date";
import { get } from "svelte/store";
import { globalState } from "./setting";
import { track } from '@vercel/analytics';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Format tanggal day/month/year (moved outside function for reuse)
function formatDateDMY(date: DateValue) {
   const d = date.toDate(getLocalTimeZone());
   const day = String(d.getDate()).padStart(2, "0");
   const month = String(d.getMonth() + 1).padStart(2, "0");
   const year = d.getFullYear();
   return `${day}/${month}/${year}`;
}

export interface Transaksi {
   tanggal_transaksi: string;
   waktu_transaksi: string;
   keterangan: string;
   total_tagihan: number;
   no_nota: string;
}

export interface TransaksiResponse {
   status?: string;
   job_id?: string;
   total_transaksi: number;
   data: Transaksi[];
}

export interface NestedTransaksiResponse {
   status: string;
   job_id: string;
   data: TransaksiResponse;
}

export async function startFetch(
   fromDate: DateValue,
   toDate: DateValue
): Promise<{status: string, job_id?: string}> {
   const cookie = get(globalState).cookie;
   const formatedFromDate = formatDateDMY(fromDate);
   const formatedToDate = formatDateDMY(toDate);

   const startTime = performance.now();
   track('fetch_start', { dateRange: `${formatedFromDate} - ${formatedToDate}` });

   const res = await fetch(`${API_BASE_URL}/start-fetch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from: formatedFromDate, to: formatedToDate, cookie }),
   });
   
   const endTime = performance.now();
   track('fetch_start_completed', { 
      duration: Math.round(endTime - startTime),
      status: res.status 
   });

   return await res.json();
}

export async function fetchData(
   fromDate: DateValue,
   toDate: DateValue,
   endpoint: 'data-cached' | 'force-empty' | 'force-refresh' = 'data-cached'
): Promise<TransaksiResponse | NestedTransaksiResponse> {
   const cookie = get(globalState).cookie;

   const formatedFromDate = formatDateDMY(fromDate);
   const formatedToDate = formatDateDMY(toDate);
   console.log(`Fetching data with dates: ${formatedFromDate} - ${formatedToDate} using ${endpoint}`);

   // Show toast for data-cached endpoint
   if (endpoint === 'data-cached') {
      import('svelte-sonner').then(({ toast }) => {
         toast.info('Backend sedang mengambil data dari database', {
            description: 'Menggunakan looping request pagination'
         });
      });
   }

   const startTime = performance.now();
   track('fetch_data', { 
      dateRange: `${formatedFromDate} - ${formatedToDate}`,
      endpoint 
   });

   const url = `${API_BASE_URL}/${endpoint}`;
   const res = await fetch(url, {
      method: "POST",
      headers: {
         "Content-Type": "application/json",
      },
      body: JSON.stringify({
         from: formatedFromDate,
         to: formatedToDate,
         cookie,
      }),
   });
   
   const endTime = performance.now();
   const response: TransaksiResponse | NestedTransaksiResponse = await res.json();
   
   // Calculate data count based on response type
   let dataCount = 0;
   if ('data' in response && response.data) {
      if (Array.isArray(response.data)) {
         dataCount = response.data.length;
      } else if ('data' in response.data) {
         dataCount = response.data.data?.length || 0;
      }
   } else if ('total_transaksi' in response) {
      dataCount = response.total_transaksi || 0;
   }
   
   track('fetch_data_completed', { 
      duration: Math.round(endTime - startTime),
      status: res.status,
      dataCount,
      endpoint
   });

   return response;
}

export async function forceEmptyData(
   fromDate: DateValue,
   toDate: DateValue
): Promise<TransaksiResponse | NestedTransaksiResponse> {
   return fetchData(fromDate, toDate, 'force-empty');
}

export async function forceRefreshData(
   fromDate: DateValue,
   toDate: DateValue
): Promise<TransaksiResponse | NestedTransaksiResponse> {
   return fetchData(fromDate, toDate, 'force-refresh');
}
