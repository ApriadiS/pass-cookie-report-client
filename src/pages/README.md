# Pages

This directory contains the main application pages/routes.

## Pages

- `Dashboard.svelte` - Sales analytics dashboard with interactive charts
- `All.svelte` - Complete transaction listing with classification and advanced actions
- `Query.svelte` - Transaction query page for online/offline filtering
- `Setting.svelte` - Application settings and configuration

## Routing

Pages are loaded dynamically based on the current route. Each page is a self-contained Svelte component.

## Usage

Pages are automatically loaded by the routing system defined in `$lib/routing.ts`.

## Page Details

### Dashboard.svelte
- Monthly sales overview with charts
- Real-time transaction statistics
- Multiple chart periods (Daily, Weekly, Monthly)
- Background job polling for data updates

### All.svelte
- Transaction classification with accordions
- Query settings configuration
- Force actions (Force Empty, Force Refresh)
- Date range selection

### Query.svelte
- Filtered transaction views
- Online/Offline transaction display
- Dynamic query-based filtering

### Setting.svelte
- Global application configuration
- Theme settings
- API configuration