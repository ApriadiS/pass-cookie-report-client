<script lang="ts">
   import * as Field from "$lib/components/ui/field/index.js";
   import Input from "./ui/input/input.svelte";
   import Switch from "./ui/switch/switch.svelte";
   import DatePicker from "./date-picker.svelte";
   import DrawerTransaksi from "./drawer-transaksi.svelte";
   import CardTransaksi from "./card-transaksi.svelte";
   import type { DateValue } from "@internationalized/date";
   import { getLocalTimeZone } from "@internationalized/date";
   import { globalState } from "$lib/setting";
   import Accordian from "./accordian.svelte";
   import { fetchData, type TransaksiResponse, type NestedTransaksiResponse } from "$lib/api";

   let fromDate = $state<DateValue | undefined>(undefined);
   let toDate = $state<DateValue | undefined>(undefined);

   let fromDateCache: DateValue | undefined = undefined;
   let toDateCache: DateValue | undefined = undefined;

   let transaksiData: TransaksiResponse = $state<TransaksiResponse>({
      total_transaksi: 0,
      data: [],
   });
   
   let hasSelectedDates = $derived(fromDate && toDate);



   $effect(() => {
      // Pastikan kedua tanggal sudah terisi
      if (!fromDate || !toDate) return;

      console.log("Dijalankan effect");

      async function loadData() {
         // Jika cache masih kosong, simpan cache tapi jangan fetch
         if (fromDateCache === undefined && toDateCache === undefined) {
            fromDateCache = fromDate;
            toDateCache = toDate;
            console.log("Cache disimpan");
            const result = await fetchData(fromDate!, toDate!);
            
            // Handle nested response structure
            if ('status' in result && result.status === "completed" && 'data' in result.data) {
               transaksiData = (result as NestedTransaksiResponse).data;
            } else if (Array.isArray(result.data)) {
               transaksiData = result as TransaksiResponse;
            } else {
               console.log("Invalid response:", result);
            }
            return;
         }

         // Hanya fetch jika ada perubahan
         if (fromDate !== fromDateCache || toDate !== toDateCache) {
            fromDateCache = fromDate;
            toDateCache = toDate;
            const result = await fetchData(fromDate!, toDate!);
            
            // Handle nested response structure
            if ('status' in result && result.status === "completed" && 'data' in result.data) {
               transaksiData = (result as NestedTransaksiResponse).data;
            } else if (Array.isArray(result.data)) {
               transaksiData = result as TransaksiResponse;
            } else {
               console.log("Invalid response:", result);
            }
         }
      }

      loadData();
   });
</script>

<Field.Set>
   <Field.Legend>Laporan Transaksi</Field.Legend>
   <Field.Description>Pilih rentang tanggal untuk melihat laporan</Field.Description>
   <Field.Group>
      <Field.Field>
         <div class="grid w-full grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
               <Field.Label class="text-sm font-medium">Dari Tanggal</Field.Label>
               <DatePicker bind:value={fromDate} />
            </div>
            <div class="flex flex-col gap-2">
               <Field.Label class="text-sm font-medium">Sampai Tanggal</Field.Label>
               <DatePicker
                  bind:value={toDate}
                  min={fromDate}
                  disabled={!fromDate}
               />
            </div>
         </div>
         {#if hasSelectedDates && transaksiData.data.length > 0}
            <Accordian 
               data={transaksiData} 
               fromDate={fromDate?.toString()}
               toDate={toDate?.toString()}
            />
         {/if}
      </Field.Field>
   </Field.Group>
</Field.Set>
