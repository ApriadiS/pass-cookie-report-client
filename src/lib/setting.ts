import { writable } from "svelte/store";

// Global state management for application
export interface GlobalState {
   cookie: string;
   theme: "dark" | "light";
   timezone: "WIB" | "WITA" | "WIT";
   queryOnline: string;
   queryOffline: string;
}

// Initialize global state with default values
const initialState: GlobalState = {
   cookie: import.meta.env.VITE_DEFAULT_COOKIE || "",
   theme: "light",
   timezone: "WIB",
   queryOnline: "",
   queryOffline: "",
};

export const globalState = writable<GlobalState>(initialState);

export const setCookie = (cookie: string): void => {
   globalState.update((state) => ({
      ...state,
      cookie: cookie.trim().replace(/\s+/g, ""),
   }));
};

export const setTheme = (theme: "dark" | "light"): void => {
   globalState.update((state) => ({ ...state, theme }));
};

export const setTimezone = (timezone: "WIB" | "WITA" | "WIT"): void => {
   globalState.update((state) => ({ ...state, timezone }));
};

export const setQueries = (queryOnline: string, queryOffline: string): void => {
   globalState.update((state) => ({ ...state, queryOnline, queryOffline }));
};

export const toggleTheme = (): void => {
   globalState.update((state) => ({
      ...state,
      theme: state.theme === "dark" ? "light" : "dark",
   }));
};