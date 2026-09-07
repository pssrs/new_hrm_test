using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain;

[Table("vathmoi")]
public class Grade
{
    [Key]
    [Column("idvathmoi")]
    public required int Id { get; set; }

    [Column("perigrafi_vathm")]
    public required string Description { get; set; }

    [Column("kwdikos_vathm")]
    public required int Code { get; set; }  
}
