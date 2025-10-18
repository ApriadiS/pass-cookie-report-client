# Library

This directory contains shared libraries, utilities, and reusable components.

## Structure

- `/components/` - Reusable UI components
- `/hooks/` - Custom Svelte hooks/utilities
- `api.ts` - API client and data fetching functions
- `routing.ts` - Application routing logic
- `setting.ts` - Global state management
- `sidebarState.ts` - Sidebar state management
- `utils.ts` - General utility functions
- `chart-aggregator.ts` - Chart data processing and aggregation
- `query-classifier.ts` - Transaction classification logic

## Key Files

- **api.ts**: API functions including force-empty and force-refresh endpoints
- **setting.ts**: Global application state using Svelte stores
- **routing.ts**: Client-side routing implementation
- **chart-aggregator.ts**: Processes transaction data for chart visualization
- **query-classifier.ts**: Classifies transactions based on user-defined queries
- **utils.ts**: Helper functions used throughout the app