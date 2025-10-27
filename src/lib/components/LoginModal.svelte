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
         
         console.log("[LOGIN] Login successful");
         toast.success("Login berhasil!");

         // Save cookie to globalState and localStorage
         setCookie(cookie);
         localStorage.setItem("cookie", cookie);
         
         // Force reload globalState to use new cookie
         globalState.set({ ...$globalState, cookie });

         // Notify API client that auth is complete
         setAuthenticating(false);

         // Close modal
         open = false;
         username = "";
         password = "";

         // Clear polling if exists
         if (pollingInterval) {
            clearInterval(pollingInterval);
            pollingInterval = null;
         }

         // No need to reload - auth callback will retry request
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
   <Dialog.Content class="sm:max-w-[425px]">
      <Dialog.Header>
         <Dialog.Title>Login Required</Dialog.Title>
         <Dialog.Description>
            Sesi Anda telah berakhir. Silakan login kembali.
         </Dialog.Description>
      </Dialog.Header>
      <div class="grid gap-4 py-4">
         <div class="grid gap-2">
            <Label for="username">Username</Label>
            <Input
               id="username"
               type="text"
               bind:value={username}
               placeholder="Masukkan username"
               disabled={isLoading}
            />
         </div>
         <div class="grid gap-2">
            <Label for="password">Password</Label>
            <Input
               id="password"
               type="password"
               bind:value={password}
               placeholder="Masukkan password"
               disabled={isLoading}
               onkeydown={(e) => {
                  if (e.key === "Enter") handleLogin();
               }}
            />
         </div>
      </div>
      <Dialog.Footer>
         <Button onclick={handleLogin} disabled={isLoading}>
            {isLoading ? "Loading..." : "Login"}
         </Button>
      </Dialog.Footer>
   </Dialog.Content>
</Dialog.Root>

<style>
   :global([data-state="open"]) {
      backdrop-filter: blur(4px);
   }
</style>
