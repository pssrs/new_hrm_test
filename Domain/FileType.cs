using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Domain
{
    [Table("eidos_file")]
    public class FileType
    {
        [Key]
        [Column("ideidos_file")]
        public int Id { get; set; }
        [Column("eidosid")]
        public int Type { get; set; }
        [Column("eidos_perigrafh")]
        public required string Description { get; set; }
    }
}