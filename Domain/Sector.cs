using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace Domain;
[Table("sector")]
public class Sector
{
    [Key]
    [Column("autoid")]
    public required int Id { get; set; }

    [Column("idadd")]
    public required int AddressId { get; set; }

    [Column("idsec")]
    public required int SectorId { get; set; }

    [Column("tomeas")]
    public required string SectorName { get; set; }
}
