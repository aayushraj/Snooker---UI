# 🎱 Elite Snooker Club Management System (Desktop App)

A comprehensive full-stack management system for snooker clubs built with **Next.js 15**, **React 18**, **shadcn/ui**, **Electron**, and **C# .NET 8** with **SQLite**.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/aayushrajopadhyayas-projects/v0-snooker-club-ui-layout)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/d9ST0vYU9wh)

## 🚀 Features

### 📊 **Dashboard**
- **Real-time Statistics**: Active, paused, available, and reserved tables
- **Revenue Tracking**: Table revenue and order revenue with membership discounts
- **Customer Analytics**: Active customers and order statistics
- **Visual Cards**: Color-coded status indicators with icons

### 🎯 **Table Management**
- **Interactive Table Grid**: Visual representation of all tables with real-time status
- **Real-time Timers**: Live countdown showing exact session duration (hours, minutes, seconds)
- **Session Control**: Start, pause, resume, and end table sessions
- **Customer Integration**: Link customers to tables with membership benefits
- **Timer Tracking**: Automatic duration calculation with pause functionality
- **Configuration**: Add, edit, delete tables with custom rates and locations
- **Search Functionality**: Search tables by name, location, status, or customer name
- **Food Ordering**: Direct food ordering from table cards during active sessions

### 👥 **Customer Management**
- **Customer Profiles**: Complete customer information with contact details
- **Membership Plans**: 4-tier system (Walk-in, Basic 5%, Premium 10%, VIP 15%)
- **Quick Creation**: Streamlined customer creation dialog
- **Discount Application**: Automatic membership discounts on all services

### 🍽️ **Menu Management & Ordering**
- **Categorized Menu**: Beverages, Snacks, Meals, Alcohol
- **Interactive Order Dialog**: Full-featured ordering interface with categories
- **Real-time Ordering**: Place orders directly from table sessions
- **Quantity Management**: Add/remove items with visual quantity controls
- **Order Summary**: Live order total calculation with itemized breakdown
- **Availability Toggle**: Real-time menu item availability control
- **Price Management**: Easy pricing updates and descriptions

### 💰 **Billing System**
- **Comprehensive Bills**: Combined table time + food/beverage orders
- **Membership Discounts**: Automatic discount application based on membership
- **Tax Calculation**: Built-in tax calculation (10%)
- **Payment Tracking**: Pending, paid, and overdue status management
- **Detailed Breakdown**: Complete billing breakdown with itemized charges
- **Bill Management**: View, download, and print detailed invoices

### 🔧 **Backend API**
- **RESTful APIs**: Complete CRUD operations for all entities
- **Real-time Data**: Live dashboard statistics and table status
- **Database Management**: SQLite with Entity Framework Core
- **Automatic Seeding**: Sample data for immediate testing

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **UI Library**: React 18 with TypeScript
- **Components**: shadcn/ui with Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React hooks and context
- **Real-time Updates**: 1-second interval timers for live data

### Desktop Application
- **Framework**: Electron
- **Packaging**: Electron Builder

### Backend
- **Framework**: .NET 8 Minimal APIs
- **Database**: SQLite with Entity Framework Core
- **Architecture**: Clean API design with proper separation
- **CORS**: Configured for frontend integration

## 📦 Installation & Setup

### Frontend Setup (for development)
\`\`\`bash
# Install dependencies
npm install

# Run Next.js development server (for Electron dev mode)
npm run dev
\`\`\`

### Backend Setup
\`\`\`bash
# Navigate to backend directory
cd backend

# Restore packages
dotnet restore

# Run the API server
dotnet run
\`\`\`

The API will be available at `https://localhost:5001`. Ensure your frontend (Next.js/Electron) is configured to call this URL.

### Running the Desktop Application

#### Development Mode
To run the Electron app in development mode (which connects to the Next.js dev server):
1. Start the Next.js development server: `npm run dev`
2. In a separate terminal, start the Electron app: `npm run start:electron`

#### Building and Running Production Desktop App
1. Build the Next.js static site: `npm run build:next`
2. Build the Electron application: `npm run build:electron`
   (This will create an executable installer in the `dist` folder, e.g., `.exe` for Windows, `.dmg` for macOS, `.AppImage` for Linux)
3. To run the built Electron app directly (after `npm run build:next`): `npm run start:electron`

## 🗄️ Database Schema

### Core Entities
- **Tables**: Configuration and current session tracking
- **Customers**: Profiles with membership tiers
- **Sessions**: Table usage with customer linking
- **MenuItems**: Categorized food and beverage items
- **Orders & OrderItems**: Food/beverage orders with quantities
- **Bills**: Comprehensive billing with discounts and tax

### Key Relationships
- Tables ↔ Sessions (One-to-One current session)
- Customers ↔ Sessions (One-to-Many)
- Sessions ↔ Bills (One-to-One)
- Orders ↔ OrderItems (One-to-Many)
- MenuItems ↔ OrderItems (One-to-Many)

## 🔄 Workflows

### 1. **Customer Check-in**
1. Customer arrives → Create/Select customer profile
2. Choose membership plan (Walk-in, Basic, Premium, VIP)
3. Select available table → Start session with real-time timer
4. Automatic discount application based on membership

### 2. **Food Ordering Process**
1. Click "Order Food" button on active table
2. Browse categorized menu (Beverages, Snacks, Meals, Alcohol)
3. Add items to order with quantity controls
4. Review order summary with live total calculation
5. Place order - automatically linked to table session

### 3. **Session Management**
1. **Start**: Link customer to table with timer start
2. **Pause**: Temporarily pause session (break time) - timer pauses
3. **Resume**: Continue session with accurate time tracking
4. **End**: Generate comprehensive bill with all charges

### 4. **Billing Process**
1. **Table Charges**: Calculated based on duration and hourly rate
2. **Food/Beverage**: All orders during session included
3. **Membership Discount**: Applied to total before tax
4. **Tax Calculation**: 10% tax on discounted amount
5. **Payment Tracking**: Mark as paid/pending/overdue

## 🎨 UI Components

### Dashboard Cards
- **Active Tables** (Green): Currently occupied tables
- **Paused Tables** (Yellow): Temporarily paused sessions
- **Available Tables** (Blue): Ready for new customers
- **Reserved Tables** (Purple): Advance bookings
- **Revenue Cards**: Real-time financial tracking

### Interactive Elements
- **Real-time Timers**: Live session duration display
- **Customer Creation Dialog**: Multi-step customer onboarding
- **Order Dialog**: Full-featured food ordering interface
- **Table Status Cards**: Real-time session information
- **Search Bar**: Filter tables by multiple criteria
- **Menu Management**: Category-based organization
- **Billing Details**: Comprehensive bill breakdown

## 🔍 **Search & Navigation**
- **Table Search**: Search by table name, location, status, or customer name
- **Smart Navigation**: Table Settings button redirects to Settings page
- **Real-time Filtering**: Instant search results as you type
- **No Results Handling**: Helpful messages when no matches found

## 🔐 Membership System

| Plan | Discount | Benefits |
|------|----------|----------|
| **Walk-in** | 0% | Standard service |
| **Basic** | 5% | Discount on all services |
| **Premium** | 10% | Discount + priority booking |
| **VIP** | 15% | Maximum discount + exclusive benefits |

## 📈 Analytics & Reporting

- **Real-time Dashboard**: Live statistics and KPIs
- **Revenue Tracking**: Table and order revenue separation
- **Customer Analytics**: Active customer count and patterns
- **Order Statistics**: Daily order volume and completion rates
- **Table Utilization**: Usage patterns and availability metrics
- **Live Timers**: Real-time session duration tracking

## 🚀 Deployment

### Frontend (Vercel)
The frontend is automatically deployed to Vercel with each commit.

### Backend (Local/Server)
\`\`\`bash
# Publish for production
dotnet publish -c Release

# Run in production
dotnet SnookerClubApi.dll
\`\`\`

## 🔧 Configuration

### Environment Variables
- `ConnectionStrings__DefaultConnection`: SQLite database path
- `CORS_ORIGINS`: Allowed frontend origins

### Database Configuration
The system automatically creates and seeds the SQLite database on first run with:
- 6 sample tables (Main Hall & VIP Room)
- 12 menu items across 4 categories (Beverages, Snacks, Meals, Alcohol)
- 3 sample customers with different membership tiers

## 📝 API Endpoints

### Dashboard
- `GET /api/dashboard/stats` - Real-time dashboard statistics

### Tables
- `GET /api/tables` - Get all tables with current sessions
- `POST /api/tables` - Create new table
- `PUT /api/tables/{id}` - Update table configuration
- `DELETE /api/tables/{id}` - Delete table

### Customers
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create new customer

### Sessions
- `POST /api/sessions/start` - Start new session
- `POST /api/sessions/{id}/pause` - Pause session
- `POST /api/sessions/{id}/resume` - Resume session
- `POST /api/sessions/{id}/end` - End session and generate bill

### Menu
- `GET /api/menu` - Get all menu items
- `POST /api/menu` - Create menu item
- `PUT /api/menu/{id}` - Update menu item
- `DELETE /api/menu/{id}` - Delete menu item

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/{sessionId}` - Get orders for session

### Billing
- `GET /api/bills` - Get all bills with details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [v0.dev](https://v0.dev) - AI-powered development platform
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide React](https://lucide.dev)

---

## 📋 Version History

| Version | Date | Features Added | Developer Notes |
|---------|------|----------------|-----------------|
| **v1.0.0** | 2024-01-08 | Initial release with basic table management | Basic CRUD operations for tables |
| **v1.1.0** | 2024-01-08 | Added customer creation dialog with membership plans | 4-tier membership system implemented |
| **v1.2.0** | 2024-01-08 | Enhanced dashboard with 8 statistical cards | Real-time statistics for tables and orders |
| **v1.3.0** | 2024-01-08 | Complete table overview with session management | Start, pause, resume, end session functionality |
| **v1.4.0** | 2024-01-08 | Menu management system with categories | Full CRUD for beverages, snacks, meals, alcohol |
| **v1.5.0** | 2024-01-08 | Comprehensive billing system with discounts | Automatic membership discounts and tax calculation |
| **v1.6.0** | 2024-01-08 | Complete C# .NET backend API with SQLite | RESTful APIs for all frontend functionality |
| **v1.7.0** | 2024-01-08 | Table management configuration panel | Add, edit, delete tables with custom settings |
| **v1.8.0** | 2024-01-08 | Order management integration | Link food/beverage orders to table sessions |
| **v1.9.0** | 2024-01-08 | Enhanced UI with proper navigation and components | All sections properly implemented and functional |
| **v2.0.0** | 2024-01-08 | Production-ready system with full documentation | Complete system with README and deployment guide |
| **v2.1.0** | 2024-01-08 | Real-time timers for table sessions | Live countdown showing hours, minutes, seconds |
| **v2.2.0** | 2024-01-08 | Food ordering system with interactive dialog | Full-featured ordering interface with categories |
| **v2.3.0** | 2024-01-08 | Table search functionality and settings navigation | Search by name, location, status, customer |
| **v2.4.0** | 2025-08-05 | Electron desktop application conversion | Project configured to run as a desktop app |

### 🎯 Upcoming Features (Roadmap)
- **v2.5.0**: Real-time WebSocket notifications for table status changes
- **v2.6.0**: Advanced analytics dashboard with charts and graphs
- **v2.7.0**: Booking system for advance table reservations
- **v2.8.0**: Member management with detailed profiles and history
- **v2.9.0**: Payment integration with Stripe/PayPal
- **v3.0.0**: Export functionality for reports (PDF/Excel)
- **v3.1.0**: Multi-location support for club chains

---

**Built with ❤️ using v0.dev - The future of AI-powered development**
\`\`\`

```plaintext file="SnookerClubApi.csproj"
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
