<script lang="ts">
   import { Button } from "$lib/components/ui/button/index.js";
   import { Badge } from "$lib/components/ui/badge/index.js";
   import { Separator } from "$lib/components/ui/separator/index.js";
   import RefreshCw from "@lucide/svelte/icons/refresh-cw";
   import Database from "@lucide/svelte/icons/database";
   import AlertTriangle from "@lucide/svelte/icons/alert-triangle";
   import { forceEmptyData, forceRefreshData, setAuthenticating } from "$lib/apiClient";
   import LoginModal from "$lib/components/LoginModal.svelte";
   import type { DateValue } from "@internationalized/date";
   import { toast } from "svelte-sonner";

   let { fromDate, toDate, onDataUpdate }: {
      fromDate: DateValue | undefined;
      toDate: DateValue | undefined;
      onDataUpdate: (data: any) => void;
   } = $props();

   let isForceEmptyLoading = $state(false);
   let isForceRefreshLoading = $state(false);
   let showLoginModal = $state(false);

   async function handleForceEmpty() {
      if (!fromDate || !toDate) {
         toast.error("Pilih rentang tanggal terlebih dahulu");
         return;
      }

      isForceEmptyLoading = true;
      try {
         toast.info("Mencari data kosong dan memaksa refresh...");
         const result = await forceEmptyData(fromDate, toDate, async () => {
            showLoginModal = true;
            setAuthenticating(true);
         });
         onDataUpdate(result);
         toast.success("Data berhasil diperbarui (force empty)");
      } catch (error) {
         console.error("Force empty error:", error);
         toast.error("Gagal memperbarui data");
      } finally {
         isForceEmptyLoading = false;
      }
   }

   async function handleForceRefresh() {
      if (!fromDate || !toDate) {
         toast.error("Pilih rentang tanggal terlebih dahulu");
         return;
      }

      isForceRefreshLoading = true;
      try {
         toast.info("Memaksa refresh semua data dari database...");
         const result = await forceRefreshData(fromDate, toDate, async () => {
            showLoginModal = true;
            setAuthenticating(true);
         });
         onDataUpdate(result);
         toast.success("Data berhasil diperbarui (force refresh)");
      } catch (error) {
         console.error("Force refresh error:", error);
         toast.error("Gagal memperbarui data");
      } finally {
         isForceRefreshLoading = false;
      }
   }
</script>

<div class="flex flex-col gap-3 p-4 border rounded-lg bg-muted/50">
   <div class="flex items-center gap-2">
      <Database class="w-4 h-4" />
      <span class="text-sm font-medium">Advanced Data Actions</span>
   </div>
   
   <div class="flex flex-col gap-2 text-xs text-muted-foreground">
      <div class="flex items-center gap-2">
         <Badge variant="outline" class="text-xs">Force Empty</Badge>
         <span>Cari data kosong dan paksa refresh dari database</span>
      </div>
      <div class="flex items-center gap-2">
         <Badge variant="outline" class="text-xs">Force Refresh</Badge>
         <span>Paksa refresh semua data, timpa cache yang ada</span>
      </div>
   </div>

   <Separator />

   <div class="flex gap-2">
      <Button
         variant="outline"
         size="sm"
         class="flex-1"
         disabled={isForceEmptyLoading || isForceRefreshLoading}
         onclick={handleForceEmpty}
      >
         {#if isForceEmptyLoading}
            <RefreshCw class="w-3 h-3 mr-2 animate-spin" />
         {:else}
            <AlertTriangle class="w-3 h-3 mr-2" />
         {/if}
         Force Empty
      </Button>

      <Button
         variant="outline"
         size="sm"
         class="flex-1"
         disabled={isForceEmptyLoading || isForceRefreshLoading}
         onclick={handleForceRefresh}
      >
         {#if isForceRefreshLoading}
            <RefreshCw class="w-3 h-3 mr-2 animate-spin" />
         {:else}
            <RefreshCw class="w-3 h-3 mr-2" />
         {/if}
         Force Refresh
      </Button>
   </div>
</div>

<LoginModal bind:open={showLoginModal} />