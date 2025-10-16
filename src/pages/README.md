# Pages

This directory contains the main application pages/routes.

## Pages

- `Dashboard.svelte` - Main dashboard page with data overview
- `All.svelte` - Complete data listing page
- `Query.svelte` - Advanced search and query page
- `Setting.svelte` - Application settings page

## Routing

Pages are loaded dynamically based on the current route. Each page is a self-contained Svelte component.

## Usage

Pages are automatically loaded by the routing system defined in `$lib/routing.ts`.

## Structure

Each page component typically includes:
- Data fetching logic
- Page-specific state management
- UI components composition
- Responsive layout