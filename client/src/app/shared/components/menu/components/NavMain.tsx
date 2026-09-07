import { Link, useLocation } from "react-router"
import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import type { ForwardRefExoticComponent } from "react"
import type { LucideProps } from "lucide-react"

export function NavMain({ items, scale = 1 }: { items: { title: string, url: string, icon?: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>, badge?: number }[], scale?: number }) {
  const location = useLocation();

  const isItemActive = (url: string) => {
    const path = location.pathname;

    // Ρητός ορισμός: ποια path prefixes ανήκουν σε κάθε tab
    const activeMap: Record<string, string[]> = {
        '/dashboard': ['/dashboard'],
        '/employeeList': ['/employeeList', '/employeeCard', '/employee/', '/newemployee'],
        '/employeeOrgChart': ['/employeeOrgChart'],
        '/employeeCalendar': ['/employeeCalendar'],
        '/employeeChanges': ['/employeeChanges'],
    };

    const prefixes = activeMap[url] ?? [url];
    return prefixes.some(p =>
        p.endsWith('/') ? path.startsWith(p) : (path === p || path.startsWith(p + '/'))
    );
  };
  
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu />
        <SidebarMenu>
          {items.map((item) => {
            const isActive = isItemActive(item.url);
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  className={isActive ? "bg-[#F0FDFA] shadow-[inset_2px_0_0_#00796B] rounded-none w-full!" : "hover:bg-gray-100 rounded-none w-full!" }
                  style={{ height: `${32 * scale}px` }}
                >
                  <Link to={item.url} className="flex items-center justify-between gap-2" style={{ fontSize: `${14 * scale}px` }}>
                    <div className="flex items-center gap-2">
                      {item.icon && <item.icon style={{ width: `${16 * scale}px`, height: `${16 * scale}px` }} />}
                      <span>{item.title}</span>
                    </div>
                    {item.badge !== undefined && (
                      <Badge
                        className={isActive ? "bg-[#ccfbf1] text-[#0F766E] px-2 py-0.5" : "bg-gray-100 text-gray-500 px-2 py-0.5"}
                        style={{ fontSize: `${12 * scale}px` }}
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
