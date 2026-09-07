import { IconLogout } from "@tabler/icons-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { useAccount } from "@/lib/hooks/useAccount"

export function NavUser({ user, scale = 1 }: { user: { name: string, email: string, avatar: string }, scale?: number }) {
  const { logout } = useAccount();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground w-full!"
              style={{ height: `${56 * scale}px` }}
            >
              <Avatar className="rounded-full bg-gray-100 border border-gray-200" style={{ width: `${36 * scale}px`, height: `${36 * scale}px` }}>
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-full font-bold" style={{ fontSize: `${14 * scale}px` }}>{user.avatar}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate font-medium" style={{ fontSize: `${14 * scale}px` }}>{user.name}</span>
                <span className="truncate text-muted-foreground" style={{ fontSize: `${12 * scale}px` }}>
                  {user.email}
                </span>
              </div>

              <div className="hover:bg-gray-100 hover:cursor-pointer rounded-lg" style={{ padding: `${8 * scale}px` }} onClick={() => logout()}>
                <IconLogout className="cursor-pointer" style={{ width: `${16 * scale}px`, height: `${16 * scale}px` }} />
              </div>
            </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
