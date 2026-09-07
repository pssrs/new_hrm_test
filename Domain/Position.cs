using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain;

[Table("position")]
public class Position
{
    [Key]
    [Column("pos_id")]
    public required int Id { get; set; }

    [Column("pos_description")]
    public required string Description { get; set; }
    
    [Column("pos_visible")]
    public required int Visible { get; set; }
}