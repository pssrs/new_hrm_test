using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain;
[Table("employee_count_per_month")]
public class EmployeeCountMonthly
{
    [Key]
    [Column("ecpm_id")]
    public int Id { get; set; }

    [Column("ecpm_month")]
    public int Month { get; set; }

    [Column("ecpm_year")]
    public int Year { get; set; }
    
    [Column("ecpm_count")]
    public int Count { get; set; }
}