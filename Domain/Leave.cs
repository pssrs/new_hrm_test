using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain;

[Table("leaves")]
public class Leave
{
    [Key]
    [Column("idleaves")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Column("idemp")]
    public int Am { get; set; }

    [Column("leav_type")]
    public int Type { get; set; }

    [Column("leav_dur")]
    public int Duration { get; set; }

    [Column("leav_dateFrom")]
    public DateOnly? DateFrom { get; set; }

    [Column("leav_dateTo")]
    public DateOnly? DateTo { get; set; }

    [Column("leav_year")]
    public int Year { get; set; }

    [Column("leav_notes")]
    public string Notes { get; set; } = string.Empty;

    [Column("leav_request")]
    public string? Request { get; set; }

    [Column("leav_approval")]
    public string? Approval { get; set; }

    [Column("leav_state")]
    public int State { get; set; }
}
