using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain;

[Table("Kladoi")]
public class Kladoi
{
    [Key]
    [Column("idkladoi")]
    public required int Id { get; set; }

    [Column("kwdikos_kl")]
    public required string Code { get; set; }
    
    [Column("perigrafi_kl")]
    public required string Description { get; set; }

    [Column("org_thesi_fek")]
    public required string OrgThesiFek { get; set; }

    [Column("thesi_plus")]
    public required string ThesiPlus { get; set; }

    [Column("thesi_delete")]
    public string? ThesiDelete { get; set; }

    [Column("org_sunolo")]
    public required int OrgSunolo { get; set; }

    [Column("org_desmev")]
    public required int OrgDesmev { get; set; }

    [Column("tropopoihsh")]
    public required string Tropopoihsh { get; set; }

    [Column("kladoi_visible")]
    public required int Visible { get; set; }
}
