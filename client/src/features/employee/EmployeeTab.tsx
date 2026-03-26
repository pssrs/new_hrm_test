import * as React from 'react';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { Button, CircularProgress, IconButton, Snackbar, Alert, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router';
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import { useEmployee } from '../../lib/hooks/useEmployee';
import EmployeeServiceInfoForm from './form/EmployeeServiceInfoForm';
import EmployeePersonalInfoForm from './form/EmployeePersonalInfoForm';

export default function EmployeeTab() {
    const [value, setValue] = React.useState('1');
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { employee, isLoadingEmployee, deleteEmployee, isDeleting, employeeService } = useEmployee({ id });
    const [deleteSuccessOpen, setDeleteSuccessOpen] = React.useState(false);
    const [deleteFailOpen, setDeleteFailOpen] = React.useState(false);

    const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
        setValue(newValue);
    };

    const handleDelete = () => {
        if (!employee) return;
        if (!window.confirm(`Είστε σίγουροι ότι θέλετε να διαγράψετε τον υπάλληλο ${employee.lastName} ${employee.firstName} με αριθμό μητρώου ${employee.id};`)) return;
        
        deleteEmployee(employee.id, {
            onSuccess: () => {
                setDeleteSuccessOpen(true);
                setTimeout(() => {
                    navigate('/employeelist');
                }, 1000);
            },
            onError: () => {
                setDeleteFailOpen(true);
            }
        });
    };

    if (isLoadingEmployee) {
        return <Typography>Φόρτωση...</Typography>;
    }

    return (
        <Box sx={{ width: '100%', typography: 'body1' }}>
            <Box 
                sx={{ display: "flex", alignItems: "center", gap: 1, mt: 4 }} >
                <IconButton onClick={() => navigate('/employeelist')} size="large">
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" sx={{ flexGrow: 1 }}>
                    {employee ? `Στοιχεία υπαλλήλου ${employee.lastName} ${employee.firstName}` : `Στοιχεία υπαλλήλου`}
                </Typography>
                <Button
                    variant="contained"
                    color="error"
                    startIcon={isDeleting ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
                    onClick={handleDelete}
                    disabled={isDeleting}
                    sx={{ textTransform: "none" }}
                >
                    Διαγραφή
                </Button>
            </Box>
            <TabContext value={value}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <TabList onChange={handleChange} aria-label="lab API tabs example">
                    <Tab label="Προσωπικά στοιχεία" value="1" />
                    <Tab label="Υπηρεσιακά στοιχεία" value="2" />
                    <Tab label="Άδειες" value="3" />
                    <Tab label="Ποινες" value="4" />
                    <Tab label="Προυπηρεσια" value="5" />
                    <Tab label="Τεκνα" value="6" />
                    <Tab label="Μετακινησεις" value="7" />
                    <Tab label="Σπουδες" value="8" />
                    <Tab label="Αρχεια" value="9" />
                    <Tab label="Μεταβολες" value="10" />
                    <Tab label="Αναφορες" value="11" />
                </TabList>
                </Box>
                <TabPanel value="1">
                    <EmployeePersonalInfoForm employee={employee} />
                </TabPanel>
                <TabPanel value="2">
                    <EmployeeServiceInfoForm employeeService={employeeService} />
                </TabPanel>
                <TabPanel value="3">Άδειες</TabPanel>
                <TabPanel value="4">Ποινες</TabPanel>
                <TabPanel value="5">Προυπηρεσια</TabPanel>
                <TabPanel value="6">Τεκνα</TabPanel>
                <TabPanel value="7">Μετακινησεις</TabPanel>
                <TabPanel value="8">Σπουδες</TabPanel>
                <TabPanel value="9">Αρχεια</TabPanel>
                <TabPanel value="10">Μεταβολες</TabPanel>
                <TabPanel value="11">Αναφορες</TabPanel>
            </TabContext>

            <Snackbar
                open={deleteSuccessOpen}
                autoHideDuration={3000}
                onClose={() => setDeleteSuccessOpen(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={() => setDeleteSuccessOpen(false)} severity="success" variant="filled" sx={{ width: '100%' }}>
                    Ο υπάλληλος διαγράφηκε επιτυχώς!
                </Alert>
            </Snackbar>
            <Snackbar
                open={deleteFailOpen}
                autoHideDuration={3000}
                onClose={() => setDeleteFailOpen(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={() => setDeleteFailOpen(false)} severity="error" variant="filled" sx={{ width: '100%' }}>
                    Πρόβλημα κατά τη διαγραφή του υπαλλήλου. Παρακαλώ δοκιμάστε ξανά.
                </Alert>
            </Snackbar>
        </Box>
    );
}