<script lang="ts">
   import * as Accordion from "$lib/components/ui/accordion/index.js";
   import CardTransaksi from "./card-transaksi.svelte";
   import Label from "./ui/label/label.svelte";
   import { globalState } from "$lib/setting";
   import type { TransaksiResponse, Transaksi } from "$lib/api";

   interface Props {
      data: TransaksiResponse;
      fromDate?: string;
      toDate?: string;
   }

   let { data, fromDate, toDate }: Props = $props();

   // Group data by date
   const grouped = $derived(
      data.data.reduce(
         (acc, item) => {
            const date = item.tanggal_transaksi;
            if (!acc[date]) {
               acc[date] = [];
            }
            acc[date].push(item);
            return acc;
         },
         {} as Record<string, Transaksi[]>
      )
   );

   const dates = $derived(Object.keys(grouped));
   const totalAmount = $derived(
      data.data.reduce((sum, item) => sum + item.total_tagihan, 0)
   );

   const dateRangeText = $derived.by(() => {
      if (fromDate && toDate) {
         const from = new Date(fromDate).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
         });
         const to = new Date(toDate).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
         });

         // If same date, show only one date
         if (fromDate === toDate) {
            return from;
         }
         return `${from} - ${to}`;
      }
      return "";
   });

   const isSameDate = $derived(fromDate === toDate);
   const isMultipleDays = $derived(dates.length > 1 && !isSameDate);

   // Timezone conversion function - input dianggap WIB
   function convertToTimezone(
      dateString: string,
      targetTimezone: string
   ): Date {
      const date = new Date(dateString);

      // Input dianggap WIB (UTC+7), konversi ke target timezone
      let hourDiff = 0;
      switch (targetTimezone) {
         case "WIB":
            hourDiff = 0;
            break; // WIB ke WIB = tidak berubah
         case "WITA":
            hourDiff = 1;
            break; // WIB ke WITA = +1 jam
         case "WIT":
            hourDiff = 2;
            break; // WIB ke WIT = +2 jam
      }

      return new Date(date.getTime() + hourDiff * 3600000);
   }
</script>

{#if data.data.length > 0}
   <Accordion.Root type="single" class="w-full">
      {#if isMultipleDays}
         <!-- Multiple days - nested accordion -->
         <Accordion.Item value="total">
            <Accordion.Trigger>
               <div class="text-left">
                  <div class="text-sm font-bold md:text-base">
                     Total {dateRangeText ? dateRangeText + " : " : ""}
                  </div>
                  <div class="text-lg font-bold md:text-xl text-primary">
                     Rp {totalAmount.toLocaleString("id-ID")}
                  </div>
               </div>
            </Accordion.Trigger>
            <Accordion.Content>
               <Accordion.Root type="single" class="w-full">
                  {#each dates as date, index}
                     {@const dayData = grouped[date]}
                     {@const dayTotal = dayData.reduce(
                        (sum: number, item: Transaksi) =>
                           sum + item.total_tagihan,
                        0
                     )}
                     <Accordion.Item value={`day-${index}`}>
                        <Accordion.Trigger
                           >{@const convertedDate = convertToTimezone(
                              date + "T00:00:00",
                              $globalState.timezone
                           )}
                           {@const formattedDate =
                              convertedDate.toLocaleDateString("id-ID", {
                                 weekday: "long",
                                 day: "2-digit",
                                 month: "long",
                                 year: "numeric",
                              })}
                           <div class="text-left">
                              <div class="text-sm font-medium">
                                 {formattedDate}
                              </div>
                              <div class="text-base font-bold">
                                 Rp {dayTotal.toLocaleString("id-ID")}
                              </div>
                           </div>
                        </Accordion.Trigger>
                        <Accordion.Content class="flex flex-col gap-4">
                           {#each dayData as item}
                              {@const convertedDateTime = convertToTimezone(
                                 item.waktu_transaksi,
                                 $globalState.timezone
                              )}
                              {@const formattedDateTime =
                                 convertedDateTime.toLocaleDateString("id-ID", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                 }) +
                                 " " +
                                 convertedDateTime.toLocaleTimeString("id-ID", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: false,
                                 }) +
                                 " " +
                                 $globalState.timezone}
                              <CardTransaksi
                                 tanggal={formattedDateTime}
                                 nominal={item.total_tagihan}
                                 keterangan={item.keterangan}
                              />
                           {/each}
                        </Accordion.Content>
                     </Accordion.Item>
                  {/each}
               </Accordion.Root>
            </Accordion.Content>
         </Accordion.Item>
      {:else}
         <!-- Single day - simple accordion -->
         <Accordion.Item value="single-day">
            <Accordion.Trigger>
               <div class="text-left">
                  <div class="text-sm font-bold md:text-base">
                     Total {dateRangeText ? dateRangeText + " : " : ""}
                  </div>
                  <div class="text-lg font-bold md:text-xl text-primary">
                     Rp {totalAmount.toLocaleString("id-ID")}
                  </div>
               </div>
            </Accordion.Trigger>
            <Accordion.Content class="flex flex-col gap-4">
               {#each data.data as item}
                  {@const convertedDateTime = convertToTimezone(
                     item.waktu_transaksi,
                     $globalState.timezone
                  )}
                  {@const formattedDateTime =
                     convertedDateTime.toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                     }) +
                     " " +
                     convertedDateTime.toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                     }) +
                     " " +
                     $globalState.timezone}
                  <CardTransaksi
                     tanggal={formattedDateTime}
                     nominal={item.total_tagihan}
                     keterangan={item.keterangan}
                  />
               {/each}
            </Accordion.Content>
         </Accordion.Item>
      {/if}
   </Accordion.Root>
{/if}
