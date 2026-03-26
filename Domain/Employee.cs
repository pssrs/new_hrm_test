using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain;
[Table("employees")]
public class Employee
{
    // =========================
    // PRIMARY KEY (composite)
    // =========================
    [Key]
    [Column("idemp")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Column("emp_am")]
    public int Am { get; set; }

    // =========================
    // BASIC INFO
    // =========================

    [Column("emp_surname")]
    public string LastName { get; set; } = string.Empty;

    [Column("emp_name")]
    public string FirstName { get; set; } = string.Empty;

    [Column("emp_patros")]
    public string FatherName { get; set; } = string.Empty;

    [Column("emp_mhtros")]
    public string MotherName { get; set; } = string.Empty;

    [Column("emp_suzugou")]
    public string SpouseName { get; set; } = string.Empty;

    [Column("emp_genos")]
    public string GenderDescription { get; set; } = string.Empty;

    // =========================
    // BIRTH / IDENTITY
    // =========================

    [Column("emp_hmg")]
    public DateOnly? BirthDate { get; set; }

    [Column("emp_topos")]
    public string BirthPlace { get; set; } = string.Empty;

    [Column("emp_adt")]
    public string IdentityCardNumber { get; set; } = string.Empty;

    [Column("emp_hmAdt")]
    public DateOnly? IdentityCardIssueDate { get; set; }

    // =========================
    // ADDRESS
    // =========================

    [Column("emp_odos")]
    public string Address { get; set; } = string.Empty;

    [Column("emp_perioxi")]
    public string Area { get; set; } = string.Empty;

    [Column("emp_polh")]
    public string City { get; set; } = string.Empty;

    [Column("emp_tk")]
    public string PostCode { get; set; } = string.Empty;

    [Column("emp_edra")]
    public string Headquarters { get; set; } = "-";

    // =========================
    // PERSONAL INFO
    // =========================

    [Column("emp_fulo")]
    public int Sex { get; set; } = 0;

    [Column("emp_oik")]
    public int FamilyStatus { get; set; } = 0;

    [Column("emp_tekna")]
    public int Children { get; set; } = 0;

    [Column("emp_uphk")]
    public string Nationality { get; set; } = string.Empty;

    [Column("emp_ethn")]
    public string Citizenship { get; set; } = string.Empty;

    // =========================
    // INSURANCE / TAX
    // =========================

    [Column("emp_ika")]
    public string Ama { get; set; } = string.Empty;

    [Column("emp_amka")]
    public string Amka { get; set; } = string.Empty;

    [Column("emp_afm")]
    public string Afm { get; set; } = string.Empty;

    [Column("emp_doy")]
    public string Doy { get; set; } = string.Empty;

    // =========================
    // CONTACT
    // =========================

    [Column("emp_kin")]
    public string Phone { get; set; } = string.Empty;

    [Column("emp_email")]
    public string Email { get; set; } = string.Empty;

    // =========================
    // BANK
    // =========================

    [Column("emp_iban1")]
    public string Iban1 { get; set; } = string.Empty;

    [Column("emp_iban2")]
    public string Iban2 { get; set; } = string.Empty;

    // =========================
    // EMPLOYMENT DATES
    // =========================

    [Column("emp_hmprosl")]
    public DateOnly? HireDate { get; set; }

    [Column("emp_hmdhm")]
    public DateOnly? PublicationDate { get; set; }

    [Column("emp_hmdior")]
    public DateOnly? AppointmentDate { get; set; }

    [Column("emp_hmdiakop")]
    public DateOnly? TerminationDate { get; set; }

    // =========================
    // POSITION / ORGANIZATION
    // =========================

    [Column("emp_dieuthunsh")]
    public int Directorate { get; set; } = 0;

    [Column("emp_tomeas")]
    public int Sector { get; set; } = 0;

    [Column("emp_tmhma")]
    public int Department { get; set; } = 0;

    [Column("emp_grafeio")]
    public int Office { get; set; } = 0;

    [Column("emp_dieuthunsh_erg")]
    public int WorkDirectorate { get; set; } = 0;

    [Column("emp_tomeas_erg")]
    public int WorkSector { get; set; } = 0;

    [Column("emp_tmhma_erg")]
    public int WorkDepartment { get; set; } = 0;

    [Column("emp_grafeio_erg")]
    public int WorkOffice { get; set; } = 0;

    // =========================
    // CAREER
    // =========================

    [Column("emp_thesi")]
    public int Position { get; set; } = 0;

    [Column("emp_vathmos")]
    public string Rank { get; set; } = "0";

    [Column("emp_typos")]
    public int EmploymentType { get; set; } = 0;

    [Column("emp_kathgoria")]
    public string Category { get; set; } = "0";

    [Column("emp_eidik")]
    public string Specialty { get; set; } = string.Empty;

    [Column("emp_klados")]
    public string Branch { get; set; } = "0";

    // =========================
    // SALARY
    // =========================

    [Column("emp_mk")]
    public int MK { get; set; } = 0;

    [Column("emp_vm")]
    public string SalaryGrade { get; set; } = string.Empty;

    [Column("emp_hm_mk")]
    public DateOnly? MKDate { get; set; }

    [Column("emp_code_misth")]
    public string SalaryCode { get; set; } = "Μ01";

    // =========================
    // STATUS / FLAGS
    // =========================

    [Column("emp_energos")]
    public int IsActive { get; set; } = 0;

    [Column("emp_flag")]
    public int Flag { get; set; } = 0;

    [Column("emp_am2")]
    public int SecondaryEmployeeNumber { get; set; } = 0;

    [Column("emp_prad")]
    public string Notes { get; set; } = string.Empty;

    [Column("emp_ergsx")]
    public int WorkRelation { get; set; }

    [Column("emp_hm_vathm")]
    public DateOnly? RankDate { get; set; }

    [Column("emp_fek")]
    public string Fek { get; set; } = string.Empty;

    [Column("emp_date_added")]
    public DateOnly? DateAdded { get; set; }

}
