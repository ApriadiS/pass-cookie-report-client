<script lang="ts">
   import CalendarIcon from "@lucide/svelte/icons/calendar";
   import {
      type DateValue,
      DateFormatter,
      getLocalTimeZone,
   } from "@internationalized/date";
   import { cn } from "$lib/utils.js";
   import { Button } from "$lib/components/ui/button/index.js";
   import { Calendar } from "$lib/components/ui/calendar/index.js";
   import * as Dialog from "$lib/components/ui/dialog/index.js";

   const df = new DateFormatter("en-US", {
      dateStyle: "long",
   });

   let {
      value = $bindable<DateValue>(),
      min = undefined,
      disabled = false,
   } = $props();

   let open = $state(false);

   // Fungsi untuk mendisable tanggal sebelum min
   function disableDate(date: DateValue) {
      if (!min) return false;
      return date.compare(min) < 0;
   }

   // Auto-close ketika tanggal dipilih
   $effect(() => {
      if (value) {
         open = false;
      }
   });
</script>

<Button
   variant="outline"
   class={cn(
      "w-full md:w-[280px] h-11 md:h-10 justify-start text-left font-normal text-xs md:text-sm",
      !value && "text-muted-foreground"
   )}
   {disabled}
   onclick={() => (open = true)}
>
   <CalendarIcon class="mr-2 size-4" />
   {value ? df.format(value.toDate(getLocalTimeZone())) : "Select a date"}
</Button>

<Dialog.Root bind:open>
   <Dialog.Content class="flex flex-col justify-center p-4">
      <Dialog.Header>
         <Dialog.Title class="text-base">Pilih Tanggal</Dialog.Title>
      </Dialog.Header>
      <div class="flex justify-center">
         <Calendar
            bind:value
            type="single"
            initialFocus
            isDateDisabled={disableDate}
            {disabled}
            class="text-sm"
         />
      </div>
   </Dialog.Content>
</Dialog.Root>
