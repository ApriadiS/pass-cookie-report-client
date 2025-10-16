<script lang="ts">
   import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
   import * as Sidebar from "$lib/components/ui/sidebar/index.js";
   import GalleryVerticalEndIcon from "@lucide/svelte/icons/gallery-vertical-end";
</script>

<Sidebar.Menu>
   <Sidebar.MenuItem>
      <DropdownMenu.Root>
         <DropdownMenu.Trigger>
            {#snippet child({ props })}
               <Sidebar.MenuButton
                  size="lg"
                  class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  {...props}
               >
                  <div
                     class="flex items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground aspect-square size-8"
                  >
                     <img
                        src="https://kasir.doran.id/favicon_.png"
                        alt="Report Icon"
                        width="24"
                        height="24"
                        loading="lazy"
                     />
                  </div>
                  <div class="flex flex-col gap-0.5 leading-none">
                     <span class="font-semibold">Report</span>
                  </div>
               </Sidebar.MenuButton>
            {/snippet}
         </DropdownMenu.Trigger>
      </DropdownMenu.Root>
   </Sidebar.MenuItem>
</Sidebar.Menu>
