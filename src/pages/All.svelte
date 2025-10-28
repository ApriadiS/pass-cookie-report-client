<script lang="ts">
   import * as Tabs from "$lib/components/ui/tabs/index.js";
   import * as Card from "$lib/components/ui/card/index.js";
   import { Button } from "$lib/components/ui/button/index.js";
   import FieldTransaksi from "$lib/components/field-transaksi.svelte";
   import QuerySettings from "$lib/components/query-settings.svelte";
   import RefreshDataModal from "$lib/components/RefreshDataModal.svelte";
   import RefreshCwIcon from "@lucide/svelte/icons/refresh-cw";

   let fieldTransaksiRef: FieldTransaksi;
   let showRefreshModal = $state(false);

   function handleQueryChange() {
      // Trigger reclassification in FieldTransaksi component
      fieldTransaksiRef?.reclassifyData?.();
   }


</script>

<div class="w-full max-w-6xl mx-auto p-3 md:p-0">
   <Tabs.Root value="laporan">
      <Tabs.List class="w-full h-11 md:h-10">
         <Tabs.Trigger value="laporan" class="flex-1 text-xs md:text-sm">Laporan</Tabs.Trigger>
         <Tabs.Trigger value="query" class="flex-1 text-xs md:text-sm">Query</Tabs.Trigger>
      </Tabs.List>
      
      <Tabs.Content value="laporan" class="mt-3 md:mt-6">
         <div class="flex justify-end mb-3 md:mb-4">
            <Button variant="outline" size="sm" onclick={() => (showRefreshModal = true)} class="h-11 px-3 text-xs md:h-9 md:px-4 md:text-sm">
               <RefreshCwIcon class="w-3 h-3 mr-1 md:w-4 md:h-4 md:mr-2" />
               <span class="hidden sm:inline">Perbarui Data Server</span>
               <span class="sm:hidden">Perbarui</span>
            </Button>
         </div>
         <div class="grid w-full grid-cols-3 gap-3 md:gap-4">
            <div class="col-span-3 space-y-3 w-full md:space-y-4 md:col-span-3">
               <FieldTransaksi bind:this={fieldTransaksiRef} />
            </div>
         </div>
      </Tabs.Content>
      
      <Tabs.Content value="query" class="mt-3 md:mt-6">
         <div class="space-y-3 md:space-y-4">
            <Card.Root>
               <Card.Header class="p-3 md:p-6">
                  <Card.Title class="text-sm md:text-base">Pengaturan Query</Card.Title>
                  <Card.Description class="text-xs md:text-sm">
                     Atur query untuk transaksi online dan offline
                  </Card.Description>
               </Card.Header>
               <Card.Content class="p-3 md:p-6">
                  <QuerySettings onQueryChange={handleQueryChange} />
               </Card.Content>
            </Card.Root>

         </div>
      </Tabs.Content>
   </Tabs.Root>
</div>

<RefreshDataModal bind:open={showRefreshModal} />
