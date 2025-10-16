// src/lib/routing.ts
import { writable } from "svelte/store";

// Halaman yang didukung
export type Page = "dashboard" | "online" | "offline" | "all" | "setting";

// Store halaman aktif
export const currentPage = writable<Page>("dashboard");

// Sinkronisasi dengan URL
export function navigate(page: Page) {
   let url = "/";
   if (page !== "dashboard") url = "/" + page;
   history.pushState({}, "", url);
   currentPage.set(page);
}

// Inisialisasi: baca URL saat load dan saat popstate
export function initRouting() {
   function syncPageWithUrl() {
      const path = window.location.pathname.replace(/^\//, "");
      switch (path) {
         case "all":
            currentPage.set("all");
            break;
         case "setting":
            currentPage.set("setting");
            break;
         default:
            currentPage.set("dashboard");
      }
   }
   window.addEventListener("popstate", syncPageWithUrl);
   syncPageWithUrl();
}
