# Snooker Club Management System

A comprehensive management system for snooker clubs with separate frontend and backend applications.

## Project Structure

```
Snooker---UI/
├── frontend/                 # Next.js React application
│   ├── app/                 # Next.js app directory
│   ├── components/          # React components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   ├── public/             # Static assets
│   ├── package.json        # Frontend dependencies
│   └── env.local           # Frontend environment variables
├── backend/                 # ASP.NET Core API
│   ├── Controllers/        # API controllers
│   ├── Data/              # Database context and models
│   ├── Program.cs          # Application entry point
│   ├── SnookerClubApi.csproj
│   ├── appsettings.json   # Backend configuration
│   └── appsettings.Development.json
└── README.md              # This file
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- .NET 8.0 SDK
- SQLite (for development)

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. Set up environment variables:
   - Copy `env.local` to `.env.local`
   - Update the API URL if needed

4. Start the development server:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

The frontend will be available at `http://localhost:3000`

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Restore .NET packages:
   ```bash
   dotnet restore
   ```

3. Run the API:
   ```bash
   dotnet run
   ```

The API will be available at `http://localhost:5000`

## Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=Snooker Club Management
NEXT_PUBLIC_APP_VERSION=1.0.0
NODE_ENV=development
```

### Backend (appsettings.Development.json)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=snooker.db"
  },
  "JwtSettings": {
    "SecretKey": "your-super-secret-key-here-change-in-production",
    "Issuer": "SnookerClubApi",
    "Audience": "SnookerClubFrontend",
    "ExpirationInMinutes": 60
  },
  "CorsSettings": {
    "AllowedOrigins": ["http://localhost:3000", "http://localhost:3001"]
  }
}
```

## Security Features

- Environment variables for sensitive configuration
- CORS configuration for frontend-backend communication
- JWT settings for authentication (ready for implementation)
- Database connection string externalized

## Development

### Frontend Development
- Built with Next.js 15 and React 19
- Uses Tailwind CSS for styling
- Shadcn/ui components for UI elements
- TypeScript for type safety

### Backend Development
- ASP.NET Core 8.0 Web API
- Entity Framework Core for database operations
- SQLite for development database
- Swagger/OpenAPI for API documentation

## Deployment

### Frontend Deployment
- Can be deployed to Vercel, Netlify, or any static hosting
- Environment variables should be set in deployment platform
- Build command: `npm run build`

### Backend Deployment
- Can be deployed to Azure, AWS, or any .NET hosting
- Update connection strings and JWT settings for production
- Use proper database (SQL Server, PostgreSQL) for production

## API Endpoints

The backend provides RESTful API endpoints:

- `GET /api/tables` - Get all tables
- `GET /api/tables/{id}` - Get specific table
- `POST /api/tables` - Create new table
- `PUT /api/tables/{id}` - Update table
- `DELETE /api/tables/{id}` - Delete table

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
