# Snooker Club Management System (Frontend)

This is the frontend application for the Snooker Club Management System, built with Next.js and packaged as an Electron desktop application. It provides a user interface for managing snooker tables, customers, menu items, sessions, and viewing dashboard statistics.

## Features

-   **Dashboard**: Overview of active, paused, available, and reserved tables, along with revenue statistics.
-   **Table Management**: Start, pause, resume, and end sessions for snooker tables.
-   **Customer Management**: Create new customers with different membership types and associated discounts.
-   **Menu Management**: Add, update, and delete menu items.
-   **Order Management**: Add orders to active sessions.
-   **Billing**: Generate bills with detailed charges, discounts, and taxes.
-   **Responsive Design**: Adapts to various screen sizes.
-   **Desktop Application**: Packaged with Electron for a native desktop experience.

## Technologies Used

-   **Next.js**: React framework for building the user interface.
-   **React**: JavaScript library for building user interfaces.
-   **Tailwind CSS**: Utility-first CSS framework for styling.
-   **shadcn/ui**: Reusable UI components.
-   **Electron**: Framework for building cross-platform desktop applications with web technologies.
-   **Lucide React**: Icon library.

## Getting Started

Please refer to the `INSTALLATION.md` file for detailed instructions on how to set up and run the frontend application in both development and production environments.

## Project Structure

\`\`\`
frontend/
├── public/                     # Static assets (images, fonts)
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Main dashboard page
├── components/                 # Reusable React components
│   ├── ui/                     # shadcn/ui components
│   ├── billing-section.tsx
│   ├── customer-creation-dialog.tsx
│   ├── dashboard-stats.tsx
│   ├── menu-management.tsx
│   ├── snooker-club-layout.tsx
│   ├── snooker-table-timer.tsx
│   ├── table-management.tsx
│   └── tables-overview.tsx
├── hooks/                      # Custom React hooks
├── lib/                        # Utility functions
├── styles/                     # Global CSS styles
├── electron-main.js            # Electron main process script
├── preload.js                  # Electron preload script
├── next.config.mjs             # Next.js configuration
├── package.json                # Project dependencies and scripts
├── postcss.config.mjs          # PostCSS configuration
├── tailwind.config.ts          # Tailwind CSS configuration
└── tsconfig.json               # TypeScript configuration
\`\`\`

## Scripts

-   `npm run dev`: Starts the Next.js development server.
-   `npm run build:next`: Builds the Next.js application for static export.
-   `npm run start:next`: Starts the Next.js production server (after `build:next`).
-   `npm run start:electron`: Runs the Electron desktop application in development mode.
-   `npm run build:electron`: Builds the Electron desktop application for production distribution.
-   `npm run dist`: Runs `build:next` and then `build:electron` to create a full production build.
-   `npm run lint`: Runs ESLint for code linting.

## Contributing

Feel free to fork the repository, make improvements, and submit pull requests.

## License

[Specify your license here, e.g., MIT, Apache 2.0]
\`\`\`

```plaintext file="frontend/SnookerClubApi.csproj"
<Project Sdk="Microsoft.NET.Sdk.Web">

  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.AspNetCore.OpenApi" Version="8.0.0" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="8.0.0">
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
      <PrivateAssets>all</PrivateAssets>
    </PackageReference>
    <PackageReference Include="Microsoft.EntityFrameworkCore.Sqlite" Version="8.0.0" />
    <PackageReference Include="Swashbuckle.AspNetCore" Version="6.4.0" />
  </ItemGroup>

</Project>
