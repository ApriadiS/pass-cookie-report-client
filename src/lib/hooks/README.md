# Hooks

This directory contains custom Svelte hooks and utility functions.

## Contents

- `is-mobile.svelte.ts` - Mobile device detection hook

## Usage

Import and use hooks in your Svelte components:

```svelte
<script>
  import { isMobile } from '$lib/hooks/is-mobile.svelte.ts'
  
  const mobile = isMobile()
</script>
```

## Purpose

Hooks provide:
- Reusable reactive logic
- Device and environment detection
- Shared state management patterns