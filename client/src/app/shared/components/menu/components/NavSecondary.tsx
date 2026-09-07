import * as React from "react"
import { Link, useLocation } from "react-router"
import { type LucideIcon } from "lucide-react"
import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
    onClick?: () => void
  }[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const location = useLocation()

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = location.pathname === item.url
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild={!item.onClick}
                  size="sm"
                  onClick={item.onClick}
                  className={isActive ? "bg-[#F0FDFA] border-l-2 border-[#00796B] rounded-none" : "hover:bg-gray-100 h-8 rounded-none" }
                >
                  {item.onClick ? (
                    <>
                      <item.icon className="size-5" />
                      <span>{item.title}</span>
                    </>
                  ) : (
                    <Link to={item.url}>
                      <item.icon className="size-5" />
                      <span>{item.title}</span>
                    </Link>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
