using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain
{
    [Table("Argies")]
    public class Argies
    {
        [Key]
        [Column("idargies")]
        public int Id { get; set; }

        [Column("argia_date")]
        public DateOnly Date { get; set; }

        [Column("argia_perigrafi")]
        public required string Description { get; set; }
    }
}