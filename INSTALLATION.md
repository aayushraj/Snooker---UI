# 🛠️ Installation Guide: Elite Snooker Club Management System

This document provides step-by-step instructions to set up and run the Elite Snooker Club Management System, which includes a Next.js/Electron frontend and a C# .NET backend with SQLite.

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

*   **Git**: For cloning the repository.
    *   [Download Git](https://git-scm.com/downloads)
*   **Node.js & npm**: For the Next.js frontend and Electron. It's recommended to use the LTS version.
    *   [Download Node.js](https://nodejs.org/en/download/)
*   **.NET SDK 8.0**: For the C# backend API.
    *   [Download .NET SDK](https://dotnet.microsoft.com/download/dotnet/8.0)

## ⬇️ 1. Clone the Repository

First, clone the project repository to your local machine:

\`\`\`bash
git clone <repository-url>
cd snooker-club-management-system # Or whatever your cloned directory is named
\`\`\`

## ⚙️ 2. Backend Setup (C# .NET API with SQLite)

The backend API is built with C# .NET 8 and uses SQLite for data storage. The database will be automatically created and seeded on the first run.

1.  **Navigate to the Backend Directory**:
    \`\`\`bash
    cd backend
    \`\`\`

2.  **Restore NuGet Packages**:
    \`\`\`bash
    dotnet restore
    \`\`\`

3.  **Run the API Server**:
    This command will start the backend API. On the first run, it will create the `SnookerClub.db` SQLite database file in the `backend` directory and seed it with initial data.
    \`\`\`bash
    dotnet run
    \`\`\`
    The API will typically run on `https://localhost:5001` (or `http://localhost:5000`). Keep this terminal window open as long as you want the backend to be running.

## 🖥️ 3. Frontend Setup (Next.js & Electron)

The frontend is a Next.js application that will be packaged and run as a desktop application using Electron.

1.  **Navigate to the Frontend Directory**:
    Open a **new terminal window** and navigate back to the root of the project, then into the frontend directory (assuming your backend is in a `backend` folder and frontend is in the root).
    \`\`\`bash
    cd .. # If you are still in the 'backend' directory
    # If your frontend is in a subfolder, navigate to it, e.g., cd frontend
    \`\`\`

2.  **Install Node.js Dependencies**:
    \`\`\`bash
    npm install
    \`\`\`

3.  **Running the Desktop Application**

    There are two ways to run the desktop application: in development mode (for active development) or as a built production application.

    ### 3.1. Development Mode (Recommended for Development)

    This mode allows for faster iteration as it runs the Next.js development server and Electron separately. Changes to your React code will hot-reload in the Electron window.

    1.  **Start the Next.js Development Server**:
        In your current terminal (where you installed npm dependencies), run:
        \`\`\`bash
        npm run dev
        \`\`\`
        This will start the Next.js app on `http://localhost:3000`. Keep this terminal open.

    2.  **Start the Electron Application**:
        Open a **third terminal window** and navigate to the root of your project (where `package.json` is located). Then run:
        \`\`\`bash
        npm run start:electron
        \`\`\`
        An Electron window will open, loading the Next.js application from `http://localhost:3000`.

    ### 3.2. Building and Running Production Desktop App

    This process creates a standalone executable installer for your operating system.

    1.  **Build the Next.js Static Site**:
        This command compiles your Next.js application into static HTML, CSS, and JavaScript files, which Electron will then package.
        \`\`\`bash
        npm run build:next
        \`\`\`
        The output will be in the `out` directory.

    2.  **Build the Electron Application**:
        This command uses `electron-builder` to package the Next.js static output and Electron code into a distributable application.
        \`\`\`bash
        npm run build:electron
        \`\`\`
        This process might take a few minutes. Once completed, you will find the installer/executable in the newly created `dist` folder at the root of your project.

        *   **Windows**: `.exe` installer
        *   **macOS**: `.dmg` or `.zip` archive
        *   **Linux**: `.AppImage`, `.deb`, or `.rpm`

    3.  **Run the Built Electron App (Optional, for testing the build)**:
        After `npm run build:next` is complete, you can run the packaged Electron app directly without building the installer:
        \`\`\`bash
        npm run start:electron
        \`\`\`
        This will launch the Electron app using the static files from the `out` directory.

## ⚠️ Important Notes

*   **Backend API URL**: The frontend expects the backend API to be running at `https://localhost:5001`. If your backend runs on a different port or host, you will need to update the API calls in the frontend code (e.g., in `components/dashboard-stats.tsx`, `components/tables-overview.tsx`, etc.) to point to the correct URL.
*   **SQLite Database**: The `SnookerClub.db` file will be created in the `backend` directory when you first run `dotnet run`. If you want to reset the database, simply delete this file and run `dotnet run` again.
*   **CORS**: The backend is configured to allow CORS from `http://localhost:3000` (for Next.js dev server) and `electron://.` (for Electron). If you run your frontend from a different origin, you might need to adjust the CORS policy in `Program.cs` in the backend.

## Troubleshooting

*   **"Address already in use"**: If you get this error when running `npm run dev` or `dotnet run`, it means another process is already using the required port (3000 for Next.js, 5000/5001 for .NET). You can either stop the other process or configure the applications to use different ports.
*   **Frontend not connecting to Backend**:
    *   Ensure the backend API is running (`dotnet run` terminal is active).
    *   Verify the API URL in your frontend code matches the actual backend address.
    *   Check your browser's developer console for network errors (CORS issues, failed fetches).
*   **Electron build issues**: Ensure all Node.js dependencies are correctly installed (`npm install`) and that you have the necessary build tools for your operating system (e.g., Xcode for macOS, build-essential for Linux).

---

You are now ready to manage your Snooker Club with a powerful desktop application!
