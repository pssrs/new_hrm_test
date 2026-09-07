using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Domain
{
    [Table("eidos_changes")]
    public class ChangeType
    {
        [Key]
        [Column("idechanges")]
        public int Id { get; set; }
        [Column("echanges_perigrafh")]
        public required string Description { get; set; }
    }
}