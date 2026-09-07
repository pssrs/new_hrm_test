using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain
{
    [Table("studies")]
    public class Studies
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("idstudies")]
        public required int Id { get; set; }
        [Column("idempstud")]
        public required int Am { get; set; }
        [Column("stud_type")]
        public required int Type { get; set; }
        [Column("stud_descr")]
        public required string Description { get; set; }
        [Column("stud_education")]
        public required int Education { get; set; }
        [Column("stud_local")]
        public required int Local { get; set; }
        [Column("stud_category")]
        public required int Category { get; set; }
        [Column("stud_years")]
        public required string Years { get; set; }
        [Column("stud_date")]
        public required DateOnly Date { get; set; }
        [Column("stud_degree")]
        public required string Degree { get; set; }
        [Column("stud_empl")]
        public required int Employee { get; set; }
        [Column("stud_relev")]
        public required int Relevance { get; set; }
        [Column("stud_comments")]
        public required string Comment { get; set; }
        [Column("stud_dateReq")]
        public required DateOnly DateRequired { get; set; }
        [Column("stud_location")]
        public required string Location { get; set; }
    }
}