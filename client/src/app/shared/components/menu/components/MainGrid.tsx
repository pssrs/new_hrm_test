import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import PageViewsBarChart from './PageViewsBarChart';
import SessionsChart from './SessionsChart';
import StatCard from './StatCard';
import type { StatCardProps } from './StatCard';
import ChartUserByCountry from './ChartUserByCountry';
import PeopleIcon from '@mui/icons-material/People';
import DescriptionIcon from '@mui/icons-material/Description';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useEmployee } from '../../../../../lib/hooks/useEmployee';
import { useLeaves } from '../../../../../lib/hooks/useLeaves';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';

export default function MainGrid() {

  const { employeeCount, employeeCountMonthly } = useEmployee({});

  const now = new Date();
  const { leaveCount } = useLeaves({ date: { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() } });

  const data: StatCardProps[] = [
    {
      title: 'Σύνολο Υπαλλήλων',
      value: String(employeeCount ?? 0),
      interval: 
      <>
      {
        (employeeCountMonthly ?? 0) > 0 && (
          <Box component="span" sx={{ color: 'success.main', display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
            <TrendingUpIcon sx={{ fontSize: '1rem' }} />
            <Box component="span">+{Math.abs(employeeCountMonthly)} αύξηση σε σύγκριση με τον προηγούμενο μήνα</Box>
          </Box>
        )
      }
      {
        (employeeCountMonthly ?? 0) < 0 && (
          <Box component="span" sx={{ color: 'error.main', display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
            <TrendingDownIcon sx={{ fontSize: '1rem' }} />
            <Box component="span">-{Math.abs(employeeCountMonthly)} μείωση σε σύγκριση με τον προηγούμενο μήνα</Box>
          </Box>
        )
      }
      {
        (employeeCountMonthly ?? 0) === 0 && (
          <>
            <TrendingFlatIcon sx={{ fontSize: '1rem', verticalAlign: 'middle', mr: 0.5 }} /> δεν υπήρξε αλλαγή σε σχέση με τον προηγούμενο μήνα
          </>
        )
      }
      </>,
      trend: 'up',
      icon: PeopleIcon,
      data: [
        200, 24, 220, 260, 240, 380, 100, 240, 280, 240, 300, 340, 320, 360, 340, 380,
        360, 400, 380, 420, 400, 640, 340, 460, 440, 480, 460, 600, 880, 920,
      ],
    },
    {
      title: 'Εκκρεμείς Άδειες',
      value: leaveCount ? String(leaveCount) : '0',
      interval: 'Απαιτήται έγκριση',
      trend: 'down',
      icon: CalendarTodayIcon,
      data: [
        1640, 1250, 970, 1130, 1050, 900, 720, 1080, 900, 450, 920, 820, 840, 600, 820,
        780, 800, 760, 380, 740, 660, 620, 840, 500, 520, 480, 400, 360, 300, 220,
      ],
    },
    {
      title: 'Ενεργά Έγγραφα',
      value: '5',
      interval: 'Σε εξέλιξη',
      trend: 'neutral',
      icon: DescriptionIcon,
      data: [],
    },{
      title: 'Ειδοποιήσεις',
      value: '12',
      interval: 'Απαιτήται προσοχή',
      trend: 'neutral',
      icon: ErrorOutlineIcon,
      data: [
        500, 400, 510, 530, 520, 600, 530, 520, 510, 730, 520, 510, 530, 620, 510, 530,
        520, 410, 530, 520, 610, 530, 520, 610, 530, 420, 510, 430, 520, 510,
      ],
    },
  ];

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px'}, pl: 2 }}>
      {/* cards */}
      <Typography component="h2" variant="h4" sx={{ mb: 2 , mt: 4 }}>
        Αρχική
      </Typography>
      <Grid
        container
        spacing={2}
        columns={12}
        sx={{ mb: (theme) => theme.spacing(2) }}
      >
        {data.map((card, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard {...card} />
          </Grid>
        ))}
        <Grid size={{ xs: 12, md: 6 }}>
          <SessionsChart />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <PageViewsBarChart />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartUserByCountry />
        </Grid>
      </Grid>
    </Box>
  );
}