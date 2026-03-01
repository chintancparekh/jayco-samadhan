using Microsoft.EntityFrameworkCore;
using SafecoreApi.Models;

namespace SafecoreApi.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Case> Cases { get; set; }
        public DbSet<Query> Queries { get; set; }
        public DbSet<Grievance> Grievances { get; set; }
        public DbSet<Account> Accounts { get; set; }

        // 🔥 ADD THIS PART INSIDE CLASS
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Case>()
                .Property(p => p.Amount)
                .HasPrecision(18, 2);

            base.OnModelCreating(modelBuilder);
        }
    }
}
