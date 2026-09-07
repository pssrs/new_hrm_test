using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Domain
{
    [Table("paths")]
    public class FilePath
    {
        [Key]
        [Column("idpaths")]
        public int Id { get; set; }
        [Column("paths_name")]
        public string Name { get; set; } = string.Empty;
        [Column("paths_url")]
        public string Url { get; set; } = string.Empty;
    }
}