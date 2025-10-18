<script lang="ts">
   import { Label } from "$lib/components/ui/label";
   import { Textarea } from "$lib/components/ui/textarea";
   import { Button } from "$lib/components/ui/button";
   import { globalState, setQueries } from "$lib/setting.js";
   import { toast } from "svelte-sonner";

   let queryOnline = $state($globalState.queryOnline);
   let queryOffline = $state($globalState.queryOffline);

   // Props untuk callback ketika query berubah
   let { onQueryChange } = $props<{ onQueryChange?: () => void }>();

   function handleSave() {
      setQueries(queryOnline, queryOffline);
      
      // Trigger callback jika ada (untuk re-classify data)
      onQueryChange?.();
      
      const now = new Date();
      const timeStr = now.toLocaleTimeString("id-ID", {
         hour12: false,
         hour: "2-digit",
         minute: "2-digit",
      });

      toast.success("Query berhasil disimpan", {
         description: `Data akan diorganisir ulang sesuai query baru`,
      });
   }
</script>

<div class="space-y-6">
   <div class="space-y-2">
      <Label for="query-online">Query Transaksi Online</Label>
      <Textarea
         id="query-online"
         bind:value={queryOnline}
         rows={4}
         placeholder="Masukkan query online..."
      />
   </div>
   <div class="space-y-2">
      <Label for="query-offline">Query Transaksi Offline</Label>
      <Textarea
         id="query-offline"
         bind:value={queryOffline}
         rows={4}
         placeholder="Masukkan query offline..."
      />
   </div>
   <div class="flex justify-end">
      <Button onclick={handleSave}>Simpan Query</Button>
   </div>
</div>