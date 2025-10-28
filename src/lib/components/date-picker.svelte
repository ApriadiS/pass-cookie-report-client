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
   import * as Popover from "$lib/components/ui/popover/index.js";

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
      // diasumsikan date dan min bertipe DateValue dan punya method compare
      return date.compare(min) < 0;
   }

   // Auto-close ketika tanggal dipilih
   $effect(() => {
      if (value) {
         open = false;
      }
   });
</script>

<Popover.Root bind:open>
   <Popover.Trigger>
      {#snippet child({ props })}
         <Button
            variant="outline"
            class={cn(
               "w-full md:w-[280px] h-11 md:h-10 justify-start text-left font-normal text-xs md:text-sm",
               !value && "text-muted-foreground"
            )}
            {disabled}
            {...props}
         >
            <CalendarIcon class="mr-2 size-4" />
            {value
               ? df.format(value.toDate(getLocalTimeZone()))
               : "Select a date"}
         </Button>
      {/snippet}
   </Popover.Trigger>
   <Popover.Content class="w-auto p-0 max-w-[calc(100vw-2rem)]">
      <Calendar
         bind:value
         type="single"
         initialFocus
         isDateDisabled={disableDate}
         {disabled}
         class="text-sm md:text-base"
      />
   </Popover.Content>
</Popover.Root>
