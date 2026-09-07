using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain
{
    [Table("overall_leaves")]
    public class OverallLeaves
    {
        [Key]
        [Column("idov")]
        public int Id { get; set; }
        [Column("ovam")]
        public int Am { get; set; }
        [Column("typos_ov")]
        public int Type { get; set; }
        [Column("diarkeia_ov")]
        public int Duration { get; set; }
        [Column("year_ov")]
        public int Year { get; set; }
        [Column("ypol_ov")]
        public int Balance { get; set; }
        [Column("flag_ov")]
        public int Flag { get; set; }
        [Column("epik_ov")]
        public int Epik { get; set; }
        [Column("epik_days_ov")]
        public int EpikDays { get; set; }
        [Column("gross_days")]
        public int GrossDays { get; set; }
        [Column("manual_change_ov")]
        public int ManualChangeOv { get; set; }
    }
}