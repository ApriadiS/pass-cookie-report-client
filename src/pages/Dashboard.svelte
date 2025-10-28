<script lang="ts">
   import { AreaChart } from "layerchart";
   import TrendingUpIcon from "@lucide/svelte/icons/trending-up";
   import TrendingDownIcon from "@lucide/svelte/icons/trending-down";
   import * as Chart from "$lib/components/ui/chart/index.js";
   import * as Card from "$lib/components/ui/card/index.js";
   import {
      fetchData,
      startFetch,
      checkAuthStatus,
      setAuthenticating,
      clearPendingRequests,
   } from "$lib/apiClient";
   import type { TransaksiResponse, NestedTransaksiResponse } from "$lib/api";
   import { CalendarDate } from "@internationalized/date";
   import { toast } from "svelte-sonner";
   import { navigate, currentPage } from "$lib/routing";
   import { globalState } from "$lib/setting";
   import { aggregateChartData, type ChartPeriod } from "$lib/chart-aggregator";
   import { onMount } from "svelte";
   import { Button } from "$lib/components/ui/button/index.js";
   import LoginModal from "$lib/components/LoginModal.svelte";
   import RefreshDataModal from "$lib/components/RefreshDataModal.svelte";
   import RefreshCwIcon from "@lucide/svelte/icons/refresh-cw";

   const API_BASE_URL =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

   let showLoginModal = $state(false);
   let showRefreshModal = $state(false);

   const currentDate = new Date();
   const currentYear = currentDate.getFullYear();
   const currentMonth = currentDate.getMonth();
   const currentDay = currentDate.getDate();
   const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
   const monthName = currentDate.toLocaleDateString("id-ID", {
      month: "long",
      year: "numeric",
   });

   let transaksiData = $state<TransaksiResponse>({
      total_transaksi: 0,
      data: [],
   });
   let chartData = $state<
      {
         date: Date;
         umum: number;
         online: number;
         offline: number;
         conflict: number;
         label: string;
      }[]
   >([]);
   let totalAmount = $state(0);
   let avgDaily = $state(0);
   let selectedPeriod = $state<ChartPeriod>("harian");

   // Check if queries exist
   let hasQueries = $derived(
      $globalState.queryOnline.trim() || $globalState.queryOffline.trim()
   );

   const chartConfig = {
      umum: {
         label: "Umum",
         color: "var(--chart-1)",
         icon: TrendingUpIcon,
      },
      online: {
         label: "Online",
         color: "var(--chart-2)",
         icon: TrendingUpIcon,
      },
      offline: {
         label: "Offline",
         color: "var(--chart-3)",
         icon: TrendingUpIcon,
      },
      conflict: {
         label: "Conflict",
         color: "var(--chart-4)",
         icon: TrendingUpIcon,
      },
   } satisfies Chart.ChartConfig;

   let isLoading = $state(false);
   let pollingInterval = $state<ReturnType<typeof setInterval> | null>(null);

   // Load data ketika component mount
   onMount(() => {
      loadData();
   });

   async function loadData() {
      const cookie = $globalState.cookie;
      if (!cookie) {
         console.warn("No cookie available");
         showLoginModal = true;
         return;
      }

      if (isLoading) return;
      isLoading = true;

      try {
         console.log("Fetching data with cookie");

         // Create date range from 1st to today
         const fromDate = new CalendarDate(currentYear, currentMonth + 1, 1);
         const toDate = new CalendarDate(
            currentYear,
            currentMonth + 1,
            currentDay
         );

         // Try to get cached data first with auth callback
         const result = await fetchData(
            fromDate,
            toDate,
            "data-cached",
            async () => {
               // Auth required callback
               showLoginModal = true;
               setAuthenticating(true);
               // Wait for modal to close (user logged in)
               await new Promise<void>((resolve) => {
                  const unsubscribe = $effect.root(() => {
                     $effect(() => {
                        if (!showLoginModal) {
                           unsubscribe();
                           resolve();
                        }
                     });
                  });
               });
            }
         );

         // Handle different response types
         if (result.status === "processing") {
            // Start polling for job completion
            toast.info("Backend sedang mengambil data dari database", {
               description: "Menggunakan looping request pagination",
            });

            await startPolling(fromDate, toDate);
            return;
         }

         if (result.status === "not_found") {
            // Start background job
            toast.info("Backend sedang mengambil data dari database", {
               description: "Memulai looping request pagination",
            });

            await startFetch(fromDate, toDate, async () => {
               showLoginModal = true;
               setAuthenticating(true);
            });
            await startPolling(fromDate, toDate);
            return;
         }

         // Process successful data
         if (result.status === "completed" && "data" in result) {
            transaksiData = (result as NestedTransaksiResponse).data;
            processChartData((result as NestedTransaksiResponse).data.data);
         } else {
            // Fallback to empty data
            console.log("Invalid data format:", result);
            transaksiData = { total_transaksi: 0, data: [] };
            processChartData([]);
         }
      } catch (error) {
         console.error("Error fetching data:", error);
         toast.error("Gagal mengambil data", {
            description: "Terjadi kesalahan saat mengambil data transaksi",
         });
         processChartData([]);
      } finally {
         isLoading = false;
      }
   }

   async function startPolling(fromDate: CalendarDate, toDate: CalendarDate) {
      if (pollingInterval) clearInterval(pollingInterval);

      pollingInterval = setInterval(async () => {
         try {
            const result = await fetchData(
               fromDate,
               toDate,
               "data-cached",
               async () => {
                  clearInterval(pollingInterval!);
                  pollingInterval = null;
                  isLoading = false;
                  showLoginModal = true;
                  setAuthenticating(true);
               }
            );

            if (result.status === "completed") {
               clearInterval(pollingInterval!);
               pollingInterval = null;

               transaksiData = (result as NestedTransaksiResponse).data;
               processChartData((result as NestedTransaksiResponse).data.data);
               isLoading = false;

               toast.success("Data berhasil dimuat!", {
                  description: "Background job selesai",
               });
            } else if (result.status === "failed") {
               clearInterval(pollingInterval!);
               pollingInterval = null;
               isLoading = false;

               toast.error("Gagal memproses data", {
                  description: "Background job gagal",
               });
            }
         } catch (error) {
            console.error("Polling error:", error);
         }
      }, 2000); // Poll every 2 seconds
   }

   function processChartData(data: any[]) {
      if (!Array.isArray(data)) {
         console.error("processChartData received non-array:", data);
         return;
      }

      // Use optimized aggregation
      chartData = aggregateChartData(
         data,
         selectedPeriod,
         $globalState.queryOnline,
         $globalState.queryOffline,
         currentDate
      );

      totalAmount = data.reduce(
         (sum: number, item: any) => sum + item.total_tagihan,
         0
      );

      // Calculate average based on period
      const divisor =
         selectedPeriod === "harian"
            ? daysInMonth
            : selectedPeriod === "mingguan"
              ? 12
              : 12;
      avgDaily = Math.floor(totalAmount / divisor);
   }

   // Reprocess chart data when period changes
   $effect(() => {
      if (transaksiData.data.length > 0) {
         processChartData(transaksiData.data);
      }
   });

   // Cleanup polling interval ketika component unmount
   onMount(() => {
      return () => {
         if (pollingInterval) {
            clearInterval(pollingInterval);
            pollingInterval = null;
         }
         clearPendingRequests();
      };
   });
</script>

<div class="grid gap-2 p-2 md:gap-6 md:p-0">
   <div class="flex justify-end">
      <Button variant="outline" size="sm" onclick={() => (showRefreshModal = true)} class="h-11 px-3 text-xs md:h-9 md:px-4 md:text-sm">
         <RefreshCwIcon class="w-3 h-3 mr-1 md:w-4 md:h-4 md:mr-2" />
         <span class="hidden sm:inline">Perbarui Data Server</span>
         <span class="sm:hidden">Perbarui</span>
      </Button>
   </div>

   {#if isLoading}
      <div class="flex items-center justify-center p-8">
         <div class="text-center">
            <div
               class="w-8 h-8 mx-auto mb-2 border-b-2 rounded-full animate-spin border-primary"
            ></div>
            <p class="text-sm text-muted-foreground">
               Backend sedang mengambil data...
            </p>
         </div>
      </div>
   {/if}

   <div class="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-4 lg:grid-cols-4">
      <Card.Root>
         <Card.Header
            class="flex flex-row items-center justify-between p-2 pb-1 space-y-0 md:p-6 md:pb-2"
         >
            <Card.Title class="text-[11px] font-medium md:text-sm">Total Transaksi</Card.Title>
            <TrendingUpIcon class="w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
         </Card.Header>
         <Card.Content class="p-2 pt-0 md:p-6 md:pt-0">
            <div class="text-base font-bold md:text-2xl">
               Rp {(totalAmount / 1000000).toFixed(1)}M
            </div>
            <p class="text-[9px] md:text-xs text-muted-foreground truncate">{monthName}</p>
         </Card.Content>
      </Card.Root>

      <Card.Root>
         <Card.Header
            class="flex flex-row items-center justify-between p-2 pb-1 space-y-0 md:p-6 md:pb-2"
         >
            <Card.Title class="text-[11px] font-medium md:text-sm">Rata-rata Harian</Card.Title
            >
            <TrendingDownIcon class="w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
         </Card.Header>
         <Card.Content class="p-2 pt-0 md:p-6 md:pt-0">
            <div class="text-base font-bold md:text-2xl">
               Rp {(avgDaily / 1000).toFixed(0)}K
            </div>
            <p class="text-[9px] md:text-xs text-muted-foreground">Per hari</p>
         </Card.Content>
      </Card.Root>

      <Card.Root>
         <Card.Header
            class="flex flex-row items-center justify-between p-2 pb-1 space-y-0 md:p-6 md:pb-2"
         >
            <Card.Title class="text-[11px] font-medium md:text-sm">Hari Aktif</Card.Title>
            <TrendingUpIcon class="w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
         </Card.Header>
         <Card.Content class="p-2 pt-0 md:p-6 md:pt-0">
            <div class="text-base font-bold md:text-2xl">
               {transaksiData.data?.length || 0}
            </div>
            <p class="text-[9px] md:text-xs text-muted-foreground">Total transaksi</p>
         </Card.Content>
      </Card.Root>

      <Card.Root>
         <Card.Header
            class="flex flex-row items-center justify-between p-2 pb-1 space-y-0 md:p-6 md:pb-2"
         >
            <Card.Title class="text-[11px] font-medium md:text-sm">Hari Ini</Card.Title>
            <TrendingUpIcon class="w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
         </Card.Header>
         <Card.Content class="p-2 pt-0 md:p-6 md:pt-0">
            <div class="text-base font-bold md:text-2xl">{currentDate.getDate()}</div>
            <p class="text-[9px] md:text-xs text-muted-foreground truncate">
               {currentDate.toLocaleDateString("id-ID", { weekday: "long" })}
            </p>
         </Card.Content>
      </Card.Root>
   </div>

   <Card.Root>
      <Card.Header class="p-2 md:p-6">
         <div class="flex flex-col gap-1 md:gap-2 md:flex-row md:items-center md:justify-between">
            <div class="flex-1 min-w-0">
               <Card.Title class="text-xs md:text-base"
                  >Grafik Transaksi {selectedPeriod === "harian"
                     ? "Harian"
                     : selectedPeriod === "mingguan"
                       ? "Mingguan"
                       : "Bulanan"}</Card.Title
               >
               <Card.Description class="text-[10px] md:text-sm">
                  {#if selectedPeriod === "harian"}
                     <span class="hidden md:inline">Menampilkan total transaksi dari tanggal 1 hingga akhir bulan {monthName}</span>
                     <span class="md:hidden">Transaksi {monthName}</span>
                  {:else if selectedPeriod === "mingguan"}
                     <span class="hidden md:inline">Menampilkan total transaksi per minggu dalam 3 bulan terakhir</span>
                     <span class="md:hidden">Per minggu (3 bulan)</span>
                  {:else}
                     <span class="hidden md:inline">Menampilkan total transaksi per bulan dalam 12 bulan terakhir</span>
                     <span class="md:hidden">Per bulan (12 bulan)</span>
                  {/if}
               </Card.Description>
            </div>
            <div class="flex gap-2">
               <Button variant="default" size="sm" class="h-11 px-3 text-xs md:h-9 md:px-4 md:text-sm">Harian</Button>
            </div>
         </div>
      </Card.Header>
      <Card.Content class="h-[250px] md:h-[450px] p-2 md:p-6">
         {#if isLoading}
            <div class="flex items-center justify-center h-full">
               <div class="w-full space-y-3">
                  <div class="h-8 rounded bg-muted animate-pulse"></div>
                  <div class="h-64 rounded bg-muted animate-pulse"></div>
                  <div class="h-8 rounded bg-muted animate-pulse"></div>
               </div>
            </div>
         {:else}
            <Chart.Container config={chartConfig} class="h-full">
               <AreaChart
                  data={chartData}
                  x="date"
                  series={hasQueries
                     ? [
                          {
                             key: "umum",
                             label: "Umum",
                             color: chartConfig.umum.color,
                          },
                          {
                             key: "online",
                             label: "Online",
                             color: chartConfig.online.color,
                          },
                          {
                             key: "offline",
                             label: "Offline",
                             color: chartConfig.offline.color,
                          },
                          {
                             key: "conflict",
                             label: "Conflict",
                             color: chartConfig.conflict.color,
                          },
                       ]
                     : [
                          {
                             key: "umum",
                             label: "Total Transaksi",
                             color: chartConfig.umum.color,
                          },
                       ]}
                  props={{
                     area: {
                        "fill-opacity": 0.5,
                        line: { class: "stroke-[2.5px]" },
                     },
                     xAxis: {
                        format: (v: any) => {
                           if (v instanceof Date) {
                              const index = chartData.findIndex(
                                 (d) => d.date.getTime() === v.getTime()
                              );
                              const skipInterval =
                                 selectedPeriod === "harian"
                                    ? 5
                                    : selectedPeriod === "mingguan"
                                      ? 1
                                      : 1;
                              if (index % skipInterval !== 0) return "";
                              return (
                                 chartData[index]?.label ||
                                 v.getDate().toString()
                              );
                           }
                           return String(v);
                        },
                     },
                     yAxis: {
                        format: (v: number) => {
                           if (v >= 1000000000)
                              return `${(v / 1000000000).toFixed(1)}B`;
                           if (v >= 1000000)
                              return `${(v / 1000000).toFixed(1)}M`;
                           if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
                           return v.toString();
                        },
                     },
                  }}
               >
                  {#snippet tooltip()}
                     <Chart.Tooltip
                        class="p-3 border rounded-md shadow-md bg-background min-w-[200px]"
                        labelFormatter={(v: Date) => {
                           return v.toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                           });
                        }}
                     />
                  {/snippet}
               </AreaChart>
            </Chart.Container>
         {/if}
      </Card.Content>
      <Card.Footer class="p-3 md:p-6">
         <div class="flex flex-col w-full gap-1 text-xs md:flex-row md:items-start md:gap-2 md:text-sm">
            <div class="grid gap-1 md:gap-2">
               <div class="flex items-center gap-1.5 font-medium leading-none md:gap-2">
                  <span class="hidden md:inline">Data transaksi bulan {monthName}</span>
                  <span class="md:hidden">{monthName}</span>
                  <TrendingUpIcon class="size-3.5 md:size-4" />
               </div>
               <div
                  class="flex items-center gap-1.5 leading-none md:gap-2 text-muted-foreground"
               >
                  Total: Rp {(totalAmount / 1000000).toFixed(1)}M
               </div>
            </div>
         </div>
      </Card.Footer>
   </Card.Root>
</div>

<LoginModal bind:open={showLoginModal} bind:pollingInterval />
<RefreshDataModal bind:open={showRefreshModal} />
