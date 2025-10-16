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
   toDate: DateValue
): Promise<TransaksiResponse | NestedTransaksiResponse> {
   const cookie = get(globalState).cookie;

   const formatedFromDate = formatDateDMY(fromDate);
   const formatedToDate = formatDateDMY(toDate);
   console.log("Fetching data with dates:", formatedFromDate, formatedToDate);

   const startTime = performance.now();
   track('fetch_data', { dateRange: `${formatedFromDate} - ${formatedToDate}` });

   const url = `${API_BASE_URL}/data-cached`;
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
   
   track('fetch_data_completed', { 
      duration: Math.round(endTime - startTime),
      status: res.status,
      dataCount: 'data' in response ? response.data?.length || 0 : response.total_transaksi || 0
   });

   return response;
}
