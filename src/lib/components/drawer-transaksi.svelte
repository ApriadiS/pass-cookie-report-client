<script lang="ts">
   import * as Drawer from "$lib/components/ui/drawer/index.js";
   import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
   import { MediaQuery } from "svelte/reactivity";
   import * as Dialog from "$lib/components/ui/dialog/index.js";
   import { Input } from "$lib/components/ui/input/index.js";
   import { Label } from "$lib/components/ui/label/index.js";
   import { Trigger } from "./ui/tooltip";

   const { children, id } = $props();

   let open = $state(false);
   const isDesktop = new MediaQuery("(min-width: 768px)");
</script>

{#if isDesktop.current}
   <Dialog.Root bind:open>
      <Dialog.Trigger>{@render children?.()}</Dialog.Trigger>
      <Dialog.Content>
         <Dialog.Header>
            <Dialog.Title>Edit profile</Dialog.Title>
            <Dialog.Description>
               Make changes to your profile here. Click save when you're done.
            </Dialog.Description>
         </Dialog.Header>
         <form class="grid items-start gap-4">
            <div class="grid gap-2">
               <Label for="email-{id}">Email</Label>
               <Input type="email" id="email-{id}" value="shadcn@example.com" />
            </div>
            <div class="grid gap-2">
               <Label for="username-{id}">Username</Label>
               <Input id="username-{id}" value="@shadcn" />
            </div>
            <Button type="submit">Save changes</Button>
         </form>
      </Dialog.Content>
   </Dialog.Root>
{:else}
   <Drawer.Root bind:open>
      <Drawer.Trigger>{@render children?.()}</Drawer.Trigger>
      <Drawer.Content>
         <Drawer.Header>
            <Drawer.Title>Are you sure absolutely sure?</Drawer.Title>
            <Drawer.Description
               >This action cannot be undone.</Drawer.Description
            >
         </Drawer.Header>
         <div class="px-4">
            <p class="text-sm text-muted-foreground">
               This action cannot be undone. This will permanently delete your
               account and remove your data from our servers.
            </p>
         </div>
         <Drawer.Footer>
            <Button>Submit</Button>
            <Drawer.Close>Cancel</Drawer.Close>
         </Drawer.Footer>
      </Drawer.Content>
   </Drawer.Root>
{/if}
