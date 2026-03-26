import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import HelpRoundedIcon from '@mui/icons-material/HelpRounded';
import { useNavigate, useLocation } from 'react-router';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import AccountTreeIcon from '@mui/icons-material/AccountTree';

const mainListItems = [
  { text: 'Αρχική', icon: <HomeRoundedIcon />, path: '/dashboard' },
  { text: 'Υπάλληλοι', icon: <PeopleRoundedIcon />, path: '/employeelist' },
  { text: 'Μισθολογικό Κλιμάκιο', icon: <AttachMoneyIcon />, path: '' },
  { text: 'Οργανόγραμμα', icon: <AccountTreeIcon />, path: '' },
  { text: 'Ημερολόγιο', icon: <CalendarMonthIcon />, path: '' },
  { text: 'Μεταβολές', icon: <SyncAltIcon />, path: '' },
];

const secondaryListItems = [
  { text: 'Βοήθεια', icon: <HelpRoundedIcon />, path: '' },
  { text: 'Ρυθμίσεις', icon: <SettingsRoundedIcon />, path: '' },
];

export default function MenuContent() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const menuItemStyles = {
    color: '#fff',
    minHeight: 48,
    '& .MuiListItemText-primary': {
      fontWeight: 'bold',
      fontSize: '1rem',
    },
    '& .MuiListItemIcon-root': {
      color: '#fff',
    },
    '&.Mui-selected': {
      backgroundColor: 'primary.main',
      color: 'primary.contrastText',
      '&:hover': {
        backgroundColor: 'primary.dark',
      },
      '& .MuiListItemIcon-root': {
        '& .MuiSvgIcon-root': {
          color: '#1499a6',
        },
      },
    },
  };

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
      <List dense>
        {mainListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              selected={!!item.path && isActive(item.path)}
              onClick={() => item.path && navigate(item.path)}
              sx={menuItemStyles}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <List dense>
        {secondaryListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              selected={!!item.path && isActive(item.path)}
              onClick={() => item.path && navigate(item.path)}
              sx={menuItemStyles}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}
