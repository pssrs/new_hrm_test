using System;

namespace Application.DashBoard.DTOs;

public class DashBoardCalendar
{
    public required DateOnly Date { get; set; }
    public required string FullName { get; set; }
    public required string Event { get; set; }
    public required int Days { get; set; }
    public int? ChildId { get; set; }
    public int? Am { get; set; }
    public int? ChildFlag { get; set; }
}
