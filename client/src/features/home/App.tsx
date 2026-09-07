import { Box, CssBaseline } from '@mui/material';
import '../home/App.css'
import { Outlet, useLocation } from 'react-router';
import { useAccount } from '../../lib/hooks/useAccount';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/features/home/AppSidebar';
import HomePage from './HomePage';

function App() {
  const { isLoggedIn } = useAccount();
  const location = useLocation();

  if (!isLoggedIn()) {
    return (
      <Box sx={{ minHeight: '100vh' }}>
        <CssBaseline />
        <Outlet />
      </Box>
    )
  }

  const isDashboard = location.pathname === '/dashboard' || location.pathname === '/';

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }>
          <AppSidebar className="bg-white border-r border-gray-200 w-60" />
          <SidebarInset>
            <div className="flex flex-1 flex-col">
              <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                  {isDashboard ? <HomePage /> : <Outlet />}
                </div>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
  )
}

export default App