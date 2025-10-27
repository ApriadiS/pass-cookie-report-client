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
         const response = await fetch(`${API_BASE_URL}/force-refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cookie: $globalState.cookie }),
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
   <Dialog.Content>
      <Dialog.Header>
         <Dialog.Title>Perbarui Data Server</Dialog.Title>
         <Dialog.Description>
            Proses ini akan memakan waktu beberapa saat karena server perlu mengambil data terbaru dari database.
            Halaman akan dimuat ulang setelah selesai.
         </Dialog.Description>
      </Dialog.Header>
      <Dialog.Footer>
         <Button variant="outline" onclick={() => (open = false)} disabled={isRefreshing}>
            Batal
         </Button>
         <Button onclick={handleRefresh} disabled={isRefreshing}>
            {isRefreshing ? "Memperbarui..." : "Perbarui Sekarang"}
         </Button>
      </Dialog.Footer>
   </Dialog.Content>
</Dialog.Root>
