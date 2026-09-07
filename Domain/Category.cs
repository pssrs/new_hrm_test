using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain;

[Table("category")]
public class Category
{
    [Key]
    [Column("idcategory")]
    public int Id { get; set; }

    [Column("description")]
    public required string Description { get; set; }
    
    [Column("code")]
    public required string Code { get; set; }
}