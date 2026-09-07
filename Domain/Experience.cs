using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Domain
{
    [Table("Experience")]
    public class Experience
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("idexperience")]
        public required int Id { get; set; }
        [Column("idempexp")]
        public required int Am { get; set; }
        [Column("exp_type")]
        public required int Type { get; set; }
        [Column("exp_dateFrom")]
        public required DateOnly DateFrom { get; set; }
        [Column("exp_dateTo")]
        public required DateOnly DateTo { get; set; }

        [Column("exp_years")]
        public required string Years { get; set; }

        [Column("exp_months")]
        public required string Months { get; set; }
        [Column("exp_days")]
        public required string Days { get; set; }

        [Column("exp_carrier")]
        public required string Carrier { get; set; }

        [Column("exp_decisionid")]
        public required string DecisionId { get; set; }

        [Column("exp_comments")]
        public required string Comments { get; set; }

        [Column("exp_agonis")]
        public required int Agonis { get; set; }

        [Column("exp_mk")]
        public required int Mk { get; set; }

        [Column("exp_vathm")]
        public required int Grade { get; set; }

        [Column("exp_sunt")]
        public required int Sunt { get; set; }

        [Column("exp_dateCouncil")]
        public required DateOnly DateCouncil { get; set; }

        [Column("exp_auto")]
        public required int Auto { get; set; }

    }
}