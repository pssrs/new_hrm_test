using System.ComponentModel.DataAnnotations.Schema;

namespace Domain
{
    [Table("parameters")]
    public class Parameter
    {
        [Column("idpar")]
        public int Id { get; set; }

        [Column("par_name")]
        public string? Name { get; set; }

        [Column("par_value1")]
        public string? Value1 { get; set; }

        [Column("par_value2")]
        public string? Value2 { get; set; }

        [Column("par_value3")]
        public string? Value3 { get; set; }
    }
}
