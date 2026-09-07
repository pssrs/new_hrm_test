using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain;
[Table("changes")]
public class Changes
{
    [Key]
    [Column("idchanges")]
    public required int Id { get; set; }
    
    [Column("ch_am")]
    public required int AM { get; set; }

    [Column("ch_typos")]
    public required int Type { get; set; }

    [Column("ch_prohg_timh")]
    public required int PreviousState { get; set; }

    [Column("ch_timh")]
    public required int NextState { get; set; }

    [Column("ch_date_change")]
    public required DateOnly ChangeDate { get; set; }

    [Column("ch_date_next")]
    public required DateOnly NextDate { get; set; }

    [Column("ch_user")]
    public required string User { get; set; }

    [Column("ch_notes")]
    public required string Notes { get; set; }

    [Column("ch_anadr_apo")]
    public required DateOnly AnadromikaApo { get; set; }

    [Column("ch_anadr_ews")]
    public required DateOnly AnadromikaEws { get; set; }

    [Column("ch_days")]
    public required string Days { get; set; }

    [Column("ch_flag")]
    public required int Flag { get; set; }
    [Column("ch_flag_hrm")]
    public required int FlagHRM { get; set; }
    [Column("ch_ar_prwt_apof")]
    public required string Protocol { get; set; }
    [Column("ch_ar_prwt_apof_date")]
    public required DateOnly ProtocolDate { get; set; }
}