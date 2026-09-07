using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Domain
{
    [Table("changes_map")]
    public class ChangeTypeMap
    {
        [Key]
        [Column("idmap")]
        public int Id { get; set; }
        [Column("map_typos")]
        public int Type { get; set; }
        [Column("map_timh")]
        public int Value { get; set; }
        [Column("map_string")]
        public required string Description { get; set; }

    }
}