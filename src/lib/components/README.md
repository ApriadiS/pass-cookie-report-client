# Components

This directory contains reusable UI components for the application.

## Components

### Core Components
- `app-sidebar.svelte` - Main application sidebar with navigation
- `field-transaksi.svelte` - Main transaction field with date selection and data display
- `classified-accordions.svelte` - Transaction classification display with accordions
- `query-settings.svelte` - Query configuration for online/offline classification
- `force-actions.svelte` - Advanced data refresh actions

### UI Components
- `accordian.svelte` - Collapsible content component
- `alert.svelte` - Alert/notification component
- `card-transaksi.svelte` - Transaction card component
- `date-picker.svelte` - Date selection component
- `drawer-transaksi.svelte` - Transaction drawer/modal
- `search-form.svelte` - Search form component
- `version-switcher.svelte` - Version switching component

### New Components
- `classified-accordions.svelte` - Displays classified transactions in organized accordions
- `query-settings.svelte` - Configuration interface for transaction queries
- `force-actions.svelte` - Advanced actions for data management

## UI Directory

The `/ui/` subdirectory contains low-level UI components and design system elements.

## Usage

Import components in your Svelte files:

```svelte
<script>
  import FieldTransaksi from '$lib/components/field-transaksi.svelte'
  import ClassifiedAccordions from '$lib/components/classified-accordions.svelte'
  import ForceActions from '$lib/components/force-actions.svelte'
</script>
```

## Component Architecture

- **field-transaksi.svelte**: Main component that handles data fetching and classification
- **classified-accordions.svelte**: Displays classified data in organized sections
- **query-settings.svelte**: Allows users to configure classification queries
- **force-actions.svelte**: Provides advanced data refresh capabilities