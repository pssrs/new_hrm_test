import type { Theme } from '@mui/material/styles';
import type { DataGridComponents } from '@mui/x-data-grid/themeAugmentation';
import { gray } from '../.././theme/themePrimitives';

export const dataGridCustomizations: DataGridComponents<Theme> = {
  MuiDataGrid: {
    styleOverrides: {
      root: ({ theme }) => ({
        '--DataGrid-overlayHeight': '300px',
        borderColor: gray[200],
        backgroundColor: (theme.vars || theme).palette.background.default,
        '& .MuiDataGrid-cell': {
          borderColor: gray[200],
        },
        '& .MuiDataGrid-columnHeaders': {
          borderColor: gray[200],
        },
        '& .MuiDataGrid-footerContainer': {
          borderColor: gray[200],
        },
        '& .MuiDataGrid-row:hover': {
          backgroundColor: gray[50],
        },
        '& .MuiDataGrid-row.even': {
          backgroundColor: (theme.vars || theme).palette.background.default,
        },
        ...theme.applyStyles('dark', {
          borderColor: gray[700],
          '& .MuiDataGrid-cell': {
            borderColor: gray[700],
          },
          '& .MuiDataGrid-columnHeaders': {
            borderColor: gray[700],
          },
          '& .MuiDataGrid-footerContainer': {
            borderColor: gray[700],
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: gray[800],
          },
          '& .MuiDataGrid-row.even': {
            backgroundColor: gray[900],
          },
        }),
      }),
    },
  },
};
