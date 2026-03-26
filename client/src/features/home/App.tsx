import { Box, CssBaseline, Stack } from '@mui/material';
import { alpha } from '@mui/material/styles';
import '../home/App.css'
import { Outlet } from 'react-router';
import { useAccount } from '../../lib/hooks/useAccount';
import SideMenu from '../../app/shared/components/menu/components/SideMenu';
import AppNavbar from '../../app/shared/components/menu/components/AppNavbar';
import AppTheme from '../../app/shared/components/menu/theme/AppTheme';
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from '../../app/shared/components/menu/theme/customizations';

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

function App() {
  const { isLoggedIn } = useAccount();

  if (!isLoggedIn()) {
    return (
      <Box sx={{ minHeight: '100vh' }}>
        <CssBaseline />
        <Outlet />
      </Box>
    )
  }

  return (
    <AppTheme themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex' }}>
        <SideMenu />
        <AppNavbar />
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : alpha(theme.palette.background.default, 1),
            overflow: 'auto',
            minHeight: '100vh',
          })}
        >
          <Stack
            spacing={2}
            sx={{
              alignItems: 'center',
              mx: 3,
              pb: 5,
              mt: { xs: 8, md: 0 },
            }}
          >
            <Outlet />
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  )
}

export default App