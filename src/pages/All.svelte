<script lang="ts">
   import Card from "$lib/components/card-transaksi.svelte";
   import FieldTransaksi from "$lib/components/field-transaksi.svelte";
</script>

<h1 class="text-2xl font-bold">Offline Page</h1>
<div class="grid w-full grid-cols-3 gap-4">
   <div class="col-span-3 space-y-4 w-full gap-0.5 md:col-span-3">
      <FieldTransaksi />
   </div>
</div>
