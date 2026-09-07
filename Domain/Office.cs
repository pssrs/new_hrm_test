using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain;

[Table("office")]
public class Office
{
    [Key]
    [Column("idoffice")]
    public required int Id { get; set; }

    [Column("iddep")]
    public required int DepartmentId { get; set; }
    
    [Column("grafeio")]
    public required string OfficeName { get; set; }
}
