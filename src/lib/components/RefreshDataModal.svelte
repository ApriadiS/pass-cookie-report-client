<script lang="ts">
   import * as Dialog from "$lib/components/ui/dialog/index.js";
   import { Button } from "$lib/components/ui/button/index.js";
   import { toast } from "svelte-sonner";
   import { globalState } from "$lib/setting";

   let { open = $bindable(false) } = $props();

   const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

   let isRefreshing = $state(false);

   async function handleRefresh() {
      isRefreshing = true;
      
      try {
         // Get current month date range
         const now = new Date();
         const year = now.getFullYear();
         const month = now.getMonth() + 1;
         const day = now.getDate();
         const from = `01/${month.toString().padStart(2, '0')}/${year}`;
         const to = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
         
         const response = await fetch(`${API_BASE_URL}/force-refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
               from,
               to,
               cookie: $globalState.cookie 
            }),
         });

         const result = await response.json();

         if (result.success) {
            toast.success("Data berhasil diperbarui", {
               description: "Server telah mengambil data terbaru dari database",
            });
            open = false;
            // Reload page after 1 second
            setTimeout(() => window.location.reload(), 1000);
         } else {
            toast.error("Gagal memperbarui data", {
               description: result.message || "Terjadi kesalahan",
            });
         }
      } catch (error) {
         console.error("Error refreshing data:", error);
         toast.error("Gagal memperbarui data", {
            description: "Terjadi kesalahan saat menghubungi server",
         });
      } finally {
         isRefreshing = false;
      }
   }
</script>

<Dialog.Root bind:open>
   <Dialog.Content class="w-[calc(100%-2rem)] max-w-[425px] p-4 md:p-6">
      <Dialog.Header class="space-y-2">
         <Dialog.Title class="text-base md:text-lg">Perbarui Data Server</Dialog.Title>
         <Dialog.Description class="text-xs md:text-sm">
            Proses ini akan memakan waktu beberapa saat karena server perlu mengambil data terbaru dari database.
            Halaman akan dimuat ulang setelah selesai.
         </Dialog.Description>
      </Dialog.Header>
      <Dialog.Footer class="flex-col gap-2 sm:flex-row">
         <Button variant="outline" onclick={() => (open = false)} disabled={isRefreshing} class="h-11 w-full text-sm md:h-10 md:w-auto">
            Batal
         </Button>
         <Button onclick={handleRefresh} disabled={isRefreshing} class="h-11 w-full text-sm md:h-10 md:w-auto">
            {isRefreshing ? "Memperbarui..." : "Perbarui Sekarang"}
         </Button>
      </Dialog.Footer>
   </Dialog.Content>
</Dialog.Root>
