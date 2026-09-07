using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain;
[Table("address")]
public class Address
{
    [Key]
    [Column("idaddress")]
    public int Id { get; set; }
    
    [Column("dieuthunsh")]
    public string Address_str { get; set; } = string.Empty;
}
