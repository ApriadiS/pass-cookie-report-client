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
   import ClassifiedAccordions from "./classified-accordions.svelte";
   import { classifyTransactions, type ClassifiedData } from "$lib/query-classifier";
   import { fetchData, setAuthenticating } from "$lib/apiClient";
   import type { TransaksiResponse, NestedTransaksiResponse } from "$lib/api";
   import LoginModal from "$lib/components/LoginModal.svelte";

   let fromDate = $state<DateValue | undefined>(undefined);
   let toDate = $state<DateValue | undefined>(undefined);

   let fromDateCache: DateValue | undefined = undefined;
   let toDateCache: DateValue | undefined = undefined;

   let transaksiData: TransaksiResponse = $state<TransaksiResponse>({
      total_transaksi: 0,
      data: [],
   });

   let classifiedData: ClassifiedData = $state({
      commander: [],
      online: [],
      offline: [],
      conflict: []
   });

   let showLoginModal = $state(false);

   let hasSelectedDates = $derived(fromDate && toDate);
   let hasData = $derived(transaksiData.data.length > 0);

   // Export dates for parent components
   export { fromDate, toDate };

   // Function to reclassify existing data
   export function reclassifyData() {
      if (hasData) {
         classifiedData = classifyTransactions(
            transaksiData.data,
            $globalState.queryOnline,
            $globalState.queryOffline
         );
      }
   }

   // Function to update data from external sources
   export function updateData(newData: TransaksiResponse | NestedTransaksiResponse) {
      // Handle nested response structure
      if (
         "status" in newData &&
         newData.status === "completed" &&
         "data" in newData.data
      ) {
         transaksiData = (newData as NestedTransaksiResponse).data;
      } else if (Array.isArray(newData.data)) {
         transaksiData = newData as TransaksiResponse;
      } else {
         console.log("Invalid response:", newData);
      }
      reclassifyData();
   }

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
            const result = await fetchData(fromDate!, toDate!, 'data-cached', async () => {
               showLoginModal = true;
               setAuthenticating(true);
            });

            // Handle nested response structure
            if (
               "status" in result &&
               result.status === "completed" &&
               "data" in result.data
            ) {
               transaksiData = (result as NestedTransaksiResponse).data;
            } else if (Array.isArray(result.data)) {
               transaksiData = result as TransaksiResponse;
            } else {
               console.log("Invalid response:", result);
            }
            reclassifyData();
            return;
         }

         // Hanya fetch jika ada perubahan
         if (fromDate !== fromDateCache || toDate !== toDateCache) {
            fromDateCache = fromDate;
            toDateCache = toDate;
            const result = await fetchData(fromDate!, toDate!, 'data-cached', async () => {
               showLoginModal = true;
               setAuthenticating(true);
            });

            // Handle nested response structure
            if (
               "status" in result &&
               result.status === "completed" &&
               "data" in result.data
            ) {
               transaksiData = (result as NestedTransaksiResponse).data;
            } else if (Array.isArray(result.data)) {
               transaksiData = result as TransaksiResponse;
            } else {
               console.log("Invalid response:", result);
            }
            reclassifyData();
         }
      }

      loadData();
   });
</script>

<Field.Set class="p-3 md:p-0">
   <!-- <Field.Legend>Laporan Transaksi</Field.Legend> -->
   <Field.Description class="text-xs md:text-sm"
      >Pilih rentang tanggal untuk melihat laporan</Field.Description
   >
   <Field.Group>
      <Field.Field>
         <div class="grid w-full grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
            <div class="flex flex-col gap-1.5 md:gap-2">
               <Field.Label class="text-xs font-medium md:text-sm"
                  >Dari Tanggal</Field.Label
               >
               <DatePicker bind:value={fromDate} />
            </div>
            <div class="flex flex-col gap-1.5 md:gap-2">
               <Field.Label class="text-xs font-medium md:text-sm"
                  >Sampai Tanggal</Field.Label
               >
               <DatePicker
                  bind:value={toDate}
                  min={fromDate}
                  disabled={!fromDate}
               />
            </div>
         </div>
         {#if hasSelectedDates && hasData}
            <ClassifiedAccordions
               {classifiedData}
               fromDate={fromDate?.toString()}
               toDate={toDate?.toString()}
            />
         {/if}
      </Field.Field>
   </Field.Group>
</Field.Set>

<LoginModal bind:open={showLoginModal} />
