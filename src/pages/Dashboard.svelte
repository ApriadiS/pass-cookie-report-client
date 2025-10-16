<script lang="ts">
   import { AreaChart } from "layerchart";
   import TrendingUpIcon from "@lucide/svelte/icons/trending-up";
   import TrendingDownIcon from "@lucide/svelte/icons/trending-down";
   import * as Chart from "$lib/components/ui/chart/index.js";
   import * as Card from "$lib/components/ui/card/index.js";
   import { fetchData, startFetch, type TransaksiResponse, type NestedTransaksiResponse } from "$lib/api";
   import { CalendarDate } from "@internationalized/date";
   import { toast } from "svelte-sonner";
   import { navigate } from "$lib/routing";
   import { globalState } from "$lib/setting";

   const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

   const currentDate = new Date();
   const currentYear = currentDate.getFullYear();
   const currentMonth = currentDate.getMonth();
   const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
   const monthName = currentDate.toLocaleDateString("id-ID", {
      month: "long",
      year: "numeric",
   });

   let transaksiData = $state<TransaksiResponse>({
      total_transaksi: 0,
      data: [],
   });
   let chartData = $state<{ date: Date; transaksi: number }[]>([]);
   let totalAmount = $state(0);
   let avgDaily = $state(0);

   const chartConfig = {
      transaksi: {
         label: "Total Transaksi",
         color: "var(--chart-1)",
         icon: TrendingUpIcon,
      },
   } satisfies Chart.ChartConfig;

   let isLoading = $state(false);
   let pollingInterval: ReturnType<typeof setInterval> | null = null;
   $effect(() => {
      // Reactive terhadap perubahan cookie
      const cookie = $globalState.cookie;

      async function loadData() {
         if (isLoading) return;
         isLoading = true;

         try {
            console.log("Fetching data with cookie:", cookie);
            
            // Create date range for current month
            const fromDate = new CalendarDate(currentYear, currentMonth + 1, 1);
            const toDate = new CalendarDate(currentYear, currentMonth + 1, daysInMonth);
            
            // Try to get cached data first
            const result = await fetchData(fromDate, toDate);

            // Handle different response types
            if (result.status === "processing") {
               // Start polling for job completion
               toast.info("Data sedang diproses...", {
                  description: "Menunggu background job selesai",
               });
               
               await startPolling(fromDate, toDate);
               return;
            }
            
            if (result.status === "not_found") {
               // Start background job
               toast.info("Memulai pengambilan data...", {
                  description: "Data belum tersedia, memulai background job",
               });
               
               await startFetch(fromDate, toDate);
               await startPolling(fromDate, toDate);
               return;
            }

            // Process successful data
            if ('status' in result && result.status === "completed" && 'data' in result.data) {
               transaksiData = (result as NestedTransaksiResponse).data;
               processChartData((result as NestedTransaksiResponse).data.data);
            } else if (Array.isArray(result.data)) {
               // Normal response without status
               transaksiData = result as TransaksiResponse;
               processChartData((result as TransaksiResponse).data);
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
               const result = await fetchData(fromDate, toDate);
               
               if (result.status === "completed") {
                  clearInterval(pollingInterval!);
                  pollingInterval = null;
                  
                  if ('data' in result.data) {
                     transaksiData = (result as NestedTransaksiResponse).data;
                     processChartData((result as NestedTransaksiResponse).data.data);
                  } else {
                     transaksiData = result as TransaksiResponse;
                     processChartData((result as TransaksiResponse).data);
                  }
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
         const dailyTotals: Record<string, number> = {};
         
         if (!Array.isArray(data)) {
            console.error("processChartData received non-array:", data);
            return;
         }
         
         data.forEach((item: any) => {
            const date = item.tanggal_transaksi;
            dailyTotals[date] = (dailyTotals[date] || 0) + item.total_tagihan;
         });

         chartData = Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const date = new Date(currentYear, currentMonth, day);
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const amount = dailyTotals[dateStr] || 0;
            return { date, transaksi: amount };
         });

         totalAmount = data.reduce((sum: number, item: any) => sum + item.total_tagihan, 0);
         avgDaily = Math.floor(totalAmount / daysInMonth);
      }

      loadData();
   });
</script>

<div class="grid gap-4 md:gap-6">
   {#if isLoading}
      <div class="flex items-center justify-center p-8">
         <div class="text-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p class="text-sm text-muted-foreground">Memuat data...</p>
         </div>
      </div>
   {/if}
   
   <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card.Root>
         <Card.Header
            class="flex flex-row items-center justify-between pb-2 space-y-0"
         >
            <Card.Title class="text-sm font-medium">Total Transaksi</Card.Title>
            <TrendingUpIcon class="w-4 h-4 text-muted-foreground" />
         </Card.Header>
         <Card.Content>
            <div class="text-2xl font-bold">
               Rp {totalAmount.toLocaleString("id-ID")}
            </div>
            <p class="text-xs text-muted-foreground">{monthName}</p>
         </Card.Content>
      </Card.Root>

      <Card.Root>
         <Card.Header
            class="flex flex-row items-center justify-between pb-2 space-y-0"
         >
            <Card.Title class="text-sm font-medium">Rata-rata Harian</Card.Title
            >
            <TrendingDownIcon class="w-4 h-4 text-muted-foreground" />
         </Card.Header>
         <Card.Content>
            <div class="text-2xl font-bold">
               Rp {avgDaily.toLocaleString("id-ID")}
            </div>
            <p class="text-xs text-muted-foreground">Per hari</p>
         </Card.Content>
      </Card.Root>

      <Card.Root>
         <Card.Header
            class="flex flex-row items-center justify-between pb-2 space-y-0"
         >
            <Card.Title class="text-sm font-medium">Hari Aktif</Card.Title>
            <TrendingUpIcon class="w-4 h-4 text-muted-foreground" />
         </Card.Header>
         <Card.Content>
            <div class="text-2xl font-bold">
               {transaksiData.data?.length || 0}
            </div>
            <p class="text-xs text-muted-foreground">Total transaksi</p>
         </Card.Content>
      </Card.Root>

      <Card.Root>
         <Card.Header
            class="flex flex-row items-center justify-between pb-2 space-y-0"
         >
            <Card.Title class="text-sm font-medium">Hari Ini</Card.Title>
            <TrendingUpIcon class="w-4 h-4 text-muted-foreground" />
         </Card.Header>
         <Card.Content>
            <div class="text-2xl font-bold">{currentDate.getDate()}</div>
            <p class="text-xs text-muted-foreground">
               {currentDate.toLocaleDateString("id-ID", { weekday: "long" })}
            </p>
         </Card.Content>
      </Card.Root>
   </div>

   <Card.Root>
      <Card.Header>
         <Card.Title>Grafik Transaksi Harian</Card.Title>
         <Card.Description
            >Menampilkan total transaksi dari tanggal 1 hingga akhir bulan {monthName}</Card.Description
         >
      </Card.Header>
      <Card.Content>
         <Chart.Container config={chartConfig}>
            <AreaChart
               data={chartData}
               x="date"
               series={[
                  {
                     key: "transaksi",
                     label: "Total Transaksi",
                     color: chartConfig.transaksi.color,
                  },
               ]}
               props={{
                  area: {
                     "fill-opacity": 0.4,
                     line: { class: "stroke-2" },
                  },
                  xAxis: {
                     format: (v: any) => {
                        if (v instanceof Date) {
                           return v.getDate().toString();
                        }
                        return String(v);
                     },
                  },
                  yAxis: {
                     format: (v: number) => `${(v / 1000000).toFixed(1)}M`,
                  },
               }}
            >
               {#snippet tooltip()}
                  <Chart.Tooltip
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
      </Card.Content>
      <Card.Footer>
         <div class="flex items-start w-full gap-2 text-sm">
            <div class="grid gap-2">
               <div class="flex items-center gap-2 font-medium leading-none">
                  Data transaksi bulan {monthName}
                  <TrendingUpIcon class="size-4" />
               </div>
               <div
                  class="flex items-center gap-2 leading-none text-muted-foreground"
               >
                  Total: Rp {totalAmount.toLocaleString("id-ID")}
               </div>
            </div>
         </div>
      </Card.Footer>
   </Card.Root>
</div>
