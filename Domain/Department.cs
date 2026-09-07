using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain;

[Table("department")]
public class Department
{
    [Key]
    [Column("autoid")]
    public required int Id { get; set; }

    [Column("idadd")]
    public required int AddressId { get; set; }

    [Column("idsec")]
    public required int SectorId { get; set; }

    [Column("iddepartment")]
    public required int DepartmentId { get; set; }

    [Column("tmhma")]
    public required string DepartmentName { get; set; }
}