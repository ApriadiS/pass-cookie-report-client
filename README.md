# Sales Report Client v1.1.0

A modern web application for sales transaction reporting and analytics built with Svelte, TypeScript, and Vite.

## Features

- 📊 Sales transaction reporting with intelligent classification
- 📈 Interactive charts and analytics dashboard
- 🔍 Query-based transaction classification (Online/Offline)
- 📅 Date range selection for custom reports
- 🔄 Advanced data refresh options (Force Empty/Force Refresh)
- 📱 Mobile-friendly responsive design
- 🎨 Modern UI with Tailwind CSS and shadcn/ui components
- 🌙 Dark/Light theme support
- ⚡ Fast performance with Vite

## Tech Stack

- **Frontend**: Svelte 5 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui + Custom components
- **Charts**: LayerChart
- **State Management**: Svelte stores
- **Analytics**: Vercel Analytics & Speed Insights

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd pass-cookie-report-client
```

2. Install dependencies
```bash
npm install
```

3. Setup environment variables
```bash
cp .env.example .env
```
Edit `.env` file with your configuration.

4. Start development server
```bash
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run check` - Run type checking

## Project Structure

- `/src` - Source code
- `/public` - Static assets
- `/src/lib` - Shared libraries and utilities
- `/src/pages` - Application pages (Dashboard, All, Query, Setting)
- `/src/lib/components` - Reusable components
- `/src/lib/components/ui` - shadcn/ui components

## Key Features

### Sales Dashboard
- Monthly sales overview with interactive charts
- Real-time transaction statistics
- Multiple chart periods (Daily, Weekly, Monthly)

### Transaction Classification
- Intelligent query-based classification system
- Online/Offline transaction categorization
- Conflict detection for ambiguous transactions

### Advanced Data Management
- **Force Empty**: Refresh empty cached data from database
- **Force Refresh**: Override all cache with fresh database data
- Backend pagination support with user feedback

## Environment Variables

```bash
VITE_API_BASE_URL=http://localhost:3000  # Backend API URL
VITE_FAVICON_URL=                        # Custom favicon URL
VITE_DEFAULT_COOKIE=                     # Default authentication cookie
```

## API Endpoints

- `POST /start-fetch` - Start background data fetching job
- `POST /data-cached` - Get cached transaction data
- `POST /force-empty` - Force refresh empty cached data
- `POST /force-refresh` - Force refresh all data from database

## License

MIT License