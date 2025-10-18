// src/lib/routing.ts
import { writable } from "svelte/store";

// Halaman yang didukung
export type Page = "dashboard" | "online" | "offline" | "all" | "setting";

// Store halaman aktif
export const currentPage = writable<Page>("dashboard");

// Sinkronisasi dengan URL
export function navigate(page: Page | string) {
   // Handle empty string as dashboard
   const targetPage = (page === "" || page === "dashboard") ? "dashboard" : page as Page;
   
   let url = "/";
   if (targetPage !== "dashboard") url = "/" + targetPage;
   
   history.pushState({}, "", url);
   currentPage.set(targetPage);
}

// Inisialisasi: baca URL saat load dan saat popstate
export function initRouting() {
   function syncPageWithUrl() {
      const path = window.location.pathname.replace(/^\//, "") || "dashboard";
      switch (path) {
         case "all":
            currentPage.set("all");
            break;
         case "setting":
            currentPage.set("setting");
            break;
         case "dashboard":
            currentPage.set("dashboard");
            break;
         default:
            currentPage.set("dashboard");
      }
   }
   window.addEventListener("popstate", syncPageWithUrl);
   syncPageWithUrl();
}
