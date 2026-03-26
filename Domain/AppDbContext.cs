using System;
using Microsoft.EntityFrameworkCore;

namespace Domain;

public class AppDbContext(DbContextOptions options) : DbContext(options)
{
    public required DbSet<User> Users { get;set; }
    public required DbSet<Employee> Employees { get;set; }
    public required DbSet<Leave> Leaves { get;set; }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
    }
}
