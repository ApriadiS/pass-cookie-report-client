<script lang="ts">
   import * as Card from "$lib/components/ui/card/index.js";
   import { Label } from "$lib/components/ui/label";
   import { Textarea } from "$lib/components/ui/textarea";
   import { Button } from "$lib/components/ui/button";
   import { Switch } from "$lib/components/ui/switch";
   import { Input } from "$lib/components/ui/input/index.js";

   const {
      tanggal,
      nominal,
      keterangan,
   }: { tanggal: string; nominal: number; keterangan: string } = $props();

   function formatCurrency(num: number) {
      return new Intl.NumberFormat("id-ID", {
         style: "currency",
         currency: "IDR",
      }).format(num);
   }
</script>

<Card.Root class="w-full max-w-md mx-auto md:max-w-lg lg:max-w-xl">
   <Card.Header>
      <Card.Title>
         <div class="flex flex-row justify-between">
            <span>Total Transaksi</span>
            <span>{tanggal}</span>
         </div>
      </Card.Title>
      <Card.Description class="text-left"
         >{formatCurrency(nominal)}</Card.Description
      >
   </Card.Header>
   <Card.Content class="flex flex-row justify-between gap-4">
      <div class="flex flex-col gap-2">
         <Label for="keterangan">Keterangan: {keterangan}</Label>
      </div>
   </Card.Content>
</Card.Root>
