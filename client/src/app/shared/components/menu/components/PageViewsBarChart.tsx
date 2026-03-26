import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { BarChart } from '@mui/x-charts/BarChart';
// removed theme import since a single fixed color is used
import { useLeaves } from '../../../../../lib/hooks/useLeaves';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function PageViewsBarChart() {
  const { monthlyCounts } = useLeaves();
  const maxCount = Math.max(0, ...(monthlyCounts ?? []));
  const maxTick = Math.ceil(maxCount / 5) * 5;
  const tickValues = Array.from({ length: Math.floor(maxTick / 5) + 1 }, (_, i) => i * 5);
  const yAxisConfig = {
    width: 50,
    min: 0,
    max: maxTick,
    tickValues,
    tickFormat: (v: number) => String(Math.round(v)),
  };
  const singleBarColor = '#25a8a6';
  
  return (
    <Card variant="outlined" sx={{ width: '100%' }}>
      <CardContent>
        <Typography component="h2" variant="h4" gutterBottom>
          Κατανομή Αδειών
        </Typography>
        <Stack sx={{ justifyContent: 'space-between' }}>
          <Stack
            direction="row"
            sx={{
              alignContent: { xs: 'center', sm: 'flex-start' },
              alignItems: 'center',
              gap: 1,
            }}
          >
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Ημέρες αδειών ανά μήνα
          </Typography>
        </Stack>
        <BarChart
          borderRadius={8}
          colors={[singleBarColor]}
          xAxis={[
            {
              scaleType: 'band',
              categoryGapRatio: 0.5,
              data: ['Ιαν', 'Φεβ', 'Μαρ', 'Απρ', 'Μαϊ', 'Ιουν', 'Ιουλ', "Αυγ", 'Σεπ', 'Οκτ', 'Νοε', 'Δεκ'],
              height: 24,
            },
          ]}
          yAxis={[yAxisConfig as any]}
          series={[
            {
              id: 'leaves-month',
              label: 'Άδειες',
              data: monthlyCounts,
              stack: 'A',
            }
          ]}
          height={250}
          margin={{ left: 0, right: 0, top: 20, bottom: 0 }}
          grid={{ horizontal: true }}
          hideLegend
        />
      </CardContent>
    </Card>
  );
}
