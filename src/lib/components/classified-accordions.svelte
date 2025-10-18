<script lang="ts">
   import Accordian from "./accordian.svelte";
   import type { ClassifiedData } from "$lib/query-classifier";
   import type { TransaksiResponse } from "$lib/api";

   let { 
      classifiedData,
      fromDate,
      toDate 
   } = $props<{
      classifiedData: ClassifiedData;
      fromDate?: string;
      toDate?: string;
   }>();

   // Convert classified data to TransaksiResponse format for each category
   function createTransaksiResponse(data: any[], title: string): TransaksiResponse {
      return {
         total_transaksi: data.length,
         data: data
      };
   }

   let commanderData = $derived(createTransaksiResponse(classifiedData.commander, "Umum"));
   let onlineData = $derived(createTransaksiResponse(classifiedData.online, "Online"));
   let offlineData = $derived(createTransaksiResponse(classifiedData.offline, "Offline"));
   let conflictData = $derived(createTransaksiResponse(classifiedData.conflict, "Conflict"));
</script>

<div class="space-y-4">
   {#if classifiedData.commander.length > 0}
      <div class="border rounded-lg p-4">
         <h3 class="text-lg font-semibold mb-2 text-gray-700">📋 Umum ({classifiedData.commander.length})</h3>
         <p class="text-sm text-gray-500 mb-4">Transaksi yang tidak terklasifikasi online/offline</p>
         <Accordian data={commanderData} {fromDate} {toDate} />
      </div>
   {/if}

   {#if classifiedData.online.length > 0}
      <div class="border rounded-lg p-4">
         <h3 class="text-lg font-semibold mb-2 text-green-700">🌐 Online ({classifiedData.online.length})</h3>
         <p class="text-sm text-gray-500 mb-4">Transaksi online berdasarkan query</p>
         <Accordian data={onlineData} {fromDate} {toDate} />
      </div>
   {/if}

   {#if classifiedData.offline.length > 0}
      <div class="border rounded-lg p-4">
         <h3 class="text-lg font-semibold mb-2 text-blue-700">🏪 Offline ({classifiedData.offline.length})</h3>
         <p class="text-sm text-gray-500 mb-4">Transaksi offline berdasarkan query</p>
         <Accordian data={offlineData} {fromDate} {toDate} />
      </div>
   {/if}

   {#if classifiedData.conflict.length > 0}
      <div class="border rounded-lg p-4">
         <h3 class="text-lg font-semibold mb-2 text-red-700">⚠️ Conflict ({classifiedData.conflict.length})</h3>
         <p class="text-sm text-gray-500 mb-4">Transaksi yang cocok dengan query online dan offline</p>
         <Accordian data={conflictData} {fromDate} {toDate} />
      </div>
   {/if}
</div>