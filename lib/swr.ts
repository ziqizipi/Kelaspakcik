/**
 * SWR global configuration for BalasBro.ai
 * Provides consistent caching, revalidation, and error handling across all data fetching.
 */
import { SWRConfiguration } from "swr"

export const swrFetcher: SWRConfiguration["fetcher"] = (url: string) =>
  fetch(url).then(async (res) => {
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: "Request failed" }))
      throw new Error(error.error || `HTTP ${res.status}`)
    }
    return res.json()
  })

/**
 * Default SWR config for list pages (conversations, orders, customers)
 * - 5s polling for real-time updates
 * - Refresh on window focus
 * - Deduplicate requests within 2s window
 */
export const swrListConfig: SWRConfiguration = {
  refreshInterval: 5000,
  revalidateOnFocus: true,
  dedupingInterval: 2000,
  keepPreviousData: true,
}

/**
 * Default SWR config for detail pages (order detail, customer detail)
 * - 5s polling for real-time updates
 * - No deduplication (individual items)
 */
export const swrDetailConfig: SWRConfiguration = {
  refreshInterval: 5000,
  revalidateOnFocus: true,
  dedupingInterval: 0,
}

/**
 * Default SWR config for settings pages (AI config, team, channels)
 * - 30s polling (less frequent)
 * - Refresh on focus
 */
export const swrSettingsConfig: SWRConfiguration = {
  refreshInterval: 30000,
  revalidateOnFocus: true,
  dedupingInterval: 2000,
}

/**
 * SWR config for dashboard metrics
 * - 30s polling
 * - Keep previous data while loading new
 */
export const swrDashboardConfig: SWRConfiguration = {
  refreshInterval: 30000,
  revalidateOnFocus: true,
  keepPreviousData: true,
}
