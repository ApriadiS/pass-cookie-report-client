<script lang="ts">
   import * as Alert from "$lib/components/ui/alert/index.js";
   import CheckCircle2Icon from "@lucide/svelte/icons/check-circle-2";
   import AlertCircleIcon from "@lucide/svelte/icons/alert-circle";
   import PopcornIcon from "@lucide/svelte/icons/popcorn";
</script>

<div class="grid items-start w-full max-w-xl gap-4">
   <Alert.Root>
      <CheckCircle2Icon />
      <Alert.Title>Success! pengaturan berhasil disimpan</Alert.Title>
   </Alert.Root>
</div>
