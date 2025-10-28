import type { DateValue } from "@internationalized/date";
import { getLocalTimeZone } from "@internationalized/date";
import { get } from "svelte/store";
import { globalState } from "./setting";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Request deduplication map
const pendingRequests = new Map<string, Promise<any>>();

// Auth state (module-level to persist across calls)
let isAuthenticating = false;
let authResolvers: Array<(value: boolean) => void> = [];

// Format date helper
function formatDateDMY(date: DateValue): string {
   const d = date.toDate(getLocalTimeZone());
   const day = String(d.getDate()).padStart(2, "0");
   const month = String(d.getMonth() + 1).padStart(2, "0");
   const year = d.getFullYear();
   return `${day}/${month}/${year}`;
}

// Create request key for deduplication
function createRequestKey(url: string, body: any): string {
   return `${url}-${JSON.stringify(body)}`;
}

// Wait for ongoing authentication
function waitForAuth(): Promise<boolean> {
   return new Promise((resolve) => {
      authResolvers.push(resolve);
   });
}

// Notify all waiting requests that auth is complete
function notifyAuthComplete(success: boolean) {
   authResolvers.forEach(resolve => resolve(success));
   authResolvers = [];
}

// Set auth state
export function setAuthenticating(value: boolean) {
   console.log('[API] setAuthenticating:', value);
   isAuthenticating = value;
   if (!value) {
      // Clear all pending requests when auth completes
      console.log('[API] Auth complete, clearing pending requests');
      pendingRequests.clear();
      notifyAuthComplete(true);
   }
}

// Fetch with timeout
async function fetchWithTimeout(
   url: string,
   options: RequestInit,
   timeout: number = 30000
): Promise<Response> {
   const controller = new AbortController();
   const timeoutId = setTimeout(() => controller.abort(), timeout);

   try {
      const response = await fetch(url, {
         ...options,
         signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
   } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
         throw new Error('Request timeout after 30s');
      }
      throw error;
   }
}

// Core API client with deduplication and retry
export async function apiRequest<T>(
   url: string,
   body: any,
   options: {
      skipDedup?: boolean;
      onAuthRequired?: () => Promise<void>;
   } = {}
): Promise<T> {
   const requestKey = createRequestKey(url, body);

   // Check if same request is already pending
   if (!options.skipDedup && pendingRequests.has(requestKey)) {
      console.log('[API] Returning existing request:', requestKey);
      return pendingRequests.get(requestKey)!;
   }

   // Wait if authentication is in progress
   if (isAuthenticating) {
      console.log('[API] Waiting for authentication...');
      const authSuccess = await waitForAuth();
      if (!authSuccess) {
         throw new Error('Authentication failed');
      }
   }

   // Create new request
   const requestPromise = (async () => {
      try {
         console.log('[API] Request:', url, body);

         const response = await fetchWithTimeout(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
         });

         if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
            
            // Handle 401 Unauthorized
            if (response.status === 401 && options.onAuthRequired) {
               console.log('[API] Auth required, triggering callback');
               const oldCookie = get(globalState).cookie;
               await options.onAuthRequired();
               
               // Wait for cookie to actually change (max 10 seconds)
               let attempts = 0;
               let newCookie = get(globalState).cookie;
               while (newCookie === oldCookie && attempts < 100) {
                  await new Promise(resolve => setTimeout(resolve, 100));
                  newCookie = get(globalState).cookie;
                  attempts++;
               }
               
               if (newCookie === oldCookie) {
                  throw new Error('Cookie not updated after login');
               }
               
               const newBody = { ...body, cookie: newCookie };
               console.log('[API] Retrying with new cookie (changed from old)');
               // Retry request after auth
               return apiRequest<T>(url, newBody, { ...options, skipDedup: true });
            }

            throw new Error(`HTTP ${response.status}: ${errorData.message || 'Unknown error'}`);
         }

         const data = await response.json();
         console.log('[API] Response:', { status: data.status, hasData: !!data.data, hasAuthCallback: !!options.onAuthRequired });
         
         // Check if response indicates unauthorized (even with 200 OK)
         if (data.status === 'unauthorized') {
            console.log('[API] Unauthorized detected! Has callback:', !!options.onAuthRequired);
            if (options.onAuthRequired) {
               console.log('[API] Triggering auth callback...');
               const oldCookie = get(globalState).cookie;
               await options.onAuthRequired();
               
               // Wait for cookie to actually change (max 10 seconds)
               let attempts = 0;
               let newCookie = get(globalState).cookie;
               while (newCookie === oldCookie && attempts < 100) {
                  await new Promise(resolve => setTimeout(resolve, 100));
                  newCookie = get(globalState).cookie;
                  attempts++;
               }
               
               if (newCookie === oldCookie) {
                  throw new Error('Cookie not updated after login');
               }
               
               console.log('[API] Auth callback completed, retrying request...');
               const newBody = { ...body, cookie: newCookie };
               console.log('[API] Retrying with new cookie (changed from old)');
               // Retry request after auth
               return apiRequest<T>(url, newBody, { ...options, skipDedup: true });
            } else {
               console.warn('[API] No auth callback provided!');
            }
         }
         
         return data;
      } finally {
         // Remove from pending after completion
         pendingRequests.delete(requestKey);
      }
   })();

   // Store pending request
   pendingRequests.set(requestKey, requestPromise);

   return requestPromise;
}

// Check auth status
export async function checkAuthStatus(): Promise<boolean> {
   try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/login`, {
         method: "GET",
      }, 5000); // Shorter timeout for auth check

      const data = await res.json();
      return data.status === "authorized";
   } catch (error) {
      console.error("[API] Auth check error:", error);
      return false;
   }
}

// Perform login
export async function performLogin(username: string, password: string): Promise<string> {
   const res = await fetchWithTimeout(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
   });

   const data = await res.json();

   if (!res.ok || data.status !== "authorized") {
      throw new Error(data.message || "Login failed");
   }

   if (!data.cookie) {
      throw new Error("No cookie in response");
   }

   return data.cookie;
}

// Start fetch job
export async function startFetch(
   fromDate: DateValue,
   toDate: DateValue,
   onAuthRequired?: () => Promise<void>
): Promise<{ status: string; job_id?: string }> {
   const cookie = get(globalState).cookie;
   const from = formatDateDMY(fromDate);
   const to = formatDateDMY(toDate);

   return apiRequest(`${API_BASE_URL}/start-fetch`, { from, to, cookie }, { onAuthRequired });
}

// Fetch data
export async function fetchData(
   fromDate: DateValue,
   toDate: DateValue,
   endpoint: 'data-cached' | 'force-empty' | 'force-refresh' = 'data-cached',
   onAuthRequired?: () => Promise<void>
): Promise<any> {
   const cookie = get(globalState).cookie;
   const from = formatDateDMY(fromDate);
   const to = formatDateDMY(toDate);

   console.log(`[API] Fetching data: ${from} - ${to} via ${endpoint}`);

   return apiRequest(`${API_BASE_URL}/${endpoint}`, { from, to, cookie }, { onAuthRequired });
}

// Force empty
export async function forceEmptyData(
   fromDate: DateValue,
   toDate: DateValue,
   onAuthRequired?: () => Promise<void>
): Promise<any> {
   return fetchData(fromDate, toDate, 'force-empty', onAuthRequired);
}

// Force refresh
export async function forceRefreshData(
   fromDate: DateValue,
   toDate: DateValue,
   onAuthRequired?: () => Promise<void>
): Promise<any> {
   return fetchData(fromDate, toDate, 'force-refresh', onAuthRequired);
}

// Clear all pending requests (useful for cleanup)
export function clearPendingRequests() {
   pendingRequests.clear();
}
