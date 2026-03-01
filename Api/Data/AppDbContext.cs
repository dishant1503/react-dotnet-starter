using Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<UserEntity> Users => Set<UserEntity>();
    public DbSet<TaskEntity> Tasks => Set<TaskEntity>();
    public DbSet<PasswordResetTokenEntity> PasswordResetTokens => Set<PasswordResetTokenEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // USERS
        modelBuilder.Entity<UserEntity>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.Email).IsUnique();
            e.Property(x => x.Email).IsRequired().HasMaxLength(256);
        });

        // TASKS
        modelBuilder.Entity<TaskEntity>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Title).IsRequired().HasMaxLength(200);

            e.HasOne(x => x.User)
                .WithMany(u => u.Tasks)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // PASSWORD RESET TOKENS
        modelBuilder.Entity<PasswordResetTokenEntity>(e =>
        {
            e.HasKey(x => x.Id);

            e.Property(x => x.TokenHash)
                .IsRequired();

            e.Property(x => x.ExpiresAtUtc)
                .IsRequired();

            e.HasIndex(x => new { x.UserId, x.ExpiresAtUtc });

            e.HasOne(x => x.User)
                .WithMany() // we don't need UserEntity.PasswordResetTokens navigation right now
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}