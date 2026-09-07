using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace Domain
{
    [Table("Files")]
    public class File
    {
        [Key]
        [Column("idfiles")]
        public int Id { get; set; }
        [Column("amfiles")]
        public int Am { get; set; }
        [Column("eidosid")]
        public int Type { get; set; }
        [Column("name")]
        public required string Name { get; set; }
        [Column("location")]
        public required string Location { get; set; }
    }
}