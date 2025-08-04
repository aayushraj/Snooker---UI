# Frontend Setup (Next.js / Electron)

This guide will help you set up and run the frontend of the Snooker Club Management System, which is built with Next.js and packaged as an Electron desktop application.

## Prerequisites

Before you begin, ensure you have the following installed:

-   **Node.js**: Version 18 or higher. You can download it from [nodejs.org](https://nodejs.org/).
-   **npm** (Node Package Manager): Comes with Node.js.
-   **Git**: For cloning the repository.

## Setup Steps

1.  **Clone the Repository (if you haven't already):**
    \`\`\`bash
    git clone <your-repository-url>
    cd snooker-club-desktop # Or whatever your frontend project folder is named
    \`\`\`

2.  **Install Dependencies:**
    Navigate to the frontend directory and install the required Node.js packages.
    \`\`\`bash
    npm install
    \`\`\`

3.  **Configure Backend API URL:**
    The Electron application needs to know where your backend API is running. You can set this using an environment variable.

    Create a `.env.local` file in the root of your frontend project (if it doesn't exist) and add the API URL:
    \`\`\`
    NEXT_PUBLIC_API_URL=http://localhost:5001 # Replace with your deployed backend API URL
    \`\`\`
    **Important**: If you deploy your backend to a different server, you **must** update this URL to point to your deployed backend's address (e.g., `https://your-server-ip:5001`). For production builds, you might set this directly in your `package.json` build script or through your CI/CD pipeline.

4.  **Run in Development Mode (Next.js):**
    To run the Next.js application in your browser for development:
    \`\`\`bash
    npm run dev
    \`\`\`
    This will start the Next.js development server, usually on `http://localhost:3000`.

5.  **Run as Electron Desktop App (Development):**
    To run the application as an Electron desktop app in development mode:
    \`\`\`bash
    npm run start:electron
    \`\`\`
    This will launch the Electron window, loading the Next.js development server.

6.  **Build for Production (Electron):**
    To create a distributable package for your Electron application (e.g., `.exe` for Windows, `.dmg` for macOS, `.AppImage` for Linux):
    \`\`\`bash
    npm run dist
    \`\`\`
    This command first builds the Next.js project (`npm run build:next`) and then uses `electron-builder` to package it. The final installers will be located in the `dist` folder.

## Important Notes

-   **CORS**: Ensure your backend API's CORS policy allows requests from your Electron application. For Electron, the origin might be `electron://.` or `file://`.
-   **API URL in Production**: When building for production, ensure `NEXT_PUBLIC_API_URL` is correctly set to your deployed backend API's address.
-   **Static Export**: The `next.config.mjs` is configured for `output: 'export'`, which means Next.js generates static HTML. This is necessary for bundling with Electron.
-   **Images**: `images.unoptimized: true` is set in `next.config.mjs` because static export does not support Next.js Image Optimization. Ensure all images are directly referenced or pre-optimized.
