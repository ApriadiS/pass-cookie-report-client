<script lang="ts">
   import * as Dialog from "$lib/components/ui/dialog/index.js";
   import { Button } from "$lib/components/ui/button/index.js";
   import { Input } from "$lib/components/ui/input/index.js";
   import { Label } from "$lib/components/ui/label/index.js";
   import { toast } from "svelte-sonner";
   import { globalState, setCookie } from "$lib/setting";
   import { performLogin, setAuthenticating } from "$lib/apiClient";

   const API_BASE_URL =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

   let { open = $bindable(false), pollingInterval = $bindable(null) } =
      $props();
   let username = $state("");
   let password = $state("");
   let isLoading = $state(false);

   async function handleLogin() {
      if (!username || !password) {
         toast.error("Username dan password harus diisi");
         return;
      }

      isLoading = true;
      try {
         // Use API client for login
         const cookie = await performLogin(username, password);
         
         console.log("[LOGIN] Login successful, saving cookie");

         // Save cookie to globalState and localStorage FIRST
         setCookie(cookie);
         localStorage.setItem("cookie", cookie);
         
         // Force reload globalState to use new cookie
         globalState.set({ ...$globalState, cookie });

         // Wait a tick to ensure cookie is saved
         await new Promise(resolve => setTimeout(resolve, 100));

         console.log("[LOGIN] Cookie saved, closing modal");
         toast.success("Login berhasil!");

         // Close modal FIRST
         open = false;
         username = "";
         password = "";

         // Clear polling if exists
         if (pollingInterval) {
            clearInterval(pollingInterval);
            pollingInterval = null;
         }

         // Notify API client that auth is complete LAST
         // This will trigger retry with new cookie
         console.log("[LOGIN] Notifying auth complete");
         setAuthenticating(false);
      } catch (error: any) {
         console.error("[LOGIN] Error:", error);
         toast.error(error.message || "Login gagal");
         setAuthenticating(false);
      } finally {
         isLoading = false;
      }
   }
</script>

<Dialog.Root bind:open>
   <Dialog.Content class="w-[calc(100%-2rem)] max-w-[425px] p-4 md:p-6">
      <Dialog.Header class="space-y-2">
         <Dialog.Title class="text-base md:text-lg">Login Required</Dialog.Title>
         <Dialog.Description class="text-xs md:text-sm">
            Sesi Anda telah berakhir. Silakan login kembali.
         </Dialog.Description>
      </Dialog.Header>
      {#if isLoading}
         <div class="flex flex-col items-center justify-center py-8">
            <div class="w-8 h-8 mb-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p class="text-sm text-muted-foreground mb-2">Sedang login...</p>
            <p class="text-xs text-muted-foreground text-center">Mohon tunggu, sistem sedang memverifikasi kredensial Anda</p>
         </div>
      {:else}
         <div class="grid gap-4 py-4">
            <div class="grid gap-2">
               <Label for="username" class="text-xs md:text-sm">Username</Label>
               <Input
                  id="username"
                  type="text"
                  bind:value={username}
                  placeholder="Masukkan username"
                  class="h-11 text-sm md:h-10"
               />
            </div>
            <div class="grid gap-2">
               <Label for="password" class="text-xs md:text-sm">Password</Label>
               <Input
                  id="password"
                  type="password"
                  bind:value={password}
                  placeholder="Masukkan password"
                  class="h-11 text-sm md:h-10"
                  onkeydown={(e) => {
                     if (e.key === "Enter") handleLogin();
                  }}
               />
            </div>
         </div>
         <Dialog.Footer class="flex-col gap-2 sm:flex-row">
            <Button onclick={handleLogin} class="h-11 w-full text-sm md:h-10 md:w-auto">
               Login
            </Button>
         </Dialog.Footer>
      {/if}
   </Dialog.Content>
</Dialog.Root>

<style>
   :global([data-state="open"]) {
      backdrop-filter: blur(4px);
   }
</style>
