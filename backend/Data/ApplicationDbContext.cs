using Microsoft.EntityFrameworkCore;

namespace SnookerClubApi.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // Add your DbSet properties here for your models
        // Example: public DbSet<Table> Tables { get; set; }
        // Example: public DbSet<Customer> Customers { get; set; }
        // Example: public DbSet<Session> Sessions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure your models here
            // Example: modelBuilder.Entity<Table>().HasKey(t => t.Id);
        }
    }
}
