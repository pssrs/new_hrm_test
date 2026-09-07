using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain;
[Table("children")]
public class Children
{
    [Key]
    [Column("idchildren")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public required int Id { get; set; }

    [Column("idempch")]
    public required int EmployeeId { get; set; }

    [Column("child_surname")]
    public required string ChildSurname { get; set; }

    [Column("child_name")]
    public required string ChildName { get; set; }

    [Column("child_father")]
    public required string ChildFather { get; set; }

    [Column("child_sex")]
    public required int ChildSex { get; set; }

    [Column("child_birth")]
    public required DateOnly ChildBirth { get; set; }

    [Column("child_dateFrom")]
    public required DateOnly ChildDateFrom { get; set; }

    [Column("child_dateTo")]
    public required DateOnly ChildDateTo { get; set; }

    [Column("child_disability")]
    public required int ChildDisability { get; set; }

    [Column("child_level")]
    public required int ChildLevel { get; set; }

    [Column("child_school")]
    public required int ChildSchool { get; set; }

    [Column("child_years")]
    public required string ChildYears { get; set; }

    [Column("child_months")]
    public required string ChildMonths { get; set; }

    [Column("child_flag")]
    public required int ChildFlag { get; set; }

    [Column("child_18")]
    public required int Child18 { get; set; }

    [Column("child_school_desc")]
    public required string ChildSchoolDesc { get; set; }
}
