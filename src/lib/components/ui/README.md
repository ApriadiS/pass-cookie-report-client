# UI Components

This directory contains low-level UI components that form the design system foundation.

## Purpose

These components provide:
- Consistent styling and behavior
- Reusable design patterns
- Base components for higher-level features

## Usage

UI components are typically imported and used by other components in the parent `/components/` directory.

```svelte
<script>
  import { Button } from '$lib/components/ui'
</script>
```

## Design System

These components follow the application's design system and are styled with Tailwind CSS classes.