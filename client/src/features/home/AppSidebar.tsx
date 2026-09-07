import * as React from "react"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarSeparator, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { NavMain } from "../../app/shared/components/menu/components/NavMain"
import { NavUser } from "../../app/shared/components/menu/components/NavUser"
import { NavSecondary } from "../../app/shared/components/menu/components/NavSecondary"
import { CalendarIcon, ChartBarIcon, CircleQuestionMarkIcon, GitForkIcon, HouseIcon, ListTreeIcon, SettingsIcon, SquareUserRoundIcon, UmbrellaIcon, UserIcon, UsersIcon } from "lucide-react"
import { useAccount } from "@/lib/hooks/useAccount"
import { useDashboard } from "@/lib/hooks/useDashBoard"
import ChangePasswordDialog from "../../app/shared/components/password/ChangePasswordDialog"

const REFERENCE_WIDTH = 1600;
const MIN_SCALE = 0.6;

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const {user} = useAccount();
    const { employeeCount } = useDashboard({});
    const [changePasswordOpen, setChangePasswordOpen] = React.useState(false);
    const [scale, setScale] = React.useState(1);

    React.useEffect(() => {
        const updateScale = () => {
            const raw = Math.min(1, Math.max(MIN_SCALE, window.innerWidth / REFERENCE_WIDTH));
            const stepped = Math.round(raw * 20) / 20;
            setScale(stepped);
        };
        updateScale();
        window.addEventListener('resize', updateScale);
        return () => window.removeEventListener('resize', updateScale);
    }, []);

    const getInitials = (fullName: string | undefined) => {
        if (!fullName) return "?";
        const names = fullName.trim().split(/\s+/);
        if (names.length >= 2) {
            return (names[0][0] + names[names.length - 1][0]).toUpperCase();
        }
        return fullName.substring(0, 2).toUpperCase();
    };

    const isAdmin = user?.kk === 1;

    const data = {
      user: { name: user?.fullName || "Name", email: user?.email || "Email", avatar: getInitials(user?.fullName)},
      navMain:
        [
          { title: "Αρχική", url: "/dashboard", icon: HouseIcon },
          { title: "Υπάλληλοι", url: "/employeeList", icon: UsersIcon, badge: employeeCount || 0 },
          { title: "Μισθολογικά Στοιχεία", url: "/salary", icon: ListTreeIcon },
          { title: "Οργανόγραμμα", url: "/orgchart", icon: GitForkIcon },
          { title: "Ημερολόγιο", url: "/calendar", icon: CalendarIcon },
          { title: "Άδειες", url: "/leaves", icon: UmbrellaIcon },
          { title: "Μεταβολές", url: "/changes", icon: ChartBarIcon },
          ...(isAdmin ? [{ title: "Διαχείρηση Χρηστών", url: "/users", icon: UserIcon }] : [])
        ],
      navSecondary: [
        { title: "Ρυθμίσεις", url: "#", icon: SettingsIcon, onClick: () => setChangePasswordOpen(true) },
        { title: "Βοήθεια", url: "#", icon: CircleQuestionMarkIcon }
      ]
    }

    return (
      <Sidebar {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="data-[slot=sidebar-menu-button]:p-3.5! mt-2.5!"
                style={{ height: `${40 * scale}px` }}
              >
                <a href="#">
                  <div className="bg-black rounded-lg" style={{ padding: `${8 * scale}px` }}>
                    <SquareUserRoundIcon style={{ width: `${16 * scale}px`, height: `${16 * scale}px` }} className="text-white" />
                  </div>
                  <span className="font-semibold" style={{ fontSize: `${16 * scale}px` }}>HRM</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent className="-mt-2">
          <NavMain items={data.navMain} scale={scale} />
          <NavSecondary items={data.navSecondary} className="mt-auto" />
        </SidebarContent>
        <SidebarSeparator className="bg-gray-300 w-55!" />
        <SidebarFooter>
          <NavUser user={data.user} scale={scale} />
        </SidebarFooter>
        <ChangePasswordDialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen} />
      </Sidebar>
    )
}
