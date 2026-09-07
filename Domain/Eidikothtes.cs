using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain;

[Table("Eidikothtes")]
public class Eidikothtes
{
    [Key]
    [Column("ideidikothtes")]
    public required int Id { get; set; }

    [Column("eidik_perigrafi")]
    public required string Description { get; set; }

    [Column("eidik_kwdikos")]
    public required string Code { get; set; }

    [Column("eidik_visible")]
    public required int Visible { get; set; }   
}
