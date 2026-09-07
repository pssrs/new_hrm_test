using System;
using Microsoft.EntityFrameworkCore;

namespace Domain;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public required DbSet<User> Users { get;set; }
    public required DbSet<Employee> Employees { get;set; }
    public required DbSet<Address> Addresses { get; set; }
    public required DbSet<Sector> Sectors { get; set; }
    public required DbSet<Department> Departments { get; set; }
    public required DbSet<Office> Offices { get; set; }
    public required DbSet<Leave> Leaves { get;set; }
    public required DbSet<EmployeeCountMonthly> EmployeeCountMonthly { get;set; }
    public required DbSet<Kladoi> Kladoi { get;set; }
    public required DbSet<Position> Positions { get;set; }
    public required DbSet<Eidikothtes> Eidikothtes { get;set; }
    public required DbSet<Category> Categories { get;set; }
    public required DbSet<Grade> Grades { get;set; }
    public required DbSet<Changes> Changes { get;set; }
    public required DbSet<Children> Children { get;set; }
    public required DbSet<Doy> Doys { get;set; }
    public required DbSet<PenaltyDescription> PenaltyDescriptions { get; set; }
    public required DbSet<Experience> Experience { get;set; }
    public required DbSet<Penalty> Penalties { get;set; }
    public required DbSet<Move> Moves { get;set; }
    public required DbSet<Studies> Studies { get;set; }
    public required DbSet<LeaveType> LeaveTypes { get;set; }
    public required DbSet<OverallLeaves> OverallLeaves { get;set; }
    public required DbSet<ChangeType> ChangeType { get;set; }
    public required DbSet<ChangeTypeMap> ChangeTypeMap { get;set; }
    public required DbSet<Placement> Placements { get;set; }
    public required DbSet<File> Files { get;set; }
    public required DbSet<FileType> FileTypes { get;set; }
    public required DbSet<FilePath> Paths { get;set; }
    public required DbSet<Parameter> Parameters { get;set; }
    public required DbSet<PositionNumber> PositionSum { get;set; }
    public required DbSet<StudyTypes> StudyTypes { get;set; }
    public required DbSet<Argies> Argies { get;set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
    }
}
