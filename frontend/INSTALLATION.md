# Snooker Club Management System - Installation Guide

This guide will walk you through setting up and running the Snooker Club Management System. The system consists of two main parts: a .NET Minimal API backend and a Next.js/Electron frontend.

## Prerequisites

Before you begin, ensure you have the following installed:

-   **Node.js**: Version 18 or higher.
    -   [Download Node.js](https://nodejs.org/en/download/)
-   **npm** (Node Package Manager): Comes with Node.js.
-   **.NET SDK**: Version 8.0 or higher.
    -   [Download .NET SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
-   **Git**: For cloning the repository.
    -   [Download Git](https://git-scm.com/downloads)

## Backend Setup (.NET Minimal API)

The backend is a .NET Minimal API that handles all data persistence and business logic.

1.  **Navigate to the Backend Directory**:
    Open your terminal or command prompt and navigate to the `backend` directory:
    \`\`\`bash
    cd backend
    \`\`\`

2.  **Restore NuGet Packages**:
    Install all necessary .NET dependencies:
    \`\`\`bash
    dotnet restore
    \`\`\`

3.  **Run Database Migrations**:
    The application uses SQLite and Entity Framework Core. The database will be created and migrated automatically on startup if it doesn't exist or is outdated.

4.  **Run the API Server**:
    Start the backend API. It will typically run on `http://localhost:5001`.
    \`\`\`bash
    dotnet run
    \`\`\`
    You should see output indicating the server is listening on `http://localhost:5001`.

5.  **Test API Endpoints (Optional)**:
    Once the server is running, you can access the Swagger UI to test the API endpoints:
    Open your web browser and go to `http://localhost:5001/swagger`.

## Frontend Setup (Next.js / Electron)

The frontend is a Next.js application that can be run as a web app or packaged into an Electron desktop application.

1.  **Navigate to the Frontend Directory**:
    Open a **new** terminal or command prompt window and navigate to the `frontend` directory:
    \`\`\`bash
    cd frontend
    \`\`\`

2.  **Install Node.js Dependencies**:
    Install all necessary npm packages:
    \`\`\`bash
    npm install
    \`\`\`

3.  **Configure Environment Variables**:
    The frontend needs to know where your backend API is running. Create a `.env.local` file in the `frontend` directory:
    \`\`\`
    NEXT_PUBLIC_API_URL=http://localhost:5001
    \`\`\`
    Make sure the URL matches where your .NET API is running.

4.  **Run the Frontend in Development Mode (Web App)**:
    To run the Next.js application in your browser:
    \`\`\`bash
    npm run dev
    \`\`\`
    The application will typically be available at `http://localhost:3000`.

5.  **Run the Frontend as an Electron Desktop App (Optional)**:
    If you want to run the application as a desktop app (requires the backend to be running):
    \`\`\`bash
    npm run electron:dev
    \`\`\`
    This will open a new Electron window with the application.

6.  **Build the Electron Desktop App (Optional)**:
    To create a distributable desktop application (e.g., `.exe` for Windows, `.dmg` for macOS, `.AppImage` for Linux):
    \`\`\`bash
    npm run electron:build
    \`\`\`
    The build output will be in the `dist_electron` directory.

## Important Notes

-   **CORS**: The backend is configured with CORS to allow requests from `http://localhost:3000` (Next.js dev server) and `http://localhost:5001` (itself). If you change frontend ports or deploy to a different domain, you'll need to update the `AllowSpecificOrigin` policy in `backend/Program.cs`.
-   **Database File**: The SQLite database file (`SnookerClub.db`) will be created in the `backend` directory when you first run the .NET API.
-   **API URL**: Ensure `NEXT_PUBLIC_API_URL` in `frontend/.env.local` correctly points to your running backend API.
-   **Incremental Development**: It's recommended to start the backend first, ensure it's running correctly (e.g., via Swagger), and then start the frontend.

You are now ready to use the Snooker Club Management System!
