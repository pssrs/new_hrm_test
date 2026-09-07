import { Box, Button, Paper, TextField, Typography, IconButton, Select, MenuItem, FormControl, InputLabel, CircularProgress, Snackbar, Alert, Autocomplete } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Grid from "@mui/material/GridLegacy";
import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import { useEmployee } from "../../../lib/hooks/useEmployee";
import { useValues } from "../../../lib/hooks/useValues";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from "dayjs";
import { employeeCardSchema, type EmployeeCardSchema } from "../../../lib/schemas/employeeCardSchema";
import { useForm, Controller} from "react-hook-form";
import {zodResolver} from '@hookform/resolvers/zod';

interface EmployeeFormProps {
    employee?: Employee;
}

export default function EmployeePersonalInfoForm({ employee: employeeProp }: EmployeeFormProps) {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    const { register, reset, handleSubmit, control, trigger, formState: { errors, isValid } } = useForm<EmployeeCardSchema>({
        mode: "onBlur",
        reValidateMode: "onChange",
        resolver: zodResolver(employeeCardSchema),
        defaultValues: {
            id: 0, am: 0, lastName: "", firstName: "", fatherName: "", motherName: "",
            spouseName: "", birthDate: "", birthPlace: "", address: "", area: "", city: "",
            postCode: "", sex: "", familyStatus: "", nationality: "", citizenship: "",
            ama: "", phone: "", identityCardNumber: "", identityCardIssueDate: "",
            amka: "", email: "", afm: "", doy: "", employmentState: "", iban1: "", iban2: ""
        }
    });

    const { employee: fetchedEmployee, isLoadingEmployee, createEmployee, updateEmployee, isSaving } = useEmployee({ id: employeeProp ? undefined : id });
    const { doys } = useValues();
    
    const employee = employeeProp ?? fetchedEmployee;

    const [successOpen, setSuccessOpen] = useState(false);
    const [failOpen, setFailOpen] = useState(false);
    
    useEffect(() => {
        if (employee) {
            reset(employee);
            trigger();
        }
    }, [employee, reset, trigger]);

    if (!employeeProp && isLoadingEmployee) {
        return <Typography>Φόρτωση...</Typography>
    }

    const isNewEmployee = !employeeProp && id === undefined;

    const onSubmit = (data: EmployeeCardSchema) => {
        if (isNewEmployee) {
            if (!employee) return;
            if (!window.confirm(`Είστε σίγουροι ότι θέλετε να καταχωρίσετε νέο υπάλληλο;`)) return;
            createEmployee(data as unknown as EmployeeCard, {
                onSuccess: () => {
                    setSuccessOpen(true);
                    setTimeout(() => {
                        navigate('/employeelist');
                    }, 1000);
                },
                onError: () => {
                    setFailOpen(true);
                }
            });
        } else {
            if (!employee) return;
            if (!window.confirm(`Είστε σίγουροι ότι θέλετε να ενημερώσετε τα στοιχεία του υπαλλήλου ${employee.lastName} ${employee.firstName} με αριθμό μητρώου ${employee.id};`)) return;
            updateEmployee(data as unknown as EmployeeCard, {
                onSuccess: () => {
                    setSuccessOpen(true);
                    setTimeout(() => {
                        navigate('/employeelist');
                    }, 1000);
                },
                onError: () => {
                    setFailOpen(true);
                }
            });
        }
    }

    return (
        
        <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{p: 2, mt: "-25px" }}>
            {location.pathname === '/newemployee' &&
                <Box 
                    sx={{ display: "flex", alignItems: "center", gap: 1, mt: 4 }} >
                    <IconButton onClick={() => navigate('/employeelist')} size="large">
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h4">
                        {isNewEmployee ? 'Νέος εργαζόμενος' : `Στοιχεία υπαλλήλου ${id}`}
                    </Typography>
                </Box>
            }
            
            <Paper sx={{ p: 3, mt: 4, mx: "auto" }}>
                <Typography variant="h5">
                    Προσωπικά στοιχεία
                </Typography>
                <Grid container spacing={3} mt={1.4}>
                    <Grid item xs={12} md={6}>
                        <input type="hidden" {...register('id')} />
                        <TextField
                            label="Αριθμός Μητρώου"
                            {...register('am')}
                            disabled={true}
                            fullWidth
                            size="small"
                            sx={{ mb: 4 }}
                        />
                        <TextField
                            label="Επώνυμο *"
                            {...register('lastName')}
                            error={!!errors.lastName}
                            helperText={errors.lastName?.message}
                            fullWidth
                            size="small"
                            sx={{ mb: 4, position: 'relative' }}
                            slotProps={{ formHelperText: { sx: { position: 'absolute', bottom: -20 } } }}
                        />
                        <TextField
                            label="Όνομα πατρός *"
                            {...register('fatherName')}
                            error={!!errors.fatherName}
                            helperText={errors.fatherName?.message}
                            fullWidth
                            size="small"
                            sx={{ mb: 4, position: 'relative' }}
                            slotProps={{ formHelperText: { sx: { position: 'absolute', bottom: -20 } } }}
                        />
                        <Controller
                            name="birthDate"
                            control={control}
                            render={({ field }) => (
                                <DatePicker
                                    label="Ημερομηνία γεννήσεως *"
                                    value={field.value ? dayjs(field.value) : null}
                                    onChange={(date) => field.onChange(date ? date.format('YYYY-MM-DD') : '')}
                                    format="DD/MM/YYYY"
                                    slotProps={{ textField: { fullWidth: true, size: "small", sx: { mb: 4, position: 'relative' }, error: !!errors.birthDate, helperText: errors.birthDate?.message, slotProps: { formHelperText: { sx: { position: 'absolute', bottom: -20 } } } } }}
                                />
                            )}
                        />
                        <TextField
                            label="Διεύθυνση *"
                            {...register('address')}
                            error={!!errors.address}
                            helperText={errors.address?.message}
                            fullWidth
                            size="small"
                            sx={{ mb: 4, position: 'relative' }}
                            slotProps={{ formHelperText: { sx: { position: 'absolute', bottom: -20 } } }}
                        />
                        <TextField
                            label="Πόλη *"
                            {...register('city')}
                            error={!!errors.city}
                            helperText={errors.city?.message}
                            fullWidth
                            size="small"
                            sx={{ mb: 4, position: 'relative' }}
                            slotProps={{ formHelperText: { sx: { position: 'absolute', bottom: -20 } } }}
                        />
                        <Controller
                            name="sex"
                            control={control}
                            render={({ field }) => (
                                <FormControl fullWidth size="small" sx={{ mb: 4 }}>
                                    <InputLabel>Φύλο</InputLabel>
                                    <Select
                                        label="Φύλο"
                                        value={field.value ?? ""}
                                        onChange={field.onChange}
                                    >
                                        <MenuItem value="">Κενό</MenuItem>
                                        <MenuItem value="1">Άντρας</MenuItem>
                                        <MenuItem value="2">Γυναίκα</MenuItem>
                                    </Select>
                                </FormControl>
                            )}
                        />
                        <TextField
                            label="Υπηκοότητα"
                            {...register('nationality')}
                            fullWidth
                            size="small"
                            sx={{ mb: 4 }}
                        />
                        <TextField
                            label="Email *"
                            {...register('email')}
                            error={!!errors.email}
                            helperText={errors.email?.message}
                            fullWidth
                            size="small"
                            sx={{ mb: 4, position: 'relative' }}
                            slotProps={{ formHelperText: { sx: { position: 'absolute', bottom: -20 } } }}
                        />
                        <TextField
                            label="ΑΦΜ *"
                            {...register('afm')}
                            fullWidth
                            size="small"
                            sx={{ mb: 4, position: 'relative' }}
                            error={!!errors.afm}
                            helperText={errors.afm?.message}
                            slotProps={{ formHelperText: { sx: { position: 'absolute', bottom: -20 } } }}
                        />
                        <TextField
                            label="ΑΜΑ *"
                            {...register('ama')}
                            error={!!errors.ama}
                            helperText={errors.ama?.message}
                            fullWidth
                            size="small"
                            sx={{ mb: 4, position: 'relative' }}
                            slotProps={{ formHelperText: { sx: { position: 'absolute', bottom: -20 } } }}
                        />
                        <TextField
                            label="Ταυτότητα/Διαβατήριο *"
                            {...register('identityCardNumber')}
                            error={!!errors.identityCardNumber}
                            helperText={errors.identityCardNumber?.message}
                            fullWidth
                            size="small"
                            sx={{ mb: 4, position: 'relative' }}
                            slotProps={{ formHelperText: { sx: { position: 'absolute', bottom: -20 } } }}
                        />
                        <Controller
                            name="employmentState"
                            control={control}
                            render={({ field }) => (
                                <FormControl fullWidth size="small" sx={{ mb: 4, position: 'relative' }} error={!!errors.employmentState}>
                                    <InputLabel>Εργασιακή κατάσταση *</InputLabel>
                                    <Select
                                        label="Εργασιακή κατάσταση"
                                        value={field.value ?? ""}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                    >
                                        <MenuItem value="">Κενό</MenuItem>
                                        <MenuItem value="1">Εν ενεργεία</MenuItem>
                                        <MenuItem value="2">Απόσταση</MenuItem>
                                        <MenuItem value="3">Μετακίνηση</MenuItem>
                                        <MenuItem value="4">Ανενέργος</MenuItem>
                                        <MenuItem value="5">Μετάθεση</MenuItem>
                                        <MenuItem value="6">Συνταξιοδότηση</MenuItem>
                                        <MenuItem value="7">Ανάστολη</MenuItem>
                                    </Select>
                                    {errors.employmentState && (
                                        <Typography variant="caption" color="error" sx={{ position: 'absolute', bottom: -20 }}>
                                            {errors.employmentState.message}
                                        </Typography>
                                    )}
                                </FormControl>
                            )}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            label="Όνομα *"
                            {...register('firstName')}
                            error={!!errors.firstName}
                            helperText={errors.firstName?.message}
                            fullWidth
                            size="small"
                            sx={{ mb: 4, position: 'relative' }}
                            slotProps={{ formHelperText: { sx: { position: 'absolute', bottom: -20 } } }}
                        />
                        <TextField
                            label="Όνομα μητέρας *"
                            {...register('motherName')}
                            error={!!errors.motherName}
                            helperText={errors.motherName?.message}
                            fullWidth
                            size="small"
                            sx={{ mb: 4, position: 'relative' }}
                            slotProps={{ formHelperText: { sx: { position: 'absolute', bottom: -20 } } }}
                        />
                        <TextField
                            label="Όνομα συζύγου"
                            {...register('spouseName')}
                            fullWidth
                            size="small"
                            sx={{ mb: 4 }}
                        />
                        <TextField
                            label="Τόπος γέννησης"
                            {...register('birthPlace')}
                            fullWidth
                            size="small"
                            sx={{ mb: 4 }}
                        />
                        <TextField
                            label="Περιοχή *"
                            {...register('area')}
                            error={!!errors.area}
                            helperText={errors.area?.message}
                            fullWidth
                            size="small"
                            sx={{ mb: 4, position: 'relative' }}
                            slotProps={{ formHelperText: { sx: { position: 'absolute', bottom: -20 } } }}
                        />
                        <TextField
                            label="Ταχυδρομικός κώδικας *"
                            {...register('postCode')}
                            error={!!errors.postCode}
                            helperText={errors.postCode?.message}
                            fullWidth
                            size="small"
                            sx={{ mb: 4, position: 'relative' }}
                            slotProps={{ formHelperText: { sx: { position: 'absolute', bottom: -20 } } }}
                        />
                        <Controller
                            name="familyStatus"
                            control={control}
                            render={({ field }) => (
                                <FormControl fullWidth size="small" sx={{ mb: 4 }}>
                                    <InputLabel>Οικογενειακή κατάσταση</InputLabel>
                                    <Select
                                        label="Οικογενειακή κατάσταση"
                                        value={field.value ?? ""}
                                        onChange={field.onChange}
                                    >
                                        <MenuItem value="">Κενό</MenuItem>
                                        <MenuItem value="1">Έγγαμος</MenuItem>
                                        <MenuItem value="2">Άγαμος</MenuItem>
                                        <MenuItem value="3">Διαζευμένος</MenuItem>
                                        <MenuItem value="4">Εν χηρεία</MenuItem>
                                    </Select>
                                </FormControl>
                            )}
                        />
                        <TextField
                            label="Εθνικότητα *"
                            {...register('citizenship')}
                            error={!!errors.citizenship}
                            helperText={errors.citizenship?.message}
                            fullWidth
                            size="small"
                            sx={{ mb: 4, position: 'relative' }}
                            slotProps={{ formHelperText: { sx: { position: 'absolute', bottom: -20 } } }}
                        />
                        <TextField
                            label="Τηλέφωνο επικοινωνίας *"
                            {...register('phone')}
                            error={!!errors.phone}
                            helperText={errors.phone?.message}
                            fullWidth
                            size="small"
                            sx={{ mb: 4, position: 'relative' }}
                            slotProps={{ formHelperText: { sx: { position: 'absolute', bottom: -20 } } }}
                        />
                        <TextField
                            label="ΑΜΚΑ *"
                            {...register('amka')}
                            fullWidth
                            size="small"
                            sx={{ mb: 4, position: 'relative' }}
                            error={!!errors.amka}
                            helperText={errors.amka?.message}
                            slotProps={{ formHelperText: { sx: { position: 'absolute', bottom: -20 } } }}
                        />
                        <Controller
                            name="doy"
                            control={control}
                            render={({ field }) => (
                                <Autocomplete
                                    options={doys}
                                    getOptionLabel={(option) => option.description}
                                    isOptionEqualToValue={(option, value) => option.code === value.code}
                                    value={doys.find((d) => String(d.code) === field.value) ?? null}
                                    onChange={(_, option) => field.onChange(option ? String(option.code) : '')}
                                    onBlur={field.onBlur}
                                    fullWidth
                                    size="small"
                                    sx={{ mb: 4 }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="ΔΟΥ"
                                            error={!!errors.doy}
                                            helperText={errors.doy?.message}
                                        />
                                    )}
                                />
                            )}
                        />
                        <Controller
                            name="identityCardIssueDate"
                            control={control}
                            render={({ field }) => (
                                <DatePicker
                                    label="Ημερομηνία έκδοσης ταυτότητας *"
                                    value={field.value ? dayjs(field.value) : null}
                                    onChange={(date) => field.onChange(date ? date.format('YYYY-MM-DD') : '')}
                                    format="DD/MM/YYYY"
                                    slotProps={{ textField: { fullWidth: true, size: "small", sx: { mb: 4, position: 'relative' }, error: !!errors.identityCardIssueDate, helperText: errors.identityCardIssueDate?.message, slotProps: { formHelperText: { sx: { position: 'absolute', bottom: -20 } } } } }}
                                />
                            )}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            label="IBAN1 *"
                            {...register('iban1')}
                            fullWidth
                            size="small"
                            sx={{ mb: 4 }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            label="IBAN2"
                            {...register('iban2')}
                            fullWidth
                            size="small"
                            sx={{ mb: 4 }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Button 
                            variant="contained" 
                            sx={{ mt: 2, textTransform: "none" }}
                            disabled={!isValid || isSaving}
                            type="submit"
                        >
                            {isSaving ? <CircularProgress size={24} /> : 'Καταχώρηση'}
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </Box>

        <Snackbar
            open={successOpen}
            autoHideDuration={3000}
            onClose={() => setSuccessOpen(false)}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
            <Alert onClose={() => setSuccessOpen(false)} severity="success" variant="filled" sx={{ width: '100%' }}>
                {isNewEmployee ? 'Ο υπάλληλος καταχωρήθηκε επιτυχώς!' : 'Τα στοιχεία του υπαλλήλου ενημερώθηκαν επιτυχώς!'}
            </Alert>
        </Snackbar>
        <Snackbar
            open={failOpen}
            autoHideDuration={3000}
            onClose={() => setFailOpen(false)}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
            <Alert onClose={() => setFailOpen(false)} severity="error" variant="filled" sx={{ width: '100%' }}>
                {isNewEmployee ? 'Πρόβλημα κατά την καταχώρηση του υπαλλήλου. Παρακαλώ δοκιμάστε ξανά.' : 'Πρόβλημα κατά την ενημέρωση του υπαλλήλου. Παρακαλώ δοκιμάστε ξανά.'}
            </Alert>
        </Snackbar>

        </LocalizationProvider>
    );
}
