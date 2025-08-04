# 🎱 Elite Snooker Club Management System

A comprehensive full-stack management system for snooker clubs built with **Next.js 15**, **React 18**, **shadcn/ui**, and **C# .NET 8** with **SQLite**.

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
- **Session Control**: Start, pause, resume, and end table sessions
- **Customer Integration**: Link customers to tables with membership benefits
- **Timer Tracking**: Automatic duration calculation with pause functionality
- **Configuration**: Add, edit, delete tables with custom rates and locations

### 👥 **Customer Management**
- **Customer Profiles**: Complete customer information with contact details
- **Membership Plans**: 4-tier system (Walk-in, Basic 5%, Premium 10%, VIP 15%)
- **Quick Creation**: Streamlined customer creation dialog
- **Discount Application**: Automatic membership discounts on all services

### 🍽️ **Menu Management**
- **Categorized Menu**: Beverages, Snacks, Meals, Alcohol
- **Availability Toggle**: Real-time menu item availability control
- **Price Management**: Easy pricing updates and descriptions
- **Order Integration**: Direct ordering from menu to tables

### 💰 **Billing System**
- **Comprehensive Bills**: Combined table time + food/beverage orders
- **Membership Discounts**: Automatic discount application based on membership
- **Tax Calculation**: Built-in tax calculation (10%)
- **Payment Tracking**: Pending, paid, and overdue status management
- **Detailed Breakdown**: Complete billing breakdown with itemized charges

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

### Backend
- **Framework**: .NET 8 Minimal APIs
- **Database**: SQLite with Entity Framework Core
- **Architecture**: Clean API design with proper separation
- **CORS**: Configured for frontend integration

## 📦 Installation & Setup

### Frontend Setup
\`\`\`bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
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

The API will be available at `https://localhost:5001` and the frontend at `http://localhost:3000`.

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
3. Select available table → Start session
4. Automatic discount application based on membership

### 2. **Order Management**
1. Customer places food/beverage order
2. Order linked to table and customer
3. Real-time order tracking (Pending → Preparing → Completed)
4. Orders automatically included in final bill

### 3. **Session Management**
1. **Start**: Link customer to table with timer start
2. **Pause**: Temporarily pause session (break time)
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
- **Customer Creation Dialog**: Multi-step customer onboarding
- **Table Status Cards**: Real-time session information
- **Menu Management**: Category-based organization
- **Billing Details**: Comprehensive bill breakdown

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
- 8 menu items across 4 categories
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

### 🎯 Upcoming Features (Roadmap)
- **v2.1.0**: Real-time WebSocket notifications for table status changes
- **v2.2.0**: Advanced analytics dashboard with charts and graphs
- **v2.3.0**: Booking system for advance table reservations
- **v2.4.0**: Member management with detailed profiles and history
- **v2.5.0**: Payment integration with Stripe/PayPal
- **v2.6.0**: Export functionality for reports (PDF/Excel)
- **v2.7.0**: Mobile app companion for staff
- **v2.8.0**: Multi-location support for club chains

---

**Built with ❤️ using v0.dev - The future of AI-powered development**
