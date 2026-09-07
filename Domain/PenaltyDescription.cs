using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Domain
{
    [Table("poines")]
    public class PenaltyDescription
    {
        [Key]
        [Column("idpoines")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Column("poines_perigrafi")]
        public string? Description { get; set; }

    }
}