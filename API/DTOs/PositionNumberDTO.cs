using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.DTOs
{
    public class PositionNumberDTO
    {
        public required int Id { get; set; }
        public required int AddressId { get; set; }
        public required int SectorId { get; set; }
        public required int DepartmentId { get; set; }
        public required int OfficeId { get; set; }
        public required int Sum { get; set; }
        public required int Used { get; set; }
        public required int Unused { get; set; }
    }
}