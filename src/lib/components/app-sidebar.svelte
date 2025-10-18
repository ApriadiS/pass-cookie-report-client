<script lang="ts" module>
   // sample data
   const data = {
      navMain: [
         {
            title: "Laporan Offline - Online",
            items: [
               {
                  title: "Dashboard",
                  url: "/",
               },
               {
                  title: "Semua Laporan",
                  url: "/all",
               },
            ],
         },
         {
            title: "Configurations",
            items: [
               {
                  title: "Settings",
                  url: "/setting",
               },
            ],
         },
      ],
   };
</script>

<script lang="ts">
   import { navigate } from "$lib/routing";
   import Title from "./version-switcher.svelte";
   import * as Sidebar from "$lib/components/ui/sidebar/index.js";
   import { useSidebar } from "$lib/components/ui/sidebar/context.svelte.js";
   import type { ComponentProps } from "svelte";
   let {
      ref = $bindable(null),
      ...restProps
   }: ComponentProps<typeof Sidebar.Root> = $props();
   
   const sidebar = useSidebar();
</script>

<Sidebar.Root {...restProps} bind:ref>
   <Sidebar.Header>
      <Title />
   </Sidebar.Header>
   <Sidebar.Content>
      <!-- We create a Sidebar.Group for each parent. -->
      {#each data.navMain as group (group.title)}
         <Sidebar.Group>
            <Sidebar.GroupLabel>{group.title}</Sidebar.GroupLabel>
            <Sidebar.GroupContent>
               <Sidebar.Menu>
                  {#each group.items as item (item.title)}
                     <Sidebar.MenuItem>
                        <Sidebar.MenuButton>
                           {#snippet child({ props })}
                              <a
                                 href={item.url}
                                 {...props}
                                 onclick={(e) => {
                                    e.preventDefault();
                                    // Ambil nama page tanpa slash dan pastikan sesuai tipe Page
                                    const page = item.url.replace("/", "");
                                    navigate(page as any);
                                    // Auto-close sidebar di mobile setelah navigasi
                                    if (sidebar.isMobile) {
                                       sidebar.setOpenMobile(false);
                                    }
                                 }}>{item.title}</a
                              >
                           {/snippet}
                        </Sidebar.MenuButton>
                     </Sidebar.MenuItem>
                  {/each}
               </Sidebar.Menu>
            </Sidebar.GroupContent>
         </Sidebar.Group>
      {/each}
   </Sidebar.Content>
   <Sidebar.Rail />
</Sidebar.Root>
