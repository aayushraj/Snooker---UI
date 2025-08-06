# 🎱 Snooker Club Management System

A comprehensive desktop application for managing snooker club operations, built with Next.js frontend and .NET backend.

## Project Structure

\`\`\`
├── backend/          # .NET Web API backend
├── frontend/         # Next.js React frontend
└── public/          # Shared assets
\`\`\`

## Quick Start

### Backend (.NET API)
\`\`\`bash
cd backend
dotnet restore
dotnet run
\`\`\`

### Frontend (Next.js)
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

## Features

- **Table Management**: Real-time table status tracking
- **Session Management**: Start, pause, resume, and end sessions
- **Customer Management**: Member profiles with discount tiers
- **Menu & Orders**: Food and beverage ordering system
- **Billing**: Automated billing with tax and discount calculations
- **Dashboard**: Real-time statistics and analytics

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: .NET 8, Entity Framework Core, SQLite
- **Desktop**: Electron for cross-platform desktop app

## License

Private project for snooker club management.
\`\`\`

```csharp file="backend/Program.cs"
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Cors;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.OpenApi.Models;
using SnookerClubApi.Models;
using System;
using Microsoft.Extensions.Logging;

var builder = WebApplication.CreateBuilder(args);

// Configure JSON options to handle cycles and enums
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

// Add services to the container.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "SnookerClubApi", Version = "v1" });
});

// Configure SQLite database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin",
        builder => builder.WithOrigins("http://localhost:3000", "http://localhost:5001")
                         .AllowAnyHeader()
                         .AllowAnyMethod());
});

var app = builder.Build();

// Apply migrations and seed data on startup
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        context.Database.Migrate();
        SeedData.Initialize(context);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while migrating or seeding the database.");
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "SnookerClubApi v1"));
}

app.UseHttpsRedirection();
app.UseCors("AllowSpecificOrigin");

// Dashboard Stats API
app.MapGet("/api/dashboard/stats", async (AppDbContext db) =>
{
    var totalTables = await db.Tables.CountAsync();
    var activeSessions = await db.Sessions.Where(s => s.Status == SessionStatus.Active).ToListAsync();
    var pausedSessions = await db.Sessions.Where(s => s.Status == SessionStatus.Paused).ToListAsync();
    var availableTables = totalTables - activeSessions.Count - pausedSessions.Count;
    var reservedTables = 0;

    var totalRevenue = await db.Bills.SumAsync(b => b.GrandTotal);
    var tableRevenue = await db.Bills.SumAsync(b => b.TableCharges);
    var orderRevenue = await db.Bills.SumAsync(b => b.OrderCharges);

    var activeCustomers = await db.Sessions.Where(s => s.Status == SessionStatus.Active || s.Status == SessionStatus.Paused)
                                            .Select(s => s.CustomerId)
                                            .Distinct()
                                            .CountAsync();
    var totalOrders = await db.Orders.CountAsync();

    return Results.Ok(new
    {
        ActiveTables = activeSessions.Count,
        PausedTables = pausedSessions.Count,
        AvailableTables = availableTables > 0 ? availableTables : 0,
        ReservedTables = reservedTables,
        TotalRevenue = totalRevenue,
        TableRevenue = tableRevenue,
        OrderRevenue = orderRevenue,
        ActiveCustomers = activeCustomers,
        TotalOrders = totalOrders
    });
});

// Tables API
app.MapGet("/api/tables", async (AppDbContext db) =>
{
    var tables = await db.Tables
        .Include(t => t.CurrentSession)
            .ThenInclude(s => s.Customer)
        .ToListAsync();
    return Results.Ok(tables);
});

app.MapPost("/api/tables", async (Table table, AppDbContext db) =>
{
    db.Tables.Add(table);
    await db.SaveChangesAsync();
    return Results.Created($"/api/tables/{table.Id}", table);
});

app.MapPut("/api/tables/{id}", async (Guid id, Table updatedTable, AppDbContext db) =>
{
    var table = await db.Tables.FindAsync(id);
    if (table == null) return Results.NotFound();

    table.Name = updatedTable.Name;
    table.HourlyRate = updatedTable.HourlyRate;
    table.Location = updatedTable.Location;

    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.MapDelete("/api/tables/{id}", async (Guid id, AppDbContext db) =>
{
    var table = await db.Tables.FindAsync(id);
    if (table == null) return Results.NotFound();

    db.Tables.Remove(table);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

// Customers API
app.MapGet("/api/customers", async (AppDbContext db) =>
{
    return Results.Ok(await db.Customers.ToListAsync());
});

app.MapPost("/api/customers", async (Customer customer, AppDbContext db) =>
{
    customer.DiscountPercentage = customer.MembershipType switch
    {
        MembershipType.Basic => 0.05m,
        MembershipType.Premium => 0.10m,
        MembershipType.VIP => 0.15m,
        _ => 0m
    };
    db.Customers.Add(customer);
    await db.SaveChangesAsync();
    return Results.Created($"/api/customers/{customer.Id}", customer);
});

// Sessions API
app.MapPost("/api/sessions/start", async (StartSessionRequest request, AppDbContext db) =>
{
    var table = await db.Tables.Include(t => t.CurrentSession).FirstOrDefaultAsync(t => t.Id == request.TableId);
    if (table == null) return Results.NotFound("Table not found.");
    if (table.CurrentSession != null) return Results.BadRequest("Table is already occupied.");

    var customer = await db.Customers.FindAsync(request.CustomerId);
    if (customer == null) return Results.NotFound("Customer not found.");

    var session = new Session
    {
        TableId = request.TableId,
        CustomerId = request.CustomerId,
        StartTime = DateTime.UtcNow,
        Status = SessionStatus.Active,
        HourlyRate = table.HourlyRate,
        DiscountPercentage = customer.DiscountPercentage
    };

    db.Sessions.Add(session);
    table.CurrentSession = session;
    await db.SaveChangesAsync();
    return Results.Created($"/api/sessions/{session.Id}", session);
});

app.MapPost("/api/sessions/{id}/pause", async (Guid id, AppDbContext db) =>
{
    var session = await db.Sessions.FindAsync(id);
    if (session == null) return Results.NotFound();
    if (session.Status != SessionStatus.Active) return Results.BadRequest("Session is not active.");

    session.Status = SessionStatus.Paused;
    session.PausedAt = DateTime.UtcNow;
    await db.SaveChangesAsync();
    return Results.Ok(session);
});

app.MapPost("/api/sessions/{id}/resume", async (Guid id, AppDbContext db) =>
{
    var session = await db.Sessions.FindAsync(id);
    if (session == null) return Results.NotFound();
    if (session.Status != SessionStatus.Paused) return Results.BadRequest("Session is not paused.");
    if (!session.PausedAt.HasValue) return Results.BadRequest("Session was not properly paused.");

    session.Status = SessionStatus.Active;
    session.PausedDuration += (DateTime.UtcNow - session.PausedAt.Value);
    session.PausedAt = null;
    await db.SaveChangesAsync();
    return Results.Ok(session);
});

app.MapPost("/api/sessions/{id}/end", async (Guid id, AppDbContext db) =>
{
    var session = await db.Sessions
        .Include(s => s.Table)
        .Include(s => s.Customer)
        .Include(s => s.Orders)
            .ThenInclude(o => o.OrderItems)
                .ThenInclude(oi => oi.MenuItem)
        .FirstOrDefaultAsync(s => s.Id == id);

    if (session == null) return Results.NotFound();
    if (session.Status == SessionStatus.Ended) return Results.BadRequest("Session already ended.");

    session.Status = SessionStatus.Ended;
    session.EndTime = DateTime.UtcNow;

    var totalDuration = (session.EndTime.Value - session.StartTime) - session.PausedDuration;
    session.DurationMilliseconds = (long)totalDuration.TotalMilliseconds;

    var totalHours = (decimal)totalDuration.TotalHours;
    session.TableCharges = totalHours * session.HourlyRate;

    session.OrderCharges = session.Orders.SelectMany(o => o.OrderItems).Sum(oi => oi.Quantity * oi.MenuItem.Price);
    session.Subtotal = session.TableCharges + session.OrderCharges;
    session.DiscountAmount = session.Subtotal * session.DiscountPercentage;
    var discountedSubtotal = session.Subtotal - session.DiscountAmount;

    session.TaxRate = 0.10m;
    session.TaxAmount = discountedSubtotal * session.TaxRate;
    session.GrandTotal = discountedSubtotal + session.TaxAmount;

    var bill = new Bill
    {
        SessionId = session.Id,
        TableId = session.TableId.ToString(),
        TableName = session.Table.Name,
        CustomerId = session.CustomerId.ToString(),
        CustomerName = session.Customer.Name,
        MembershipType = session.Customer.MembershipType,
        StartTime = session.StartTime,
        EndTime = session.EndTime.Value,
        DurationMilliseconds = session.DurationMilliseconds,
        HourlyRate = session.HourlyRate,
        TableCharges = session.TableCharges,
        OrderItems = session.Orders.SelectMany(o => o.OrderItems).Select(oi => new BillOrderItem
        {
            MenuItemId = oi.MenuItemId.ToString(),
            MenuItemName = oi.MenuItem.Name,
            Quantity = oi.Quantity,
            Price = oi.MenuItem.Price,
            Total = oi.Quantity * oi.MenuItem.Price
        }).ToList(),
        OrderCharges = session.OrderCharges,
        Subtotal = session.Subtotal,
        DiscountPercentage = session.DiscountPercentage,
        DiscountAmount = session.DiscountAmount,
        TaxRate = session.TaxRate,
        TaxAmount = session.TaxAmount,
        GrandTotal = session.GrandTotal,
        Status = "Paid"
    };
    db.Bills.Add(bill);

    session.Table.CurrentSession = null;

    await db.SaveChangesAsync();
    return Results.Ok(bill);
});

// Menu API
app.MapGet("/api/menu", async (AppDbContext db) =>
{
    return Results.Ok(await db.MenuItems.ToListAsync());
});

app.MapPost("/api/menu", async (MenuItem item, AppDbContext db) =>
{
    db.MenuItems.Add(item);
    await db.SaveChangesAsync();
    return Results.Created($"/api/menu/{item.Id}", item);
});

app.MapPut("/api/menu/{id}", async (Guid id, MenuItem updatedItem, AppDbContext db) =>
{
    var item = await db.MenuItems.FindAsync(id);
    if (item == null) return Results.NotFound();

    item.Name = updatedItem.Name;
    item.Description = updatedItem.Description;
    item.Price = updatedItem.Price;
    item.Category = updatedItem.Category;
    item.IsAvailable = updatedItem.IsAvailable;

    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.MapDelete("/api/menu/{id}", async (Guid id, AppDbContext db) =>
{
    var item = await db.MenuItems.FindAsync(id);
    if (item == null) return Results.NotFound();

    db.MenuItems.Remove(item);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

// Orders API
app.MapPost("/api/orders", async (OrderRequest request, AppDbContext db) =>
{
    var session = await db.Sessions.Include(s => s.Orders).FirstOrDefaultAsync(s => s.Id == request.SessionId);
    if (session == null) return Results.NotFound("Session not found.");

    var order = new Order
    {
        SessionId = request.SessionId,
        OrderTime = DateTime.UtcNow,
        OrderItems = new List<OrderItem>()
    };

    foreach (var itemRequest in request.Items)
    {
        var menuItem = await db.MenuItems.FindAsync(itemRequest.MenuItemId);
        if (menuItem == null || !menuItem.IsAvailable)
        {
            return Results.BadRequest($"Menu item {itemRequest.MenuItemId} not found or not available.");
        }
        order.OrderItems.Add(new OrderItem
        {
            MenuItemId = itemRequest.MenuItemId,
            Quantity = itemRequest.Quantity
        });
    }

    db.Orders.Add(order);
    await db.SaveChangesAsync();
    return Results.Created($"/api/orders/{order.Id}", order);
});

app.MapGet("/api/orders/{sessionId}", async (Guid sessionId, AppDbContext db) =>
{
    var orders = await db.Orders
        .Where(o => o.SessionId == sessionId)
        .Include(o => o.OrderItems)
            .ThenInclude(oi => oi.MenuItem)
        .ToListAsync();
    return Results.Ok(orders);
});

app.Run();

namespace SnookerClubApi.Models
{
    public class Table
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = string.Empty;
        public decimal HourlyRate { get; set; }
        public string Location { get; set; } = string.Empty;
        public Session? CurrentSession { get; set; }
    }

    public class Customer
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = string.Empty;
        public MembershipType MembershipType { get; set; } = MembershipType.None;
        public decimal DiscountPercentage { get; set; } = 0m;
    }

    public enum MembershipType
    {
        None,
        Basic,
        Premium,
        VIP
    }

    public class Session
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid TableId { get; set; }
        public Table Table { get; set; } = null!;
        public Guid CustomerId { get; set; }
        public Customer Customer { get; set; } = null!;
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public TimeSpan PausedDuration { get; set; } = TimeSpan.Zero;
        public DateTime? PausedAt { get; set; }
        public SessionStatus Status { get; set; } = SessionStatus.Active;
        public decimal HourlyRate { get; set; }
        public decimal DiscountPercentage { get; set; }

        public long DurationMilliseconds { get; set; }
        public decimal TableCharges { get; set; }
        public decimal OrderCharges { get; set; }
        public decimal Subtotal { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal TaxRate { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal GrandTotal { get; set; }

        public ICollection<Order> Orders { get; set; } = new List<Order>();
    }

    public enum SessionStatus
    {
        Active,
        Paused,
        Ended
    }

    public class MenuItem
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Category { get; set; } = string.Empty;
        public bool IsAvailable { get; set; } = true;
    }

    public class Order
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid SessionId { get; set; }
        public Session Session { get; set; } = null!;
        public DateTime OrderTime { get; set; }
        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }

    public class OrderItem
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid OrderId { get; set; }
        public Order Order { get; set; } = null!;
        public Guid MenuItemId { get; set; }
        public MenuItem MenuItem { get; set; } = null!;
        public int Quantity { get; set; }
    }

    public class Bill
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid SessionId { get; set; }
        public string TableId { get; set; } = string.Empty;
        public string TableName { get; set; } = string.Empty;
        public string CustomerId { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public MembershipType MembershipType { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public long DurationMilliseconds { get; set; }
        public decimal HourlyRate { get; set; }
        public decimal TableCharges { get; set; }
        public ICollection<BillOrderItem> OrderItems { get; set; } = new List<BillOrderItem>();
        public decimal OrderCharges { get; set; }
        public decimal Subtotal { get; set; }
        public decimal DiscountPercentage { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal TaxRate { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal GrandTotal { get; set; }
        public string Status { get; set; } = "Pending";
    }

    public class BillOrderItem
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid BillId { get; set; }
        public string MenuItemId { get; set; } = string.Empty;
        public string MenuItemName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal Price { get; set; }
        public decimal Total { get; set; }
    }

    public class StartSessionRequest
    {
        public Guid TableId { get; set; }
        public Guid CustomerId { get; set; }
    }

    public class OrderRequest
    {
        public Guid SessionId { get; set; }
        public List<OrderItemRequest> Items { get; set; } = new List<OrderItemRequest>();
    }

    public class OrderItemRequest
    {
        public Guid MenuItemId { get; set; }
        public int Quantity { get; set; }
    }

    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Table> Tables { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<Session> Sessions { get; set; }
        public DbSet<MenuItem> MenuItems { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Bill> Bills { get; set; }
        public DbSet<BillOrderItem> BillOrderItems { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Table>()
                .HasOne(t => t.CurrentSession)
                .WithOne(s => s.Table)
                .HasForeignKey<Session>(s => s.TableId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Session>()
                .HasOne(s => s.Customer)
                .WithMany()
                .HasForeignKey(s => s.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Session>()
                .HasMany(s => s.Orders)
                .WithOne(o => o.Session)
                .HasForeignKey(o => o.SessionId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Order>()
                .HasMany(o => o.OrderItems)
                .WithOne(oi => oi.Order)
                .HasForeignKey(oi => oi.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.MenuItem)
                .WithMany()
                .HasForeignKey(oi => oi.MenuItemId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Bill>()
                .HasMany(b => b.OrderItems)
                .WithOne()
                .HasForeignKey(boi => boi.BillId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Customer>()
                .Property(c => c.MembershipType)
                .HasConversion<string>();

            modelBuilder.Entity<Session>()
                .Property(s => s.Status)
                .HasConversion<string>();

            modelBuilder.Entity<Bill>()
                .Property(b => b.MembershipType)
                .HasConversion<string>();

            base.OnModelCreating(modelBuilder);
        }
    }

    public static class SeedData
    {
        public static void Initialize(AppDbContext context)
        {
            context.Database.EnsureCreated();

            if (!context.Tables.Any())
            {
                context.Tables.AddRange(
                    new Table { Name = "Table 1", HourlyRate = 12.00m, Location = "Main Hall" },
                    new Table { Name = "Table 2", HourlyRate = 12.00m, Location = "Main Hall" },
                    new Table { Name = "Table 3", HourlyRate = 15.00m, Location = "VIP Room" },
                    new Table { Name = "Table 4", HourlyRate = 15.00m, Location = "VIP Room" },
                    new Table { Name = "Table 5", HourlyRate = 10.00m, Location = "Main Hall" },
                    new Table { Name = "Table 6", HourlyRate = 10.00m, Location = "Main Hall" }
                );
                context.SaveChanges();
            }

            if (!context.Customers.Any())
            {
                context.Customers.AddRange(
                    new Customer { Name = "Alice Smith", MembershipType = MembershipType.Basic, DiscountPercentage = 0.05m },
                    new Customer { Name = "Bob Johnson", MembershipType = MembershipType.Premium, DiscountPercentage = 0.10m },
                    new Customer { Name = "Charlie Brown", MembershipType = MembershipType.VIP, DiscountPercentage = 0.15m }
                );
                context.SaveChanges();
            }

            if (!context.MenuItems.Any())
            {
                context.MenuItems.AddRange(
                    new MenuItem { Name = "Coffee", Description = "Freshly brewed coffee", Price = 3.50m, Category = "Beverages", IsAvailable = true },
                    new MenuItem { Name = "Tea", Description = "Assorted tea selection", Price = 3.00m, Category = "Beverages", IsAvailable = true },
                    new MenuItem { Name = "Soda", Description = "Various soft drinks", Price = 2.50m, Category = "Beverages", IsAvailable = true },
                    new MenuItem { Name = "Water Bottle", Description = "Still or sparkling water", Price = 2.00m, Category = "Beverages", IsAvailable = true },
                    new MenuItem { Name = "French Fries", Description = "Crispy golden fries", Price = 4.00m, Category = "Snacks", IsAvailable = true },
                    new MenuItem { Name = "Nachos", Description = "Cheese and jalapeño nachos", Price = 7.50m, Category = "Snacks", IsAvailable = true },
                    new MenuItem { Name = "Club Sandwich", Description = "Classic club sandwich with fries", Price = 12.00m, Category = "Meals", IsAvailable = true },
                    new MenuItem { Name = "Pizza Slice", Description = "Pepperoni or Cheese", Price = 5.00m, Category = "Meals", IsAvailable = true },
                    new MenuItem { Name = "Beer (Local)", Description = "Craft local beer", Price = 6.00m, Category = "Alcohol", IsAvailable = true },
                    new MenuItem { Name = "Wine (Glass)", Description = "Red or White", Price = 8.00m, Category = "Alcohol", IsAvailable = true },
                    new MenuItem { Name = "Burger", Description = "Beef burger with cheese", Price = 10.00m, Category = "Meals", IsAvailable = true },
                    new MenuItem { Name = "Chips", Description = "Assorted potato chips", Price = 2.00m, Category = "Snacks", IsAvailable = true }
                );
                context.SaveChanges();
            }
        }
    }
}
