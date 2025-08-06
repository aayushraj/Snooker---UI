# Snooker Club Management System - Installation Guide

This guide will walk you through setting up and running the Snooker Club Management System, which consists of a .NET Minimal API backend and a Next.js/Electron frontend.

## Prerequisites

Before you begin, ensure you have the following installed:

1.  **Node.js (LTS version)**: [Download & Install Node.js](https://nodejs.org/en/download/)
2.  **npm (Node Package Manager)**: Comes with Node.js.
3.  **.NET SDK (8.0 or later)**: [Download & Install .NET](https://dotnet.microsoft.com/download/dotnet/8.0)
4.  **Git**: [Download & Install Git](https://git-scm.com/downloads)

## Backend Setup (.NET Minimal API)

The backend is a .NET Minimal API that uses SQLite for data persistence.

1.  **Navigate to the backend directory**:
    \`\`\`bash
    cd backend
    \`\`\`

2.  **Restore NuGet packages**:
    \`\`\`bash
    dotnet restore
    \`\`\`

3.  **Apply database migrations**:
    This will create the `SnookerClub.db` SQLite database file in the `backend` directory.
    \`\`\`bash
    dotnet ef database update
    \`\`\`

4.  **Run the API server**:
    \`\`\`bash
    dotnet run
    \`\`\`
    The API will typically run on `http://localhost:5000` or `http://localhost:5001` (check the console output). Keep this terminal open as the backend needs to be running for the frontend to function.

    You can test the API endpoints by navigating to `http://localhost:5001/swagger` (or your API's base URL + `/swagger`) in your browser.

## Frontend Setup (Next.js / Electron)

The frontend is a Next.js application that can be run as a web app or packaged into an Electron desktop application.

1.  **Navigate to the frontend directory**:
    Open a **new terminal window** and navigate to the frontend directory:
    \`\`\`bash
    cd frontend
    \`\`\`

2.  **Install Node.js dependencies**:
    \`\`\`bash
    npm install
    \`\`\`

3.  **Configure Environment Variables**:
    Create a `.env.local` file in the `frontend` directory and add the following:
    \`\`\`
    NEXT_PUBLIC_API_URL=http://localhost:5001
    \`\`\`
    **Important**: Replace `http://localhost:5001` with the actual URL where your backend API is running if it's different.

4.  **Run the Next.js development server (Web App)**:
    \`\`\`bash
    npm run dev
    \`\`\`
    This will start the Next.js development server, usually on `http://localhost:3000`. Open this URL in your web browser to access the frontend.

5.  **Run the Electron desktop application (Optional)**:
    If you want to run it as a desktop application:
    \`\`\`bash
    npm run electron:dev
    \`\`\`
    This will open the Electron application window.

6.  **Build the Electron desktop application (Optional)**:
    To create a distributable desktop application (e.g., `.exe` for Windows, `.dmg` for macOS, `.AppImage` for Linux):
    \`\`\`bash
    npm run electron:build
    \`\`\`
    The build output will be in the `release` directory.

## Important Notes

*   **CORS**: The backend is configured with CORS to allow requests from `http://localhost:3000` (Next.js dev server) and `http://localhost:5173` (if you use Vite for frontend). If your frontend runs on a different port or domain, you'll need to update the `AllowSpecificOrigin` policy in `backend/Program.cs`.
*   **Database**: The SQLite database file (`SnookerClub.db`) will be created in the `backend` directory. You can use a SQLite browser (e.g., [DB Browser for SQLite](https://sqlitebrowser.org/)) to inspect the database content.
*   **API URL**: Ensure `NEXT_PUBLIC_API_URL` in your `frontend/.env.local` matches the actual URL of your running backend API. For production deployment, this environment variable will need to be set in your hosting environment.
*   **Electron Build**: Building the Electron app might take some time, as it bundles the Next.js app and Electron runtime.

---

You are now ready to manage your snooker club!
