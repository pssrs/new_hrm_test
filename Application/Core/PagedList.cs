using System.Collections.Generic;

namespace Application.Core;

public class PagedList<T>
{
    public List<T> Items { get; set; }
    public int TotalCount { get; set; }
 
    public PagedList(List<T> items, int totalCount)
    {
        Items = items;
        TotalCount = totalCount;
    }
}
