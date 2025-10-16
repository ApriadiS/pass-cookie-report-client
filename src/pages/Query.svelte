<script lang="ts">
   import * as Card from "$lib/components/ui/card/index.js";

   import { Label } from "$lib/components/ui/label";
   import { Textarea } from "$lib/components/ui/textarea";
   import { Button } from "$lib/components/ui/button";
   import { Switch } from "$lib/components/ui/switch";

   let queryOnline = "";
   let queryOffline = "";
</script>

<Card.Root class="w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto mt-8">
   <Card.Header>
      <Card.Title>Pengaturan Query Data</Card.Title>
      <Card.Description
         >Sesuaikan mode dan masukkan query Anda.</Card.Description
      >
   </Card.Header>
   <Card.Content>
      <form class="space-y-6">
         <div class="space-y-2">
            <Label for="mode">Query Transaksi Online:</Label>
            <Textarea
               id="query-online"
               bind:value={queryOnline}
               rows={4}
               placeholder="Masukkan query online..."
            />
         </div>
         <div class="space-y-2">
            <Label for="mode">Query Transaksi Offline:</Label>
            <Textarea
               id="query-offline"
               bind:value={queryOffline}
               rows={4}
               placeholder="Masukkan query offline..."
            />
         </div>
         <Card.Footer class="flex justify-end">
            <Button type="submit">Simpan</Button>
         </Card.Footer>
      </form>
   </Card.Content>
</Card.Root>
