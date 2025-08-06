# Snooker Club Management System

This is a comprehensive Snooker Club Management System designed to streamline operations for snooker clubs. It features a Next.js frontend (with Electron desktop app support) and a .NET Minimal API backend.

## Features

-   **Dashboard**: Overview of active/paused/available tables, revenue statistics, and active customers.
-   **Table Management**: Configure snooker tables, including names, hourly rates, and locations.
-   **Customer Management**: Create and manage customer profiles, including membership types and associated discounts.
-   **Session Management**: Start, pause, resume, and end snooker table sessions.
-   **Order Management**: Add food and beverage orders to active sessions.
-   **Billing**: Generate detailed bills for ended sessions, including table charges, order charges, membership discounts, and taxes.
-   **Menu Management**: Add, edit, and delete menu items with prices, descriptions, categories, and availability.
-   **Responsive Design**: Optimized for various screen sizes.
-   **Themeable**: Supports light and dark modes.

## Technologies Used

### Frontend
-   **Next.js**: React framework for building the user interface.
-   **React**: JavaScript library for building interactive UIs.
-   **Tailwind CSS**: Utility-first CSS framework for styling.
-   **shadcn/ui**: Reusable UI components built with Radix UI and Tailwind CSS.
-   **Lucide React**: Icon library.
-   **Electron**: For building cross-platform desktop applications from the Next.js frontend.
-   **date-fns**: For date and time manipulation.
-   **Sonner**: For toast notifications.

### Backend
-   **.NET Minimal API (C#)**: Lightweight and fast API for backend logic.
-   **Entity Framework Core**: ORM for database interactions.
-   **SQLite**: Lightweight, file-based database for easy setup.
-   **Swagger/OpenAPI**: For API documentation and testing.

## Getting Started

Please refer to the [INSTALLATION.md](INSTALLATION.md) file for detailed instructions on how to set up and run the application.

## Project Structure

\`\`\`
.
├── backend/                  # .NET Minimal API backend
│   ├── SnookerClubApi.csproj
│   ├── Program.cs            # API endpoints, DB context, models
│   ├── appsettings.json
│   └── SnookerClub.db        # SQLite database file (generated)
├── frontend/                 # Next.js / Electron frontend
│   ├── public/               # Static assets (images, icons)
│   ├── app/                  # Next.js App Router pages
│   │   ├── layout.tsx
│   │   └── page.tsx          # Main application entry point
│   ├── components/           # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── billing-section.tsx
│   │   ├── customer-creation-dialog.tsx
│   │   ├── dashboard-stats.tsx
│   │   ├── menu-management.tsx
│   │   ├── snooker-club-layout.tsx
│   │   ├── snooker-table-timer.tsx
│   │   ├── table-management.tsx
│   │   └── tables-overview.tsx
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility functions
│   ├── electron-main.js      # Electron main process script
│   ├── preload.js            # Electron preload script
│   ├── next.config.mjs
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
├── .gitignore
└── INSTALLATION.md           # Setup instructions
\`\`\`

## Roadmap

Here are some features planned for future development:

-   **Table Booking System**: Implement reservation and booking functionality for tables.
-   **Member Management**: Enhanced member profiles, membership tiers, and analytics.
-   **Billing Integration**: Integrate with external payment gateways and generate invoices.
-   **Analytics Dashboard**: Advanced charts and reports for table usage, revenue trends, and customer insights.
-   **Real-time Notifications**: Implement WebSockets for live table status updates and alerts.
-   **Export Reports**: Generate PDF/Excel reports for daily/weekly business analysis.
-   **Dark Mode Enhancements**: Fine-tune dark theme with appropriate color adjustments for snooker aesthetics.
-   **Table Filtering**: Add filters to show only active, available, or reserved tables.
-   **Sound Notifications**: Play sounds when tables change status or timers reach milestones.
-   **Order Management Improvements**: More detailed order tracking and modification options.
-   **Payment Processing**: Full payment functionality for bills.

Feel free to contribute or suggest new features!
\`\`\`
