using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;

namespace Domain;

[Table("users")]
public class User
{
    [Key]
    [Column("idusers")]
    public required int Id {get;set;}
    
    [Column("username")]
    public required string UserName {get;set;}
    
    [Column("password")]
    public required string Password {get;set;}
    
    [Column("groups")]
    public required int Groups {get;set;}
    
    [Column("fullname")]
    public required string Fullname {get;set;}

    [Column("kk")]
    public required string Kk {get;set;}

    [Column("email")]
    public required string Email {get;set;}

    [Column("am")]
    public required int Am {get;set;}
}
