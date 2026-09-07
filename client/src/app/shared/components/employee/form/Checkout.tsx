import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Typography from '@mui/material/Typography';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import AppTheme from './theme/AppTheme';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router';
import CheckIcon from '@mui/icons-material/Check';
import EmployeePersonalInfoForm from './EmployeePersonalInfoForm';
import EmployeeServiceInfoForm from './EmployeeServiceInfoForm';

function CustomStepIcon(props: { active?: boolean; completed?: boolean; index: number }) {
  return (
    <Box
      sx={{
        width: 25,
        height: 25,
        borderRadius: '50%',
        backgroundColor: props.active ? '#1797a3' : props.completed ? '#4caf50' : '#e0e0e0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: props.active || props.completed ? 'white' : 'black',
        fontSize: '14px',
      }}
    >
      {props.completed ? <CheckIcon sx={{ fontSize: '16px' }} /> : props.index + 1}
    </Box>
  );
}

const steps = ['Προσωπικά', 'Υπηρεσιακά', 'Προϋπηρεσία', 'Τέκνα', 'Σπουδές', 'Αρχεία'];
function getStepContent(step: number) {
  switch (step) {
    case 0:
      return <EmployeePersonalInfoForm />;
    case 1:
      return <EmployeeServiceInfoForm />;
    case 2:
      return <EmployeePersonalInfoForm />;
    default:
      throw new Error('Unknown step');
  }
}
export default function Checkout(props: { disableCustomTheme?: boolean }) {
  const [activeStep, setActiveStep] = React.useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handleBackToList = () => {
    navigate('/employeeList');
  };
  
  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Grid
        container
        sx={{
          height: {
            xs: '100%',
          }
        }}
      >
        <Grid
          size={{ sm: 20, md: 10, lg: 11 }}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            maxWidth: '100%',
            width: '100%',
            backgroundColor: { xs: 'transparent', sm: 'background.default' },
            alignItems: 'start',
            pt: { xs: 0, sm: 6 },
            px: { xs: 2, sm: 10 },
            gap: { xs: 4, md: 8 },
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1} onClick={handleBackToList} sx={{ pl: 1, cursor: 'pointer' }}>
            <ArrowBackIcon />
            <Typography variant='body1'>Πίσω στη λίστα</Typography>
          </Stack>
          <Stack>
            <Typography variant='h3' sx={{fontWeight: 'bold'}}>Νέος Υπάλληλος</Typography>
            <Typography variant='body1' color='text.secondary'>Συμπληρώστε τα στοιχεία του νέου υπαλλήλου</Typography>
          </Stack>
          <Box sx={{justifyContent: 'center', mt: -3,}}>
            <Stepper activeStep={activeStep} alternativeLabel sx={{ width: '100%' }}>
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepLabel 
                    StepIconComponent={({ active, completed }: { active?: boolean; completed?: boolean }) => <CustomStepIcon active={active} completed={completed} index={index} />}
                    sx={{
                      '& .MuiStepLabel-label': {
                        color: activeStep === index ? '#1797a3' : 'inherit',
                      }
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
            {activeStep === steps.length ? (
              <Stack spacing={2} useFlexGap>
                <Typography variant="h5">Thank you for your order!</Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  Your order number is
                  <strong>&nbsp;#140396</strong>. We have emailed your order
                  confirmation and will update you once its shipped.
                </Typography>
                <Button
                  variant="contained"
                  sx={{ alignSelf: 'start', width: { xs: '100%', sm: 'auto' } }}
                >
                  Go to my orders
                </Button>
              </Stack>
            ) : (
              <React.Fragment>
                {getStepContent(activeStep)}
                <Box
                  sx={[
                    {
                      display: 'flex',
                      flexDirection: { xs: 'column-reverse', sm: 'row' },
                      alignItems: 'end',
                      flexGrow: 1,
                      gap: 1,
                      pb: { xs: 12, sm: 0 },
                      mt: { xs: 2, sm: 0 },
                      mb: '60px',
                    },
                    activeStep !== 0
                      ? { justifyContent: 'space-between' }
                      : { justifyContent: 'flex-end' },
                  ]}
                >
                  {activeStep !== 0 && (
                    <Button
                      startIcon={<ChevronLeftRoundedIcon />}
                      onClick={handleBack}
                      variant="text"
                      sx={{ display: { xs: 'none', sm: 'flex'} , mt: 4  }}
                    >
                      Previous
                    </Button>
                  )}
                  {activeStep !== 0 && (
                    <Button
                      startIcon={<ChevronLeftRoundedIcon />}
                      onClick={handleBack}
                      variant="outlined"
                      fullWidth
                      sx={{ display: { xs: 'flex', sm: 'none' } , mt: 4  }}
                    >
                      Previous
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    endIcon={<ChevronRightRoundedIcon />}
                    onClick={handleNext}
                    sx={{ width: { xs: '100%', sm: 'fit-content' }  , mt: 4 }}
                  >
                    {activeStep === steps.length - 1 ? 'Προσθήκη Υπαλλήλου' : 'Επόμενο'}
                  </Button>
                </Box>
              </React.Fragment>
            )}
          </Box>
        </Grid>
      </Grid>
    </AppTheme>
  );
}
