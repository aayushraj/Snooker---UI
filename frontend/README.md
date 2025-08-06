# Snooker Club Management System

This repository contains the frontend application for the Snooker Club Management System. It's built with Next.js and designed to be deployed as a web application or packaged as a desktop application using Electron.

## Features

*   **Dashboard**: Overview of active/paused tables, revenue, and customer statistics.
*   **Table Management**: Configure snooker tables, including names, hourly rates, and locations.
*   **Session Management**: Start, pause, resume, and end sessions for tables.
*   **Customer Management**: Add and manage customer profiles, including membership types.
*   **Menu Management**: Manage food and beverage items available for order.
*   **Order Management**: Add orders to active sessions.
*   **Billing**: Generate detailed bills for ended sessions, including table charges, order charges, discounts, and taxes.
*   **Responsive Design**: Adapts to various screen sizes.
*   **Electron Integration**: Can be run as a cross-platform desktop application.

## Technologies Used

*   **Frontend**:
    *   [Next.js](https://nextjs.org/) (React Framework)
    *   [TypeScript](https://www.typescriptlang.org/)
    *   [Tailwind CSS](https://tailwindcss.com/)
    *   [shadcn/ui](https://ui.shadcn.com/) (UI Components)
    *   [Lucide React](https://lucide.dev/icons/) (Icons)
    *   [Electron](https://www.electronjs.org/) (for desktop application)
    *   [date-fns](https://date-fns.org/) (Date utility library)
    *   [Sonner](https://sonner.emilkowalski.com/) (Toast notifications)
*   **Backend (Separate Repository/Project)**:
    *   [.NET Minimal API](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/)
    *   [C#](https://docs.microsoft.com/en-us/dotnet/csharp/)
    *   [Entity Framework Core](https://docs.microsoft.com/en-us/ef/core/) (ORM for database interaction)
    *   [SQLite](https://www.sqlite.org/index.html) (Lightweight database)

## Getting Started

Please refer to the [INSTALLATION.md](INSTALLATION.md) file for detailed instructions on how to set up and run both the backend and frontend components of this system.

## Project Structure

\`\`\`
frontend/
├── public/                 # Static assets (images, icons)
├── app/                    # Next.js App Router
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Main dashboard page
├── components/             # Reusable React components
│   ├── ui/                 # shadcn/ui components (copied from library)
│   ├── billing-section.tsx
│   ├── customer-creation-dialog.tsx
│   ├── dashboard-stats.tsx
│   ├── menu-management.tsx
│   ├── snooker-club-layout.tsx # Main layout with sidebar and content
│   ├── snooker-table-timer.tsx
│   ├── table-management.tsx
│   └── tables-overview.tsx
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions
├── electron-main.js        # Electron main process script
├── preload.js              # Electron preload script
├── next.config.mjs         # Next.js configuration
├── package.json            # Project dependencies and scripts
├── postcss.config.mjs      # PostCSS configuration
├── tailwind.config.ts      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
\`\`\`

## Development

### Running the Web Application

1.  Ensure your backend API is running (see `INSTALLATION.md`).
2.  Navigate to the `frontend` directory.
3.  Run `npm install`.
4.  Create a `.env.local` file with `NEXT_PUBLIC_API_URL=http://localhost:5001` (adjust if your backend runs on a different port).
5.  Run `npm run dev`.
6.  Open `http://localhost:3000` in your browser.

### Running the Electron Application

1.  Ensure your backend API is running.
2.  Navigate to the `frontend` directory.
3.  Run `npm install`.
4.  Create a `.env.local` file with `NEXT_PUBLIC_API_URL=http://localhost:5001`.
5.  Run `npm run electron:dev`.

### Building the Electron Application

1.  Ensure your backend API is running and accessible.
2.  Navigate to the `frontend` directory.
3.  Run `npm install`.
4.  Create a `.env.local` file with `NEXT_PUBLIC_API_URL` pointing to your **production backend API URL**.
5.  Run `npm run electron:build`.
    The distributable will be in the `release` directory.

## Roadmap

*   **Table Booking System**: Implement reservation and booking functionality for tables.
*   **Member Management**: Enhanced member profiles, membership tiers, and tracking.
*   **Billing Integration**: Integrate with payment gateways for seamless payment processing.
*   **Analytics Dashboard**: Advanced charts and reports for table usage, revenue trends, and member analytics.
*   **Real-time Notifications**: Implement WebSockets for live table status updates and order notifications.
*   **Dark Mode Support**: Refine dark theme with appropriate color adjustments.
*   **Export Functionality**: Generate PDF/Excel reports for daily/weekly business analysis.
*   **Sound Notifications**: Play sounds for table status changes or timer milestones.
*   **User Authentication**: Secure the application with user login and role-based access.

---

Feel free to contribute or suggest improvements!
