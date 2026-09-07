using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain
{
    [Table("topothetisis")]
    public class Placement
    {
        [Key]
        [Column("idtopothetisis")]
        public int Id { get; set; }
        [Column("topo_am")]
        public int Am { get; set; }
        [Column("topo_typos")]
        public int Type { get; set; }
        [Column("topo_old_address")]
        public int OldAddress { get; set; }
        [Column("topo_old_sector")]
        public int OldSector { get; set; }
        [Column("topo_old_department")]
        public int OldDepartment { get; set; }
        [Column("topo_old_team")]
        public int OldTeam { get; set; }
        [Column("topo_new_address")]
        public int NewAddress { get; set; }
        [Column("topo_new_sector")]
        public int NewSector { get; set; }
        [Column("topo_new_department")]
        public int NewDepartment { get; set; }
        [Column("topo_new_team")]
        public int NewTeam { get; set; }
        [Column("topo_comment")]
        public required string Comment { get; set; }
        [Column("topo_duration")]
        public required string Duration { get; set; }
        [Column("topo_date")]
        public required DateOnly Date { get; set; }
        [Column("topo_user")]
        public required string User { get; set; }
    }
}