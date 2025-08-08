# Migration Guide: Restructuring to Frontend/Backend Separation

This guide helps you migrate from the current mixed structure to the new separated frontend/backend structure.

## What's Changed

### New Structure
```
Snooker---UI/
├── frontend/          # Next.js application
│   ├── app/          # Next.js app directory
│   ├── components/   # React components
│   ├── hooks/        # Custom hooks
│   ├── lib/          # Utilities
│   ├── public/       # Static assets
│   └── package.json  # Frontend dependencies
├── backend/           # ASP.NET Core API
│   ├── Controllers/  # API controllers
│   ├── Data/         # Database context
│   ├── Program.cs    # Application entry
│   └── appsettings.json
└── README.md
```

## Migration Steps

### 1. Copy Frontend Files
The following files have been moved to the `frontend/` directory:
- `package.json` → `frontend/package.json`
- `next.config.mjs` → `frontend/next.config.mjs`
- `tsconfig.json` → `frontend/tsconfig.json`
- `postcss.config.mjs` → `frontend/postcss.config.mjs`
- `components.json` → `frontend/components.json`
- `app/` → `frontend/app/`
- `components/` → `frontend/components/`
- `hooks/` → `frontend/hooks/`
- `lib/` → `frontend/lib/`
- `public/` → `frontend/public/`

### 2. Copy Backend Files
The following files have been moved to the `backend/` directory:
- `Program.cs` → `backend/Program.cs`
- `SnookerClubApi.csproj` → `backend/SnookerClubApi.csproj`
- `appsettings.json` → `backend/appsettings.json`

### 3. Environment Variables
- Frontend: Use `frontend/env.local` (copy to `.env.local`)
- Backend: Use `backend/appsettings.Development.json` for development

### 4. Update Dependencies
Frontend dependencies are now in `frontend/package.json`
Backend dependencies are in `backend/SnookerClubApi.csproj`

## Running the Application

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
dotnet restore
dotnet run
```

## Benefits of New Structure

1. **Separation of Concerns**: Frontend and backend are completely separate
2. **Independent Deployment**: Each can be deployed to different platforms
3. **Environment Security**: Sensitive data is properly externalized
4. **Scalability**: Each part can scale independently
5. **Team Development**: Different teams can work on frontend/backend

## Security Improvements

- Environment variables for sensitive configuration
- CORS properly configured for frontend-backend communication
- JWT settings ready for authentication implementation
- Database connection strings externalized

## Next Steps

1. Test both frontend and backend independently
2. Update any hardcoded API URLs to use environment variables
3. Set up proper environment variables for production
4. Configure deployment pipelines for both applications
