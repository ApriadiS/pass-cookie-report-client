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

<div class="w-full max-w-6xl mx-auto">
   <Tabs.Root value="laporan">
      <Tabs.List>
         <Tabs.Trigger value="laporan">Laporan</Tabs.Trigger>
         <Tabs.Trigger value="query">Query</Tabs.Trigger>
      </Tabs.List>
      
      <Tabs.Content value="laporan">
         <div class="flex justify-end mb-4">
            <Button variant="outline" size="sm" onclick={() => (showRefreshModal = true)}>
               <RefreshCwIcon class="w-4 h-4 mr-2" />
               Perbarui Data Server
            </Button>
         </div>
         <div class="grid w-full grid-cols-3 gap-4">
            <div class="col-span-3 space-y-4 w-full gap-0.5 md:col-span-3">
               <FieldTransaksi bind:this={fieldTransaksiRef} />
            </div>
         </div>
      </Tabs.Content>
      
      <Tabs.Content value="query">
         <div class="space-y-4">
            <Card.Root>
               <Card.Header>
                  <Card.Title>Pengaturan Query</Card.Title>
                  <Card.Description>
                     Atur query untuk transaksi online dan offline
                  </Card.Description>
               </Card.Header>
               <Card.Content>
                  <QuerySettings onQueryChange={handleQueryChange} />
               </Card.Content>
            </Card.Root>

         </div>
      </Tabs.Content>
   </Tabs.Root>
</div>

<RefreshDataModal bind:open={showRefreshModal} />
