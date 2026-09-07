using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain;

[Table("doy")]
public class Doy
{
    [Key]
    [Column("iddoy")]
    public required int Id { get; set; }

    [Column("doy_code")]
    public required int Code { get; set; }

    [Column("doy_perigrafi")]
    public required string Description { get; set; }
}