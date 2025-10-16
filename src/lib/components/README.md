# Components

This directory contains reusable UI components for the application.

## Components

- `accordian.svelte` - Collapsible content component
- `alert.svelte` - Alert/notification component
- `app-sidebar.svelte` - Main application sidebar
- `card-transaksi.svelte` - Transaction card component
- `date-picker.svelte` - Date selection component
- `drawer-transaksi.svelte` - Transaction drawer/modal
- `field-transaksi.svelte` - Transaction form field
- `search-form.svelte` - Search form component
- `version-switcher.svelte` - Version switching component

## UI Directory

The `/ui/` subdirectory contains low-level UI components and design system elements.

## Usage

Import components in your Svelte files:

```svelte
<script>
  import Alert from '$lib/components/alert.svelte'
  import DatePicker from '$lib/components/date-picker.svelte'
</script>
```