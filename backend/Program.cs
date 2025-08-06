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
using System.Collections.Concurrent;

var builder = WebApplication.CreateBuilder(args);

// Configure JSON options to handle cycles and enums
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

// Add services to the container.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure SQLite database
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add CORS policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin",
        builder => builder.WithOrigins("http://localhost:3000", "http://localhost:5173") // Allow your frontend origin
                          .AllowAnyHeader()
                          .AllowAnyMethod());
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Use CORS policy
app.UseCors("AllowSpecificOrigin");

// Apply migrations on startup
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    dbContext.Database.Migrate();
}

// API Endpoints
app.MapGet("/api/tables", async (ApplicationDbContext db) =>
{
    var tables = await db.Tables
        .Include(t => t.CurrentSession)
            .ThenInclude(s => s.Customer)
        .Include(t => t.CurrentSession)
            .ThenInclude(s => s.Orders)
                .ThenInclude(o => o.OrderItems)
                    .ThenInclude(oi => oi.MenuItem)
        .ToListAsync();
    return Results.Ok(tables);
});

app.MapPost("/api/tables", async (Table table, ApplicationDbContext db) =>
{
    db.Tables.Add(table);
    await db.SaveChangesAsync();
    return Results.Created($"/api/tables/{table.Id}", table);
});

app.MapPut("/api/tables/{id}", async (Guid id, Table updatedTable, ApplicationDbContext db) =>
{
    var table = await db.Tables.FindAsync(id);
    if (table == null) return Results.NotFound();

    table.Name = updatedTable.Name;
    table.HourlyRate = updatedTable.HourlyRate;
    table.Location = updatedTable.Location;

    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.MapDelete("/api/tables/{id}", async (Guid id, ApplicationDbContext db) =>
{
    var table = await db.Tables.FindAsync(id);
    if (table == null) return Results.NotFound();

    db.Tables.Remove(table);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.MapGet("/api/customers", async (ApplicationDbContext db) =>
{
    var customers = await db.Customers.ToListAsync();
    return Results.Ok(customers);
});

app.MapPost("/api/customers", async (Customer customer, ApplicationDbContext db) =>
{
    db.Customers.Add(customer);
    await db.SaveChangesAsync();
    return Results.Created($"/api/customers/{customer.Id}", customer);
});

app.MapGet("/api/menu", async (ApplicationDbContext db) =>
{
    var menuItems = await db.MenuItems.ToListAsync();
    return Results.Ok(menuItems);
});

app.MapPost("/api/menu", async (MenuItem item, ApplicationDbContext db) =>
{
    db.MenuItems.Add(item);
    await db.SaveChangesAsync();
    return Results.Created($"/api/menu/{item.Id}", item);
});

app.MapPut("/api/menu/{id}", async (Guid id, MenuItem updatedItem, ApplicationDbContext db) =>
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

app.MapDelete("/api/menu/{id}", async (Guid id, ApplicationDbContext db) =>
{
    var item = await db.MenuItems.FindAsync(id);
    if (item == null) return Results.NotFound();

    db.MenuItems.Remove(item);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.MapPost("/api/sessions/start", async (StartSessionRequest request, ApplicationDbContext db) =>
{
    var table = await db.Tables.Include(t => t.CurrentSession).FirstOrDefaultAsync(t => t.Id == request.TableId);
    if (table == null) return Results.NotFound("Table not found.");
    if (table.CurrentSession != null) return Results.BadRequest("Table is already in session.");

    var customer = await db.Customers.FindAsync(request.CustomerId);
    if (customer == null) return Results.NotFound("Customer not found.");

    var session = new Session
    {
        TableId = request.TableId,
        CustomerId = request.CustomerId,
        StartTime = DateTime.UtcNow,
        Status = "Active",
        HourlyRate = table.HourlyRate,
        DiscountPercentage = customer.MembershipType == "Premium" ? 0.10m : 0m // Example discount
    };

    db.Sessions.Add(session);
    table.CurrentSession = session; // Link session to table
    await db.SaveChangesAsync();

    return Results.Created($"/api/sessions/{session.Id}", session);
});

app.MapPost("/api/sessions/{id}/pause", async (Guid id, ApplicationDbContext db) =>
{
    var session = await db.Sessions.FindAsync(id);
    if (session == null) return Results.NotFound();
    if (session.Status != "Active") return Results.BadRequest("Session is not active.");

    session.Status = "Paused";
    session.PausedAt = DateTime.UtcNow;
    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.MapPost("/api/sessions/{id}/resume", async (Guid id, ApplicationDbContext db) =>
{
    var session = await db.Sessions.FindAsync(id);
    if (session == null) return Results.NotFound();
    if (session.Status != "Paused") return Results.BadRequest("Session is not paused.");

    if (session.PausedAt.HasValue)
    {
        session.PausedDuration += (DateTime.UtcNow - session.PausedAt.Value);
        session.PausedAt = null;
    }
    session.Status = "Active";
    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.MapPost("/api/sessions/{id}/end", async (Guid id, ApplicationDbContext db) =>
{
    var session = await db.Sessions
        .Include(s => s.Table)
        .Include(s => s.Customer)
        .Include(s => s.Orders)
            .ThenInclude(o => o.OrderItems)
                .ThenInclude(oi => oi.MenuItem)
        .FirstOrDefaultAsync(s => s.Id == id);

    if (session == null) return Results.NotFound();
    if (session.Status == "Ended") return Results.BadRequest("Session already ended.");

    session.EndTime = DateTime.UtcNow;
    session.Status = "Ended";

    // Calculate table charges
    var totalPlayDuration = (session.EndTime.Value - session.StartTime) - session.PausedDuration;
    var tableCharges = (decimal)totalPlayDuration.TotalHours * session.HourlyRate;

    // Calculate order charges
    decimal orderCharges = 0;
    var billOrderItems = new List<BillOrderItem>();
    foreach (var order in session.Orders)
    {
        foreach (var orderItem in order.OrderItems)
        {
            var itemTotal = orderItem.Quantity * orderItem.MenuItem.Price;
            orderCharges += itemTotal;
            billOrderItems.Add(new BillOrderItem
            {
                MenuItemId = orderItem.MenuItemId,
                MenuItemName = orderItem.MenuItem.Name,
                Quantity = orderItem.Quantity,
                Price = orderItem.MenuItem.Price,
                Total = itemTotal
            });
        }
    }

    var subtotal = tableCharges + orderCharges;
    var discountAmount = subtotal * session.DiscountPercentage;
    var taxableAmount = subtotal - discountAmount;
    var taxRate = 0.05m; // Example tax rate
    var taxAmount = taxableAmount * taxRate;
    var grandTotal = taxableAmount + taxAmount;

    var bill = new Bill
    {
        SessionId = session.Id,
        TableId = session.TableId,
        TableName = session.Table.Name,
        CustomerId = session.CustomerId,
        CustomerName = session.Customer.Name,
        MembershipType = session.Customer.MembershipType,
        StartTime = session.StartTime,
        EndTime = session.EndTime.Value,
        DurationMilliseconds = (long)totalPlayDuration.TotalMilliseconds,
        HourlyRate = session.HourlyRate,
        TableCharges = tableCharges,
        OrderItems = billOrderItems,
        OrderCharges = orderCharges,
        Subtotal = subtotal,
        DiscountPercentage = session.DiscountPercentage,
        DiscountAmount = discountAmount,
        TaxRate = taxRate,
        TaxAmount = taxAmount,
        GrandTotal = grandTotal,
        Status = "Completed"
    };

    db.Bills.Add(bill);
    session.Table.CurrentSession = null; // Free up the table
    await db.SaveChangesAsync();

    return Results.Ok(bill);
});

app.MapPost("/api/orders", async (CreateOrderRequest request, ApplicationDbContext db) =>
{
    var session = await db.Sessions.Include(s => s.Orders).FirstOrDefaultAsync(s => s.Id == request.SessionId);
    if (session == null) return Results.NotFound("Session not found.");
    if (session.Status != "Active") return Results.BadRequest("Cannot add orders to a non-active session.");

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

app.MapGet("/api/bills", async (ApplicationDbContext db) =>
{
    var bills = await db.Bills.OrderByDescending(b => b.EndTime).ToListAsync();
    return Results.Ok(bills);
});

app.MapGet("/api/dashboard/stats", async (ApplicationDbContext db) =>
{
    var activeSessions = await db.Sessions.Where(s => s.Status == "Active").CountAsync();
    var pausedSessions = await db.Sessions.Where(s => s.Status == "Paused").CountAsync();
    var availableTables = await db.Tables.Where(t => t.CurrentSession == null).CountAsync();
    var reservedTables = 0; // Placeholder for future booking system

    var totalRevenue = await db.Bills.SumAsync(b => b.GrandTotal);
    var tableRevenue = await db.Bills.SumAsync(b => b.TableCharges);
    var orderRevenue = await db.Bills.SumAsync(b => b.OrderCharges);
    var activeCustomers = await db.Sessions.Where(s => s.Status == "Active").Select(s => s.CustomerId).Distinct().CountAsync();
    var totalOrders = await db.Orders.CountAsync();

    var stats = new DashboardStats
    {
        ActiveTables = activeSessions,
        PausedTables = pausedSessions,
        AvailableTables = availableTables,
        ReservedTables = reservedTables,
        TotalRevenue = totalRevenue,
        TableRevenue = tableRevenue,
        OrderRevenue = orderRevenue,
        ActiveCustomers = activeCustomers,
        TotalOrders = totalOrders
    };

    return Results.Ok(stats);
});

app.Run();

// Models
public class Table
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public decimal HourlyRate { get; set; }
    public string Location { get; set; } = string.Empty;

    // Navigation property for current session
    public Session? CurrentSession { get; set; }
}

public class Customer
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string ContactInfo { get; set; } = string.Empty;
    public string MembershipType { get; set; } = "Standard"; // e.g., Standard, Premium
    public DateTime RegistrationDate { get; set; } = DateTime.UtcNow;
    public decimal DiscountPercentage { get; set; } = 0m;
}

public class MenuItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Category { get; set; } = string.Empty; // e.g., Food, Drink, Equipment
    public bool IsAvailable { get; set; } = true;
}

public class Session
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TableId { get; set; }
    public Table Table { get; set; } = null!; // Navigation property
    public Guid CustomerId { get; set; }
    public Customer Customer { get; set; } = null!; // Navigation property
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public TimeSpan PausedDuration { get; set; } = TimeSpan.Zero;
    public DateTime? PausedAt { get; set; }
    public string Status { get; set; } = "Active"; // Active, Paused, Ended
    public decimal HourlyRate { get; set; }
    public decimal DiscountPercentage { get; set; }

    public ICollection<Order> Orders { get; set; } = new List<Order>();
}

public class Order
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid SessionId { get; set; }
    public Session Session { get; set; } = null!; // Navigation property
    public DateTime OrderTime { get; set; } = DateTime.UtcNow;

    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}

public class OrderItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OrderId { get; set; }
    public Order Order { get; set; } = null!; // Navigation property
    public Guid MenuItemId { get; set; }
    public MenuItem MenuItem { get; set; } = null!; // Navigation property
    public int Quantity { get; set; }
}

public class Bill
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid SessionId { get; set; }
    public string TableName { get; set; } = string.Empty;
    public Guid TableId { get; set; }
    public Guid CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string MembershipType { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public long DurationMilliseconds { get; set; } // Total active duration in milliseconds
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
    public string Status { get; set; } = "Completed"; // Completed, Voided, etc.
}

public class BillOrderItem
{
    public Guid MenuItemId { get; set; }
    public string MenuItemName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal Price { get; set; }
    public decimal Total { get; set; }
}

// DTOs for requests
public class StartSessionRequest
{
    public Guid TableId { get; set; }
    public Guid CustomerId { get; set; }
}

public class CreateOrderRequest
{
    public Guid SessionId { get; set; }
    public ICollection<OrderItemRequest> Items { get; set; } = new List<OrderItemRequest>();
}

public class OrderItemRequest
{
    public Guid MenuItemId { get; set; }
    public int Quantity { get; set; }
}

public class DashboardStats
{
    public int ActiveTables { get; set; }
    public int PausedTables { get; set; }
    public int AvailableTables { get; set; }
    public int ReservedTables { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal TableRevenue { get; set; }
    public decimal OrderRevenue { get; set; }
    public int ActiveCustomers { get; set; }
    public int TotalOrders { get; set; }
}

// Database Context
public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<Table> Tables { get; set; }
    public DbSet<Customer> Customers { get; set; }
    public DbSet<MenuItem> MenuItems { get; set; }
    public DbSet<Session> Sessions { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }
    public DbSet<Bill> Bills { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure one-to-one relationship between Table and Session
        modelBuilder.Entity<Table>()
            .HasOne(t => t.CurrentSession)
            .WithOne(s => s.Table)
            .HasForeignKey<Session>(s => s.TableId)
            .IsRequired(false); // A table can exist without a current session

        // Configure one-to-many relationship between Customer and Session
        modelBuilder.Entity<Customer>()
            .HasMany<Session>()
            .WithOne(s => s.Customer)
            .HasForeignKey(s => s.CustomerId);

        // Configure one-to-many relationship between Session and Order
        modelBuilder.Entity<Session>()
            .HasMany(s => s.Orders)
            .WithOne(o => o.Session)
            .HasForeignKey(o => o.SessionId);

        // Configure one-to-many relationship between Order and OrderItem
        modelBuilder.Entity<Order>()
            .HasMany(o => o.OrderItems)
            .WithOne(oi => oi.Order)
            .HasForeignKey(oi => oi.OrderId);

        // Configure one-to-many relationship between MenuItem and OrderItem
        modelBuilder.Entity<MenuItem>()
            .HasMany<OrderItem>()
            .WithOne(oi => oi.MenuItem)
            .HasForeignKey(oi => oi.MenuItemId);

        // Configure BillOrderItem as owned entity (JSON column in SQLite)
        modelBuilder.Entity<Bill>()
            .OwnsMany(b => b.OrderItems, oi =>
            {
                oi.ToJson(); // Store as JSON
            });
    }
}
