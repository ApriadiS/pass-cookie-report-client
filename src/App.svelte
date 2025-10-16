<script lang="ts">
   import AppSidebar from "$lib/components/app-sidebar.svelte";
   import BreadcrumbSeparator from "$lib/components/ui/breadcrumb/breadcrumb-separator.svelte";
   import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
   import { Separator } from "$lib/components/ui/separator/index.js";
   import * as Sidebar from "$lib/components/ui/sidebar/index.js";

   import { currentPage, initRouting } from "$lib/routing";
   import { globalState } from "$lib/setting";
   import { onMount } from "svelte";
   import All from "./pages/All.svelte";
   import Setting from "./pages/Setting.svelte";
   import Dashboard from "./pages/Dashboard.svelte";
   import Label from "$lib/components/ui/label/label.svelte";
   import { Toaster } from "svelte-sonner";

   onMount(() => {
      initRouting();
   });

   $effect(() => {
      document.documentElement.classList.toggle(
         "dark",
         $globalState.theme === "dark"
      );
   });
</script>

<Sidebar.Provider>
   <AppSidebar />
   <Sidebar.Inset>
      <header class="flex items-center h-16 gap-2 px-4 border-b shrink-0">
         <Sidebar.Trigger class="-ml-1" />
         <Separator orientation="vertical" class="h-4 mr-2" />
         <Breadcrumb.Root>
            <Breadcrumb.List>
               <Breadcrumb.Item>
                  <Label
                     class="text-lg font-semibold text-black dark:text-white md:font-bold"
                     >Laporan Penjualan</Label
                  >
               </Breadcrumb.Item>
            </Breadcrumb.List>
         </Breadcrumb.Root>
      </header>
      <div class="flex flex-col flex-1 gap-4 p-4">
         {#if $currentPage === "dashboard"}
            <Dashboard />
         {:else if $currentPage === "all"}
            <All />
         {:else if $currentPage === "setting"}
            <Setting />
         {/if}
      </div>
   </Sidebar.Inset>
</Sidebar.Provider>

<Toaster />
