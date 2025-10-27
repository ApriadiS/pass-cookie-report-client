// This file is deprecated - use apiClient.ts instead
// Keeping only type exports for backward compatibility

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
   message?: string;
}

export interface NestedTransaksiResponse {
   status: string;
   job_id: string;
   data: TransaksiResponse;
   message?: string;
}

// Deprecated functions - use apiClient.ts instead
