using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.DTOs.File
{
    public class UpdateEmployeeFileDto
    {
        public int Id { get; set; }

        public int Type { get; set; }

        public IFormFile? File { get; set; }
    }
}