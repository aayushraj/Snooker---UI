using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure SQLite database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add CORS policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin",
        builder => builder.WithOrigins(
            "http://localhost:3000", // Next.js development server
            "http://localhost:5001", // .NET API itself (for Swagger)
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5001"
        )
        .AllowAnyHeader()
        .AllowAnyMethod());
});

var app = builder.Build();

// Apply migrations on startup
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    dbContext.Database.Migrate();
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowSpecificOrigin"); // Use the CORS policy

// --- API Endpoints ---

// Tables
app.MapGet("/api/tables", async (AppDbContext db) =>
{
    var tables = await db.Tables.Include(t => t.CurrentSession)
                                .ThenInclude(s => s.Customer)
                                .Include(t => t.CurrentSession)
                                .ThenInclude(s => s.Orders)
                                .ThenInclude(o => o.OrderItems)
                                .ThenInclude(oi => oi.MenuItem)
                                .ToListAsync();
    return Results.Ok(tables);
});

app.MapGet("/api/tables/{id}", async (string id, AppDbContext db) =>
{
    var table = await db.Tables.Include(t => t.CurrentSession)
                                .ThenInclude(s => s.Customer)
                                .Include(t => t.CurrentSession)
                                .ThenInclude(s => s.Orders)
                                .ThenInclude(o => o.OrderItems)
                                .ThenInclude(oi => oi.MenuItem)
                                .FirstOrDefaultAsync(t => t.Id == id);
    return table is null ? Results.NotFound() : Results.Ok(table);
});

app.MapPost("/api/tables", async (Table table, AppDbContext db) =>
{
    table.Id = Guid.NewGuid().ToString();
    db.Tables.Add(table);
    await db.SaveChangesAsync();
    return Results.Created($"/api/tables/{table.Id}", table);
});

app.MapPut("/api/tables/{id}", async (string id, Table updatedTable, AppDbContext db) =>
{
    var table = await db.Tables.FindAsync(id);
    if (table is null) return Results.NotFound();

    table.Name = updatedTable.Name;
    table.HourlyRate = updatedTable.HourlyRate;
    table.Location = updatedTable.Location;

    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.MapDelete("/api/tables/{id}", async (string id, AppDbContext db) =>
{
    var table = await db.Tables.FindAsync(id);
    if (table is null) return Results.NotFound();

    db.Tables.Remove(table);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

// Customers
app.MapGet("/api/customers", async (AppDbContext db) => await db.Customers.ToListAsync());

app.MapGet("/api/customers/{id}", async (string id, AppDbContext db) =>
{
    var customer = await db.Customers.FindAsync(id);
    return customer is null ? Results.NotFound() : Results.Ok(customer);
});

app.MapPost("/api/customers", async (Customer customer, AppDbContext db) =>
{
    customer.Id = Guid.NewGuid().ToString();
    db.Customers.Add(customer);
    await db.SaveChangesAsync();
    return Results.Created($"/api/customers/{customer.Id}", customer);
});

app.MapPut("/api/customers/{id}", async (string id, Customer updatedCustomer, AppDbContext db) =>
{
    var customer = await db.Customers.FindAsync(id);
    if (customer is null) return Results.NotFound();

    customer.Name = updatedCustomer.Name;
    customer.ContactInfo = updatedCustomer.ContactInfo;
    customer.MembershipType = updatedCustomer.MembershipType;
    customer.DiscountPercentage = updatedCustomer.DiscountPercentage; // Ensure this is updated if membership changes logic
    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.MapDelete("/api/customers/{id}", async (string id, AppDbContext db) =>
{
    var customer = await db.Customers.FindAsync(id);
    if (customer is null) return Results.NotFound();

    db.Customers.Remove(customer);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

// Menu Items
app.MapGet("/api/menu", async (AppDbContext db) => await db.MenuItems.ToListAsync());

app.MapGet("/api/menu/{id}", async (string id, AppDbContext db) =>
{
    var menuItem = await db.MenuItems.FindAsync(id);
    return menuItem is null ? Results.NotFound() : Results.Ok(menuItem);
});

app.MapPost("/api/menu", async (MenuItem menuItem, AppDbContext db) =>
{
    menuItem.Id = Guid.NewGuid().ToString();
    db.MenuItems.Add(menuItem);
    await db.SaveChangesAsync();
    return Results.Created($"/api/menu/{menuItem.Id}", menuItem);
});

app.MapPut("/api/menu/{id}", async (string id, MenuItem updatedMenuItem, AppDbContext db) =>
{
    var menuItem = await db.MenuItems.FindAsync(id);
    if (menuItem is null) return Results.NotFound();

    menuItem.Name = updatedMenuItem.Name;
    menuItem.Description = updatedMenuItem.Description;
    menuItem.Price = updatedMenuItem.Price;
    menuItem.Category = updatedMenuItem.Category;
    menuItem.IsAvailable = updatedMenuItem.IsAvailable;

    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.MapDelete("/api/menu/{id}", async (string id, AppDbContext db) =>
{
    var menuItem = await db.MenuItems.FindAsync(id);
    if (menuItem is null) return Results.NotFound();

    db.MenuItems.Remove(menuItem);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

// Sessions
app.MapPost("/api/sessions/start", async (StartSessionRequest request, AppDbContext db) =>
{
    var table = await db.Tables.FindAsync(request.TableId);
    if (table is null) return Results.NotFound("Table not found.");
    if (table.CurrentSessionId != null) return Results.BadRequest("Table is already in session.");

    var customer = await db.Customers.FindAsync(request.CustomerId);
    if (customer is null) return Results.NotFound("Customer not found.");

    var session = new Session
    {
        Id = Guid.NewGuid().ToString(),
        TableId = request.TableId,
        CustomerId = request.CustomerId,
        StartTime = DateTime.UtcNow,
        Status = "Active",
        HourlyRate = table.HourlyRate,
        DiscountPercentage = customer.DiscountPercentage // Apply customer's discount
    };

    db.Sessions.Add(session);
    table.CurrentSessionId = session.Id; // Link session to table
    await db.SaveChangesAsync();

    // Reload session with customer and table data for response
    session = await db.Sessions
                      .Include(s => s.Customer)
                      .Include(s => s.Table)
                      .FirstOrDefaultAsync(s => s.Id == session.Id);

    return Results.Created($"/api/sessions/{session.Id}", session);
});

app.MapPost("/api/sessions/{id}/pause", async (string id, AppDbContext db) =>
{
    var session = await db.Sessions.FindAsync(id);
    if (session is null) return Results.NotFound("Session not found.");
    if (session.Status != "Active") return Results.BadRequest("Session is not active.");

    session.Status = "Paused";
    session.PausedAt = DateTime.UtcNow;
    await db.SaveChangesAsync();
    return Results.Ok(session);
});

app.MapPost("/api/sessions/{id}/resume", async (string id, AppDbContext db) =>
{
    var session = await db.Sessions.FindAsync(id);
    if (session is null) return Results.NotFound("Session not found.");
    if (session.Status != "Paused") return Results.BadRequest("Session is not paused.");
    if (session.PausedAt is null) return Results.BadRequest("Session was not properly paused.");

    var pauseDuration = DateTime.UtcNow - session.PausedAt.Value;
    session.PausedDuration += pauseDuration;
    session.Status = "Active";
    session.PausedAt = null; // Clear pausedAt
    await db.SaveChangesAsync();
    return Results.Ok(session);
});

app.MapPost("/api/sessions/{id}/end", async (string id, AppDbContext db) =>
{
    var session = await db.Sessions
        .Include(s => s.Table)
        .Include(s => s.Customer)
        .Include(s => s.Orders)
            .ThenInclude(o => o.OrderItems)
                .ThenInclude(oi => oi.MenuItem)
        .FirstOrDefaultAsync(s => s.Id == id);

    if (session is null) return Results.NotFound("Session not found.");
    if (session.Status == "Ended") return Results.BadRequest("Session already ended.");

    session.EndTime = DateTime.UtcNow;
    session.Status = "Ended";

    // Calculate total elapsed time including pauses
    var totalActiveDuration = (session.EndTime.Value - session.StartTime) - session.PausedDuration;
    if (totalActiveDuration < TimeSpan.Zero) totalActiveDuration = TimeSpan.Zero; // Should not be negative

    // Calculate table charges
    var tableCharges = (decimal)totalActiveDuration.TotalHours * session.HourlyRate;

    // Calculate order charges
    decimal orderCharges = 0;
    foreach (var order in session.Orders)
    {
        foreach (var orderItem in order.OrderItems)
        {
            orderCharges += orderItem.Quantity * orderItem.MenuItem.Price;
        }
    }

    var subtotal = tableCharges + orderCharges;
    var discountAmount = subtotal * session.DiscountPercentage;
    var taxableAmount = subtotal - discountAmount;
    var taxRate = 0.05m; // Example tax rate (5%)
    var taxAmount = taxableAmount * taxRate;
    var grandTotal = taxableAmount + taxAmount;

    var bill = new Bill
    {
        Id = Guid.NewGuid().ToString(),
        SessionId = session.Id,
        TableId = session.TableId,
        TableName = session.Table.Name,
        CustomerId = session.CustomerId,
        CustomerName = session.Customer.Name,
        MembershipType = session.Customer.MembershipType,
        StartTime = session.StartTime,
        EndTime = session.EndTime.Value,
        DurationMilliseconds = (long)totalActiveDuration.TotalMilliseconds,
        HourlyRate = session.HourlyRate,
        TableCharges = tableCharges,
        OrderCharges = orderCharges,
        Subtotal = subtotal,
        DiscountPercentage = session.DiscountPercentage,
        DiscountAmount = discountAmount,
        TaxRate = taxRate,
        TaxAmount = taxAmount,
        GrandTotal = grandTotal,
        Status = "Completed",
        OrderItems = session.Orders.SelectMany(o => o.OrderItems)
            .GroupBy(oi => oi.MenuItemId)
            .Select(g => new BillOrderItem
            {
                MenuItemId = g.Key,
                MenuItemName = g.First().MenuItem.Name,
                Quantity = g.Sum(x => x.Quantity),
                Price = g.First().MenuItem.Price,
                Total = g.Sum(x => x.Quantity) * g.First().MenuItem.Price
            }).ToList()
    };

    db.Bills.Add(bill);
    session.Table.CurrentSessionId = null; // Unlink session from table
    await db.SaveChangesAsync();

    return Results.Ok(bill);
});

// Orders
app.MapPost("/api/orders", async (CreateOrderRequest request, AppDbContext db) =>
{
    var session = await db.Sessions.Include(s => s.Table).FirstOrDefaultAsync(s => s.Id == request.SessionId);
    if (session is null) return Results.NotFound("Session not found.");
    if (session.Status != "Active") return Results.BadRequest("Cannot add order to a non-active session.");

    var order = new Order
    {
        Id = Guid.NewGuid().ToString(),
        SessionId = request.SessionId,
        OrderTime = DateTime.UtcNow,
        OrderItems = new List<OrderItem>()
    };

    foreach (var itemRequest in request.Items)
    {
        var menuItem = await db.MenuItems.FindAsync(itemRequest.MenuItemId);
        if (menuItem is null || !menuItem.IsAvailable)
        {
            return Results.BadRequest($"Menu item '{itemRequest.MenuItemId}' not found or not available.");
        }
        order.OrderItems.Add(new OrderItem
        {
            Id = Guid.NewGuid().ToString(),
            MenuItemId = itemRequest.MenuItemId,
            Quantity = itemRequest.Quantity
        });
    }

    db.Orders.Add(order);
    await db.SaveChangesAsync();

    // Reload session with new order data for response
    session = await db.Sessions
                      .Include(s => s.Customer)
                      .Include(s => s.Table)
                      .Include(s => s.Orders)
                          .ThenInclude(o => o.OrderItems)
                              .ThenInclude(oi => oi.MenuItem)
                      .FirstOrDefaultAsync(s => s.Id == session.Id);

    return Results.Created($"/api/orders/{order.Id}", session); // Return updated session
});

// Bills
app.MapGet("/api/bills", async (AppDbContext db) => await db.Bills.ToListAsync());

app.MapGet("/api/bills/{id}", async (string id, AppDbContext db) =>
{
    var bill = await db.Bills.FindAsync(id);
    return bill is null ? Results.NotFound() : Results.Ok(bill);
});

// Dashboard Stats
app.MapGet("/api/dashboard/stats", async (AppDbContext db) =>
{
    var activeSessions = await db.Sessions.Where(s => s.Status == "Active").ToListAsync();
    var pausedSessions = await db.Sessions.Where(s => s.Status == "Paused").ToListAsync();
    var endedSessions = await db.Sessions.Where(s => s.Status == "Ended").ToListAsync();
    var tables = await db.Tables.ToListAsync();

    var activeTables = activeSessions.Count;
    var pausedTables = pausedSessions.Count;
    var availableTables = tables.Count - (activeTables + pausedTables);
    var reservedTables = 0; // Assuming no explicit reservation system yet

    var totalRevenue = await db.Bills.SumAsync(b => b.GrandTotal);
    var tableRevenue = await db.Bills.SumAsync(b => b.TableCharges);
    var orderRevenue = await db.Bills.SumAsync(b => b.OrderCharges);
    var activeCustomers = activeSessions.Select(s => s.CustomerId).Distinct().Count();
    var totalOrders = await db.Orders.CountAsync();

    return Results.Ok(new DashboardStats
    {
        ActiveTables = activeTables,
        PausedTables = pausedTables,
        AvailableTables = availableTables,
        ReservedTables = reservedTables,
        TotalRevenue = totalRevenue,
        TableRevenue = tableRevenue,
        OrderRevenue = orderRevenue,
        ActiveCustomers = activeCustomers,
        TotalOrders = totalOrders
    });
});


app.Run();

// --- Models ---
public class Table
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    [Required]
    public string Name { get; set; } = string.Empty;
    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Hourly rate must be positive.")]
    public decimal HourlyRate { get; set; }
    public string Location { get; set; } = string.Empty;

    // Navigation property for current session
    public string? CurrentSessionId { get; set; }
    [JsonIgnore] // Prevent circular reference in JSON serialization
    public Session? CurrentSession { get; set; }
}

public class Customer
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    [Required]
    public string Name { get; set; } = string.Empty;
    public string ContactInfo { get; set; } = string.Empty;
    public string MembershipType { get; set; } = "Standard"; // e.g., "Standard", "Premium", "VIP"
    public decimal DiscountPercentage
    {
        get
        {
            return MembershipType switch
            {
                "Premium" => 0.10m, // 10% discount
                "VIP" => 0.20m,     // 20% discount
                _ => 0m,            // No discount for Standard or others
            };
        }
    }
}

public class MenuItem
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    [Required]
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Price must be positive.")]
    public decimal Price { get; set; }
    public string Category { get; set; } = string.Empty; // e.g., "Drinks", "Snacks", "Food"
    public bool IsAvailable { get; set; } = true;
}

public class Session
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    [Required]
    public string TableId { get; set; } = string.Empty;
    [Required]
    public string CustomerId { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public TimeSpan PausedDuration { get; set; } = TimeSpan.Zero;
    public DateTime? PausedAt { get; set; }
    public string Status { get; set; } = "Active"; // "Active", "Paused", "Ended"
    public decimal HourlyRate { get; set; } // Snapshot of table's hourly rate at session start
    public decimal DiscountPercentage { get; set; } // Snapshot of customer's discount at session start

    // Navigation properties
    public Table Table { get; set; } = null!;
    public Customer Customer { get; set; } = null!;
    public ICollection<Order> Orders { get; set; } = new List<Order>();
}

public class Order
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    [Required]
    public string SessionId { get; set; } = string.Empty;
    public DateTime OrderTime { get; set; }

    // Navigation properties
    public Session Session { get; set; } = null!;
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}

public class OrderItem
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    [Required]
    public string OrderId { get; set; } = string.Empty;
    [Required]
    public string MenuItemId { get; set; } = string.Empty;
    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1.")]
    public int Quantity { get; set; }

    // Navigation properties
    public Order Order { get; set; } = null!;
    public MenuItem MenuItem { get; set; } = null!;
}

public class Bill
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    [Required]
    public string SessionId { get; set; } = string.Empty;
    [Required]
    public string TableId { get; set; } = string.Empty;
    public string TableName { get; set; } = string.Empty;
    [Required]
    public string CustomerId { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string MembershipType { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public long DurationMilliseconds { get; set; } // Total active duration in milliseconds
    public decimal HourlyRate { get; set; }
    public decimal TableCharges { get; set; }
    public decimal OrderCharges { get; set; }
    public decimal Subtotal { get; set; }
    public decimal DiscountPercentage { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TaxRate { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal GrandTotal { get; set; }
    public string Status { get; set; } = "Generated"; // e.g., "Generated", "Paid"

    public ICollection<BillOrderItem> OrderItems { get; set; } = new List<BillOrderItem>();
}

public class BillOrderItem
{
    public string MenuItemId { get; set; } = string.Empty;
    public string MenuItemName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal Price { get; set; }
    public decimal Total { get; set; }
}

// --- DTOs (Data Transfer Objects) ---
public class StartSessionRequest
{
    [Required]
    public string TableId { get; set; } = string.Empty;
    [Required]
    public string CustomerId { get; set; } = string.Empty;
}

public class CreateOrderRequest
{
    [Required]
    public string SessionId { get; set; } = string.Empty;
    [Required]
    public List<CreateOrderItemRequest> Items { get; set; } = new List<CreateOrderItemRequest>();
}

public class CreateOrderItemRequest
{
    [Required]
    public string MenuItemId { get; set; } = string.Empty;
    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1.")]
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

// --- Database Context ---
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

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

        // Configure Table-Session one-to-one relationship
        modelBuilder.Entity<Table>()
            .HasOne(t => t.CurrentSession)
            .WithOne(s => s.Table)
            .HasForeignKey<Session>(s => s.TableId)
            .IsRequired(false) // A table might not have a current session
            .OnDelete(DeleteBehavior.SetNull); // When a session is deleted, unlink from table

        // Configure Session-Customer one-to-many relationship
        modelBuilder.Entity<Session>()
            .HasOne(s => s.Customer)
            .WithMany()
            .HasForeignKey(s => s.CustomerId)
            .OnDelete(DeleteBehavior.Restrict); // Prevent deleting customer if they have active sessions

        // Configure Session-Order one-to-many relationship
        modelBuilder.Entity<Session>()
            .HasMany(s => s.Orders)
            .WithOne(o => o.Session)
            .HasForeignKey(o => o.SessionId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure Order-OrderItem one-to-many relationship
        modelBuilder.Entity<Order>()
            .HasMany(o => o.OrderItems)
            .WithOne(oi => oi.Order)
            .HasForeignKey(oi => oi.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure OrderItem-MenuItem one-to-many relationship
        modelBuilder.Entity<OrderItem>()
            .HasOne(oi => oi.MenuItem)
            .WithMany()
            .HasForeignKey(oi => oi.MenuItemId)
            .OnDelete(DeleteBehavior.Restrict); // Prevent deleting menu item if it's in an order

        // Configure Bill-Session one-to-one relationship (optional, can be one-to-many if a session can have multiple bills)
        // For simplicity, assuming one bill per ended session.
        modelBuilder.Entity<Bill>()
            .HasOne<Session>()
            .WithOne()
            .HasForeignKey<Bill>(b => b.SessionId)
            .IsRequired()
            .OnDelete(DeleteBehavior.Restrict); // Prevent deleting session if it has a bill

        // Ensure unique names for tables and menu items (optional, but good for data integrity)
        modelBuilder.Entity<Table>()
            .HasIndex(t => t.Name)
            .IsUnique();

        modelBuilder.Entity<MenuItem>()
            .HasIndex(m => m.Name)
            .IsUnique();
    }
}
