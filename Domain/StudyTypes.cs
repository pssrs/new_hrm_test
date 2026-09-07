using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain
{
    [Table("typos_spoudwn")]
    public class StudyTypes
    {
        [Key]
        [Column("idtypsp")]
        public int Id { get; set; }
        [Column("typsp_perigrafi")]
        public required string Description { get; set; }
    }
}