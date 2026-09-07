using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain
{
    [Table("eidos_leaves")]
    public class LeaveType
    {
        [Key]
        [Column("ideidos_leaves")]
        public int Id { get; set; }
        [Column("leave_perigrafh")]
        public required string Description { get; set; }
        [Column("leave_code")]
        public required string Code { get; set; }
        [Column("leave_diarkeia")]
        public required int Duration { get; set; }
        [Column("leave_years")]
        public required int Years { get; set; }
        [Column("leave_pr_etos_flag")]
        public required int YearFlag { get; set; }
        [Column("leave_kk")]
        public string KK { get; set; } = "";
        [Column("leave_parathrhsh")]
        public string Parathrhsh { get; set; } = "";
        [Column("leave_flag")]
        public required int Flag { get; set; }
        [Column("leave_wends")]
        public required int Wends { get; set; }
        [Column("leave_argia")]
        public required int Argia { get; set; }
        [Column("leave_aneu_apod")]
        public required int AneuApodoxwn { get; set; }
        [Column("leave_pentaetia")]
        public required int Pentaetia { get; set; }
        [Column("leave_dus")]
        public required int Dus { get; set; }
    }
}