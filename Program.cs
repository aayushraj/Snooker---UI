using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Cors;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using System.Linq;
using System.Threading.Tasks;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddDbContext<SnookerClubContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");

// Ensure database is created and seeded
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<SnookerClubContext>();
    context.Database.EnsureCreated();
    SeedData(context);
}

// API Endpoints

// Dashboard Statistics
app.MapGet("/api/dashboard/stats", async (SnookerClubContext db) =>
{
    var tables = await db.Tables.Include(t => t.CurrentSession).ToListAsync();
    var orders = await db.Orders.Include(o => o.OrderItems).ToListAsync();
    
    return new
    {
        Tables = tables.Select(t => new
        {
            t.Id,
            t.Name,
            Status = t.CurrentSession?.Status ?? "available",
            t.Location,
            t.HourlyRate,
            CurrentSession = t.CurrentSession == null ? null : new
            {
                t.CurrentSession.Id,
                CustomerName = t.CurrentSession.Customer?.Name,
                t.CurrentSession.StartTime,
                TotalAmount = CalculateSessionAmount(t.CurrentSession, t.HourlyRate)
            }
        }),
        Orders = orders.Select(o => new
        {
            o.Id,
            o.TableId,
            CustomerName = o.Customer?.Name,
            Items = o.OrderItems.Select(oi => new { oi.MenuItem.Name, oi.Quantity, oi.Price }),
            o.Status,
            Total = o.OrderItems.Sum(oi => oi.Quantity * oi.Price),
            o.CreatedAt
        })
    };
});

// Tables Management
app.MapGet("/api/tables", async (SnookerClubContext db) =>
{
    return await db.Tables
        .Include(t => t.CurrentSession)
        .ThenInclude(s => s.Customer)
        .Select(t => new
        {
            t.Id,
            t.Name,
            t.Location,
            t.HourlyRate,
            t.Status,
            t.Description,
            CurrentSession = t.CurrentSession == null ? null : new
            {
                t.CurrentSession.Id,
                CustomerName = t.CurrentSession.Customer.Name,
                CustomerPhone = t.CurrentSession.Customer.Phone,
                MembershipPlan = t.CurrentSession.Customer.MembershipType,
                t.CurrentSession.StartTime,
                t.CurrentSession.PausedTime,
                TotalAmount = CalculateSessionAmount(t.CurrentSession, t.HourlyRate),
                Discount = GetMembershipDiscount(t.CurrentSession.Customer.MembershipType)
            }
        })
        .ToListAsync();
});

app.MapPost("/api/tables", async (TableCreateRequest request, SnookerClubContext db) =>
{
    var table = new Table
    {
        Name = request.Name,
        Location = request.Location,
        HourlyRate = request.HourlyRate,
        Status = request.Status,
        Description = request.Description
    };

    db.Tables.Add(table);
    await db.SaveChangesAsync();
    return Results.Created($"/api/tables/{table.Id}", table);
});

app.MapPut("/api/tables/{id}", async (int id, TableUpdateRequest request, SnookerClubContext db) =>
{
    var table = await db.Tables.FindAsync(id);
    if (table == null) return Results.NotFound();

    table.Name = request.Name;
    table.Location = request.Location;
    table.HourlyRate = request.HourlyRate;
    table.Status = request.Status;
    table.Description = request.Description;

    await db.SaveChangesAsync();
    return Results.Ok(table);
});

app.MapDelete("/api/tables/{id}", async (int id, SnookerClubContext db) =>
{
    var table = await db.Tables.FindAsync(id);
    if (table == null) return Results.NotFound();

    db.Tables.Remove(table);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

// Customer Management
app.MapGet("/api/customers", async (SnookerClubContext db) =>
{
    return await db.Customers.ToListAsync();
});

app.MapPost("/api/customers", async (CustomerCreateRequest request, SnookerClubContext db) =>
{
    var customer = new Customer
    {
        Name = request.Name,
        Phone = request.Phone,
        Email = request.Email,
        MembershipType = request.MembershipPlan,
        Notes = request.Notes,
        CreatedAt = DateTime.UtcNow
    };

    db.Customers.Add(customer);
    await db.SaveChangesAsync();
    return Results.Created($"/api/customers/{customer.Id}", customer);
});

// Session Management
app.MapPost("/api/sessions/start", async (StartSessionRequest request, SnookerClubContext db) =>
{
    var table = await db.Tables.FindAsync(request.TableId);
    var customer = await db.Customers.FindAsync(request.CustomerId);
    
    if (table == null || customer == null) return Results.BadRequest();

    var session = new Session
    {
        TableId = request.TableId,
        CustomerId = request.CustomerId,
        StartTime = DateTime.UtcNow,
        Status = "occupied"
    };

    db.Sessions.Add(session);
    table.CurrentSessionId = session.Id;
    await db.SaveChangesAsync();

    return Results.Ok(session);
});

app.MapPost("/api/sessions/{id}/pause", async (int id, SnookerClubContext db) =>
{
    var session = await db.Sessions.FindAsync(id);
    if (session == null) return Results.NotFound();

    session.Status = "paused";
    session.PausedTime = (session.PausedTime ?? 0) + 
        (int)(DateTime.UtcNow - session.StartTime).TotalMinutes;
    
    await db.SaveChangesAsync();
    return Results.Ok(session);
});

app.MapPost("/api/sessions/{id}/resume", async (int id, SnookerClubContext db) =>
{
    var session = await db.Sessions.FindAsync(id);
    if (session == null) return Results.NotFound();

    session.Status = "occupied";
    await db.SaveChangesAsync();
    return Results.Ok(session);
});

app.MapPost("/api/sessions/{id}/end", async (int id, SnookerClubContext db) =>
{
    var session = await db.Sessions.Include(s => s.Table).Include(s => s.Customer).FindAsync(id);
    if (session == null) return Results.NotFound();

    session.EndTime = DateTime.UtcNow;
    session.Status = "completed";
    session.Table.CurrentSessionId = null;

    // Generate bill
    var bill = await GenerateBill(session, db);
    
    await db.SaveChangesAsync();
    return Results.Ok(bill);
});

// Menu Management
app.MapGet("/api/menu", async (SnookerClubContext db) =>
{
    return await db.MenuItems.ToListAsync();
});

app.MapPost("/api/menu", async (MenuItemCreateRequest request, SnookerClubContext db) =>
{
    var menuItem = new MenuItem
    {
        Name = request.Name,
        Category = request.Category,
        Price = request.Price,
        Description = request.Description,
        Available = request.Available
    };

    db.MenuItems.Add(menuItem);
    await db.SaveChangesAsync();
    return Results.Created($"/api/menu/{menuItem.Id}", menuItem);
});

app.MapPut("/api/menu/{id}", async (int id, MenuItemUpdateRequest request, SnookerClubContext db) =>
{
    var menuItem = await db.MenuItems.FindAsync(id);
    if (menuItem == null) return Results.NotFound();

    menuItem.Name = request.Name;
    menuItem.Category = request.Category;
    menuItem.Price = request.Price;
    menuItem.Description = request.Description;
    menuItem.Available = request.Available;

    await db.SaveChangesAsync();
    return Results.Ok(menuItem);
});

app.MapDelete("/api/menu/{id}", async (int id, SnookerClubContext db) =>
{
    var menuItem = await db.MenuItems.FindAsync(id);
    if (menuItem == null) return Results.NotFound();

    db.MenuItems.Remove(menuItem);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

// Order Management
app.MapPost("/api/orders", async (OrderCreateRequest request, SnookerClubContext db) =>
{
    var order = new Order
    {
        TableId = request.TableId,
        CustomerId = request.CustomerId,
        Status = "pending",
        CreatedAt = DateTime.UtcNow,
        OrderItems = request.Items.Select(item => new OrderItem
        {
            MenuItemId = item.MenuItemId,
            Quantity = item.Quantity,
            Price = item.Price
        }).ToList()
    };

    db.Orders.Add(order);
    await db.SaveChangesAsync();
    return Results.Created($"/api/orders/{order.Id}", order);
});

// Billing
app.MapGet("/api/bills", async (SnookerClubContext db) =>
{
    return await db.Bills
        .Include(b => b.Session)
        .ThenInclude(s => s.Customer)
        .Include(b => b.Session)
        .ThenInclude(s => s.Table)
        .Include(b => b.Orders)
        .ThenInclude(o => o.OrderItems)
        .ThenInclude(oi => oi.MenuItem)
        .Select(b => new
        {
            b.Id,
            TableId = b.Session.TableId,
            TableName = b.Session.Table.Name,
            CustomerName = b.Session.Customer.Name,
            CustomerPhone = b.Session.Customer.Phone,
            MembershipPlan = b.Session.Customer.MembershipType,
            b.SessionStart,
            b.SessionEnd,
            b.Duration,
            b.TableRate,
            b.TableAmount,
            Orders = b.Orders.SelectMany(o => o.OrderItems).Select(oi => new
            {
                Id = oi.Id,
                ItemName = oi.MenuItem.Name,
                oi.Quantity,
                UnitPrice = oi.Price,
                Total = oi.Quantity * oi.Price
            }),
            b.OrderTotal,
            b.Discount,
            b.DiscountAmount,
            b.Subtotal,
            b.Tax,
            b.Total,
            b.Status,
            b.CreatedAt
        })
        .ToListAsync();
});

app.Run();

// Helper Methods
static decimal CalculateSessionAmount(Session session, decimal hourlyRate)
{
    if (session.EndTime.HasValue)
    {
        var duration = (decimal)(session.EndTime.Value - session.StartTime).TotalHours;
        return Math.Round(duration * hourlyRate, 2);
    }
    
    var currentDuration = (decimal)(DateTime.UtcNow - session.StartTime).TotalHours;
    return Math.Round(currentDuration * hourlyRate, 2);
}

static int GetMembershipDiscount(string membershipType)
{
    return membershipType switch
    {
        "basic" => 5,
        "premium" => 10,
        "vip" => 15,
        _ => 0
    };
}

static async Task<Bill> GenerateBill(Session session, SnookerClubContext db)
{
    var orders = await db.Orders
        .Include(o => o.OrderItems)
        .Where(o => o.TableId == session.TableId && 
                   o.CreatedAt >= session.StartTime && 
                   o.CreatedAt <= session.EndTime)
        .ToListAsync();

    var duration = (int)(session.EndTime!.Value - session.StartTime).TotalMinutes;
    var tableAmount = CalculateSessionAmount(session, session.Table.HourlyRate);
    var orderTotal = orders.SelectMany(o => o.OrderItems).Sum(oi => oi.Quantity * oi.Price);
    var discount = GetMembershipDiscount(session.Customer.MembershipType);
    var subtotal = tableAmount + orderTotal;
    var discountAmount = subtotal * discount / 100;
    var afterDiscount = subtotal - discountAmount;
    var tax = afterDiscount * 0.1m; // 10% tax
    var total = afterDiscount + tax;

    var bill = new Bill
    {
        SessionId = session.Id,
        SessionStart = session.StartTime,
        SessionEnd = session.EndTime.Value,
        Duration = duration,
        TableRate = session.Table.HourlyRate,
        TableAmount = tableAmount,
        OrderTotal = orderTotal,
        Discount = discount,
        DiscountAmount = discountAmount,
        Subtotal = afterDiscount,
        Tax = tax,
        Total = total,
        Status = "pending",
        CreatedAt = DateTime.UtcNow,
        Orders = orders
    };

    db.Bills.Add(bill);
    return bill;
}

static void SeedData(SnookerClubContext context)
{
    if (context.Tables.Any()) return;

    // Seed Tables
    var tables = new[]
    {
        new Table { Name = "Table 1", Location = "Main Hall", HourlyRate = 25, Status = "active", Description = "Standard snooker table" },
        new Table { Name = "Table 2", Location = "Main Hall", HourlyRate = 25, Status = "active", Description = "Standard snooker table" },
        new Table { Name = "Table 3", Location = "VIP Room", HourlyRate = 35, Status = "active", Description = "Premium table with better lighting" },
        new Table { Name = "Table 4", Location = "Main Hall", HourlyRate = 25, Status = "maintenance", Description = "Standard snooker table" },
        new Table { Name = "Table 5", Location = "Main Hall", HourlyRate = 25, Status = "active", Description = "Standard snooker table" },
        new Table { Name = "Table 6", Location = "VIP Room", HourlyRate = 35, Status = "active", Description = "Premium table with better lighting" }
    };
    context.Tables.AddRange(tables);

    // Seed Menu Items
    var menuItems = new[]
    {
        new MenuItem { Name = "Coffee", Category = "beverages", Price = 3.50m, Description = "Fresh brewed coffee", Available = true },
        new MenuItem { Name = "Tea", Category = "beverages", Price = 2.50m, Description = "Assorted tea varieties", Available = true },
        new MenuItem { Name = "Soft Drink", Category = "beverages", Price = 2.00m, Description = "Coca-Cola, Pepsi, Sprite", Available = true },
        new MenuItem { Name = "Club Sandwich", Category = "snacks", Price = 8.50m, Description = "Triple-decker with chicken and bacon", Available = true },
        new MenuItem { Name = "Fish & Chips", Category = "meals", Price = 12.00m, Description = "Beer-battered fish with fries", Available = true },
        new MenuItem { Name = "Beer", Category = "alcohol", Price = 4.50m, Description = "Local draft beer", Available = true },
        new MenuItem { Name = "Nachos", Category = "snacks", Price = 6.00m, Description = "Tortilla chips with cheese and salsa", Available = false },
        new MenuItem { Name = "Burger", Category = "meals", Price = 10.00m, Description = "Beef burger with fries", Available = true }
    };
    context.MenuItems.AddRange(menuItems);

    // Seed Customers
    var customers = new[]
    {
        new Customer { Name = "John Smith", Phone = "+1-555-0123", Email = "john@example.com", MembershipType = "premium", CreatedAt = DateTime.UtcNow },
        new Customer { Name = "Sarah Johnson", Phone = "+1-555-0124", Email = "sarah@example.com", MembershipType = "vip", CreatedAt = DateTime.UtcNow },
        new Customer { Name = "Mike Wilson", Phone = "+1-555-0125", Email = "mike@example.com", MembershipType = "basic", CreatedAt = DateTime.UtcNow }
    };
    context.Customers.AddRange(customers);

    context.SaveChanges();
}

// Data Models
public class SnookerClubContext : DbContext
{
    public SnookerClubContext(DbContextOptions<SnookerClubContext> options) : base(options) { }

    public DbSet<Table> Tables { get; set; }
    public DbSet<Customer> Customers { get; set; }
    public DbSet<Session> Sessions { get; set; }
    public DbSet<MenuItem> MenuItems { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }
    public DbSet<Bill> Bills { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Table>()
            .HasOne(t => t.CurrentSession)
            .WithOne(s => s.Table)
            .HasForeignKey<Table>(t => t.CurrentSessionId)
            .IsRequired(false);

        modelBuilder.Entity<Session>()
            .HasOne(s => s.Table)
            .WithMany()
            .HasForeignKey(s => s.TableId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Bill>()
            .HasMany(b => b.Orders)
            .WithOne()
            .HasForeignKey("BillId")
            .IsRequired(false);
    }
}

public class Table
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Location { get; set; } = "";
    public decimal HourlyRate { get; set; }
    public string Status { get; set; } = "active"; // active, maintenance, disabled
    public string? Description { get; set; }
    public int? CurrentSessionId { get; set; }
    public Session? CurrentSession { get; set; }
}

public class Customer
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Phone { get; set; } = "";
    public string Email { get; set; } = "";
    public string MembershipType { get; set; } = "none"; // none, basic, premium, vip
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class Session
{
    public int Id { get; set; }
    public int TableId { get; set; }
    public int CustomerId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public int? PausedTime { get; set; } // in minutes
    public string Status { get; set; } = "occupied"; // occupied, paused, completed
    public Table Table { get; set; } = null!;
    public Customer Customer { get; set; } = null!;
}

public class MenuItem
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Category { get; set; } = ""; // beverages, snacks, meals, alcohol
    public decimal Price { get; set; }
    public string? Description { get; set; }
    public bool Available { get; set; } = true;
}

public class Order
{
    public int Id { get; set; }
    public int TableId { get; set; }
    public int CustomerId { get; set; }
    public string Status { get; set; } = "pending"; // pending, preparing, completed
    public DateTime CreatedAt { get; set; }
    public Customer Customer { get; set; } = null!;
    public List<OrderItem> OrderItems { get; set; } = new();
}

public class OrderItem
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public int MenuItemId { get; set; }
    public int Quantity { get; set; }
    public decimal Price { get; set; }
    public MenuItem MenuItem { get; set; } = null!;
}

public class Bill
{
    public int Id { get; set; }
    public int SessionId { get; set; }
    public DateTime SessionStart { get; set; }
    public DateTime SessionEnd { get; set; }
    public int Duration { get; set; } // in minutes
    public decimal TableRate { get; set; }
    public decimal TableAmount { get; set; }
    public decimal OrderTotal { get; set; }
    public int Discount { get; set; } // percentage
    public decimal DiscountAmount { get; set; }
    public decimal Subtotal { get; set; }
    public decimal Tax { get; set; }
    public decimal Total { get; set; }
    public string Status { get; set; } = "pending"; // pending, paid, overdue
    public DateTime CreatedAt { get; set; }
    public Session Session { get; set; } = null!;
    public List<Order> Orders { get; set; } = new();
}

// Request Models
public record TableCreateRequest(string Name, string Location, decimal HourlyRate, string Status, string? Description);
public record TableUpdateRequest(string Name, string Location, decimal HourlyRate, string Status, string? Description);
public record CustomerCreateRequest(string Name, string Phone, string Email, string MembershipPlan, string? Notes);
public record StartSessionRequest(int TableId, int CustomerId);
public record MenuItemCreateRequest(string Name, string Category, decimal Price, string? Description, bool Available);
public record MenuItemUpdateRequest(string Name, string Category, decimal Price, string? Description, bool Available);
public record OrderCreateRequest(int TableId, int CustomerId, List<OrderItemRequest> Items);
public record OrderItemRequest(int MenuItemId, int Quantity, decimal Price);
