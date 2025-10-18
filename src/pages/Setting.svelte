<script lang="ts">
   import * as Card from "$lib/components/ui/card/index.js";
   import {
      globalState,
      setCookie,
      setTheme,
      setTimezone,
   } from "$lib/setting.js";
   import { Label } from "$lib/components/ui/label";
   import { Textarea } from "$lib/components/ui/textarea";
   import { Button } from "$lib/components/ui/button";
   import { Switch } from "$lib/components/ui/switch";
   import { toast } from "svelte-sonner";
   import QuerySettings from "$lib/components/query-settings.svelte";

   let isDark = $state($globalState.theme === "dark");
   let cookieValue = $state($globalState.cookie);
   let selectedTimezone = $state($globalState.timezone);

   function handleSubmit(e: Event) {
      e.preventDefault();
      setTheme(isDark ? "dark" : "light");
      setCookie(cookieValue);
      setTimezone(selectedTimezone);

      const now = new Date();
      const dateStr = now.toLocaleDateString("id-ID", {
         weekday: "long",
         year: "numeric",
         month: "long",
         day: "numeric",
      });
      const timeStr = now.toLocaleTimeString("id-ID", {
         hour12: false,
         hour: "2-digit",
         minute: "2-digit",
      });

      toast.success("Pengaturan berhasil disimpan", {
         description: `${dateStr} ${timeStr}`,
         action: {
            label: "Close",
            onClick: () => toast.dismiss(),
         },
      });
   }
</script>

<Card.Root class="w-full max-w-md mx-auto mt-8 md:max-w-lg lg:max-w-xl">
   <Card.Header>
      <Card.Title>Pengaturan Aplikasi</Card.Title>
      <Card.Description
         >Sesuaikan mode, timezone, cookie, dan query Anda.</Card.Description
      >
   </Card.Header>
   <Card.Content>
      <form class="space-y-6" onsubmit={handleSubmit}>
         <div class="flex items-center gap-4">
            <Label for="mode">Mode: {isDark ? "Dark" : "Light"}</Label>
            <Switch id="mode" bind:checked={isDark} />
         </div>
         <div class="space-y-2">
            <Label for="timezone">Timezone</Label>
            <select
               id="timezone"
               bind:value={selectedTimezone}
               class="w-full p-2 border rounded"
            >
               <option value="WIB">WIB (Waktu Indonesia Barat)</option>
               <option value="WITA">WITA (Waktu Indonesia Tengah)</option>
               <option value="WIT">WIT (Waktu Indonesia Timur)</option>
            </select>
         </div>
         <div class="space-y-2">
            <Label for="cookie">Token</Label>
            <Textarea
               id="cookie"
               bind:value={cookieValue}
               rows={4}
               placeholder="Masukkan cookie..."
            />
         </div>
         <QuerySettings />
         <Card.Footer class="flex justify-end">
            <Button type="submit">Simpan</Button>
         </Card.Footer>
      </form>
   </Card.Content>
</Card.Root>
