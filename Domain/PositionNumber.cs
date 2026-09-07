using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain
{
    [Table("theseis")]
    public class PositionNumber
    {
        [Key]
        [Column("th_id")]
        public required int Id { get; set; }

        [Column("th_address")]
        public required int AddressId { get; set; }
        
        [Column("th_sector")]
        public required int SectorId { get; set; }

        [Column("th_department")]
        public required int DepartmentId { get; set; }
        
        [Column("th_office")]
        public required int OfficeId { get; set; }

        [Column("th_num_position")]
        public required int Sum { get; set; }
    }
}