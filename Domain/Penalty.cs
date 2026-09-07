using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Domain
{
    [Table("penalty")]
    public class Penalty
    {
        [Key]
        [Column("idpenalty")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Column("idemppen")]
        public int Am { get; set; }

        [Column("pen_type")]
        public int Type { get; set; }

        [Column("pen_lexical")]
        public int? Lexical { get; set; }

        [Column("pen_descr")]
        public string? Description { get; set; }

        [Column("pen_decision")]
        public string? Decision { get; set; }

        [Column("pen_dateFrom")]
        public DateOnly? DateFrom { get; set; }

        [Column("pen_dateTo")]
        public DateOnly? DateTo { get; set; }

        [Column("pen_poso")]
        public string? Amount { get; set; }

        [Column("pen_flag")]
        public int Flag { get; set; } = 0;
    }
}