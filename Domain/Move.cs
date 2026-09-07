using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Domain
{
    [Table("moving")]
    public class Move
    {
        [Key]
        [Column("idmoving")]
        public int Id { get; set; }
        [Column("idempmov")]
        public int Am { get; set; }
        [Column("mov_eid")]
        public required int Type { get; set; }
        [Column("mov_pro")]
        public required int Destination { get; set; }
        [Column("mov_foreas")]
        public required int Foreas { get; set; }
        [Column("mov_dateFrom")]
        public required DateOnly DateFrom { get; set; }
        [Column("mov_dateTo")]
        public required DateOnly DateTo { get; set; }
        [Column("mov_apofasi")]
        public required string Decision { get; set; }
        [Column("mov_dateApof")]
        public required DateOnly DateDecision { get; set; }
        [Column("mov_comments")]
        public required string Comment { get; set; }
    }
}