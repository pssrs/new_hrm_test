import type { ReactNode } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { SvgIconComponent } from '@mui/icons-material';

export type StatCardProps = {
  title: string;
  value: string;
  interval: ReactNode;
  trend: 'up' | 'down' | 'neutral';
  data: number[];
  icon?: SvgIconComponent;
};

export default function StatCard({
  title,
  value,
  interval,
  icon: Icon,
}: StatCardProps) {

  return (
    <Card variant="outlined" sx={{ height: '100%', flexGrow: 1 }}>
      <CardContent>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography component="h2" variant="subtitle2">
            {title}
          </Typography>
          {Icon && <Icon sx={{ fontSize: '1.1rem', color: 'text.secondary' }} />}
        </Stack>
        <Stack
          direction="column"
          sx={{ justifyContent: 'space-between', flexGrow: '1', gap: 1 }}
        >
          <Stack sx={{ justifyContent: 'space-between' }}>
            <Stack
              direction="row"
              sx={{ justifyContent: 'space-between', alignItems: 'center' }}
            >
              <Typography variant="h2" component="h5">
                {value}
              </Typography>
            </Stack>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {interval}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
