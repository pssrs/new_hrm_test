import { Box, Button, FormControl, IconButton, InputLabel, MenuItem, Paper, Select, TextField, Typography, CircularProgress, Snackbar, Alert } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Grid from "@mui/material/GridLegacy";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { useEmployee } from "../../../lib/hooks/useEmployee";
import { useLocation, useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { employeeServiceSchema, type EmployeeServiceSchema } from "../../../lib/schemas/employeeServiceSchema";
import { zodResolver } from "@hookform/resolvers/zod";

interface EmployeeServiceFormProps {
    employeeService?: EmployeeService;
}

export default function EmployeeServiceInfoForm({ employeeService: employeeServiceProp }: EmployeeServiceFormProps) {
    
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    const { register, reset, handleSubmit, control, trigger, formState: { isValid } } = useForm<EmployeeServiceSchema>({
        mode: "onBlur",
        reValidateMode: "onChange",
        resolver: zodResolver(employeeServiceSchema),
        defaultValues: {
            id: 0, am: 0,
            hireDate: null, publicationDate: null, appointmentDate: null,
            terminationDate: null, mkDate: null, rankDate: null,
            workRelation: 0, position: 0, employmentType: 0,
            mk: 0, salaryGrade: "", salaryCode: "",
            category: "", branch: "", specialty: "", rank: "", fek: "",
            directorate: 0, sector: 0, department: 0, office: 0,
            workDirectorate: 0, workSector: 0, workDepartment: 0, workOffice: 0,
            flag: 0,
        }
    });

    const { employeeService: fetchedService, isLoadingEmployeeService, updateEmployeeService, isSavingService } = useEmployee({ id: employeeServiceProp ? undefined : id });
    const employeeService = employeeServiceProp ?? fetchedService;

    const [successOpen, setSuccessOpen] = useState(false);
    const [failOpen, setFailOpen] = useState(false);

    useEffect(() => {
        if (employeeService) {
            reset(employeeService);
            trigger();
        }
    }, [employeeService, reset, trigger]);

    if (!employeeServiceProp && isLoadingEmployeeService) {
        return <Typography>Φόρτωση...</Typography>
    }

    const onSubmit = (data: EmployeeServiceSchema) => {
        console.log("Service form submitted with data:", data);
        if (!employeeService) return;
        if (!window.confirm(`Είστε σίγουροι ότι θέλετε να ενημερώσετε τα υπηρεσιακά στοιχεία;`)) return;
        updateEmployeeService(data as EmployeeService, {
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

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{p: 2, mt: "-25px" }}>  
                {location.pathname.startsWith('/employeeService') &&
                    <Box 
                        sx={{ display: "flex", alignItems: "center", gap: 1, mt: 4 }} >
                        <IconButton onClick={() => navigate('/employeelist')} size="large">
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography variant="h4">
                            {`Υπηρεσιακά στοιχεία υπαλλήλου ${id}`}
                        </Typography>
                    </Box>
                }
                <input type="hidden" {...register('id')} />
                <input type="hidden" {...register('am')} />
                <Paper sx={{ p: 3, mt: 4, mx: "auto" }}>
                    <Typography variant="h5">
                        Υπηρεσιακά στοιχεία
                    </Typography>
                    <Grid container spacing={3} mt={1.4}>
                        {/* ===== LEFT COLUMN ===== */}
                        <Grid item xs={12} md={6}>
                            <Controller
                                name="hireDate"
                                control={control}
                                render={({ field }) => (
                                    <DatePicker
                                        label="Ημερομηνία Ανάληψης Καθηκόντων"
                                        value={field.value ? dayjs(field.value) : null}
                                        onChange={(date) => field.onChange(date ? date.format('YYYY-MM-DD') : null)}
                                        format="DD/MM/YYYY"
                                        slotProps={{ textField: { fullWidth: true, size: "small", sx: { mb: 4, position: 'relative' }, slotProps: { formHelperText: { sx: { position: 'absolute', bottom: -20 } } } } }}
                                    />
                                )}
                            />
                            <Controller
                                name="workRelation"
                                control={control}
                                render={({ field }) => (
                                    <FormControl fullWidth size="small" sx={{ mb: 4 }}>
                                        <InputLabel>Εργασιακή Σχέση</InputLabel>
                                        <Select
                                            label="Εργασιακή Σχέση"
                                            value={field.value ?? 0}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                        >
                                            <MenuItem value={0}>Κενό</MenuItem>
                                            <MenuItem value={1}>Μόνιμος υπάλληλος δημοσίου</MenuItem>
                                            <MenuItem value={2}>ΙΔΑΧ</MenuItem>
                                            <MenuItem value={3}>ΙΔΟΧ</MenuItem>
                                            <MenuItem value={5}>ΟΑΕΔ</MenuItem>
                                            <MenuItem value={6}>Έμμισθη εντολή</MenuItem>
                                        </Select>
                                    </FormControl>
                                )}
                            />
                            <TextField
                                label="Ειδικότητα"
                                {...register('specialty')}
                                fullWidth
                                size="small"
                                sx={{ mb: 4 }}
                            />
                            <TextField
                                label="Κωδικός Μισθοδοσίας"
                                {...register('salaryCode')}
                                fullWidth
                                size="small"
                                sx={{ mb: 4 }}
                            />
                            <Controller
                                name="position"
                                control={control}
                                render={({ field }) => (
                                    <FormControl fullWidth size="small" sx={{ mb: 4 }}>
                                        <InputLabel>Θέση στην Υπηρεσία</InputLabel>
                                        <Select
                                            label="Θέση στην Υπηρεσία"
                                            value={field.value ?? 0}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                        >
                                            <MenuItem value={0}>Κενό</MenuItem>
                                            <MenuItem value={1}>Πρόεδρος ΔΣ</MenuItem>
                                            <MenuItem value={2}>Προϊστάμενος Γενικής Διεύθυνσης</MenuItem>
                                            <MenuItem value={3}>Προϊστάμενος Διεύθυνσης</MenuItem>
                                            <MenuItem value={4}>Προϊστάμενος τομέα</MenuItem>
                                            <MenuItem value={5}>Προϊστάμενος τμήματος</MenuItem>
                                            <MenuItem value={6}>Υπεύθυνος εργαστηρίου</MenuItem>
                                            <MenuItem value={7}>Υπεύθυνος</MenuItem>
                                            <MenuItem value={8}>Υπάλληλος</MenuItem>
                                        </Select>
                                    </FormControl>
                                )}
                            />
                            <TextField
                                label="Μισθολογικό Κλιμάκιο"
                                {...register('mk', { valueAsNumber: true })}
                                fullWidth
                                type="number"
                                size="small"
                                sx={{ mb: 4 }}
                            />
                            <Controller
                                name="mkDate"
                                control={control}
                                render={({ field }) => (
                                    <DatePicker
                                        label="Ημ. Τρέχοντος Μ.Κ."
                                        value={field.value ? dayjs(field.value) : null}
                                        onChange={(date) => field.onChange(date ? date.format('YYYY-MM-DD') : null)}
                                        format="DD/MM/YYYY"
                                        slotProps={{ textField: { fullWidth: true, size: "small", sx: { mb: 4, position: 'relative' }, slotProps: { formHelperText: { sx: { position: 'absolute', bottom: -20 } } } } }}
                                    />
                                )}
                            />
                            <Controller
                                name="employmentType"
                                control={control}
                                render={({ field }) => (
                                    <FormControl fullWidth size="small" sx={{ mb: 4 }}>
                                        <InputLabel>Θέση</InputLabel>
                                        <Select
                                            label="Θέση"
                                            value={field.value ?? 0}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                        >
                                            <MenuItem value={0}>Κενό</MenuItem>
                                            <MenuItem value={1}>Οργανική</MenuItem>
                                            <MenuItem value={2}>Προσωποπαγής</MenuItem>
                                            <MenuItem value={3}>Σε απόσπαση</MenuItem>
                                        </Select>
                                    </FormControl>
                                )}
                            />
                        </Grid>

                        {/* ===== RIGHT COLUMN ===== */}
                        <Grid item xs={12} md={6}>
                            <Controller
                                name="publicationDate"
                                control={control}
                                render={({ field }) => (
                                    <DatePicker
                                        label="Ημερομηνία Ορκωμοσίας"
                                        value={field.value ? dayjs(field.value) : null}
                                        onChange={(date) => field.onChange(date ? date.format('YYYY-MM-DD') : null)}
                                        format="DD/MM/YYYY"
                                        slotProps={{ textField: { fullWidth: true, size: "small", sx: { mb: 4, position: 'relative' }, slotProps: { formHelperText: { sx: { position: 'absolute', bottom: -20 } } } } }}
                                    />
                                )}
                            />
                            <TextField
                                label="Κατηγορία"
                                {...register('category')}
                                fullWidth
                                size="small"
                                sx={{ mb: 4 }}
                            />
                            <TextField
                                label="Κλάδος"
                                {...register('branch')}
                                fullWidth
                                size="small"
                                sx={{ mb: 4 }}
                            />
                            <TextField
                                label="Βαθμός"
                                {...register('rank')}
                                fullWidth
                                size="small"
                                sx={{ mb: 4 }}
                            />
                            <Controller
                                name="rankDate"
                                control={control}
                                render={({ field }) => (
                                    <DatePicker
                                        label="Ημ. Τρέχοντος Βαθμού"
                                        value={field.value ? dayjs(field.value) : null}
                                        onChange={(date) => field.onChange(date ? date.format('YYYY-MM-DD') : null)}
                                        format="DD/MM/YYYY"
                                        slotProps={{ textField: { fullWidth: true, size: "small", sx: { mb: 4, position: 'relative' }, slotProps: { formHelperText: { sx: { position: 'absolute', bottom: -20 } } } } }}
                                    />
                                )}
                            />
                            <TextField
                                label="Βαθμολογικό Κλιμάκιο"
                                {...register('salaryGrade')}
                                fullWidth
                                size="small"
                                sx={{ mb: 4 }}
                            />
                            <TextField
                                label="ΦΕΚ"
                                {...register('fek')}
                                fullWidth
                                size="small"
                                sx={{ mb: 4 }}
                            />
                            <Controller
                                name="terminationDate"
                                control={control}
                                render={({ field }) => (
                                    <DatePicker
                                        label="Ημερομηνία Διακοπής"
                                        value={field.value ? dayjs(field.value) : null}
                                        onChange={(date) => field.onChange(date ? date.format('YYYY-MM-DD') : null)}
                                        format="DD/MM/YYYY"
                                        slotProps={{ textField: { fullWidth: true, size: "small", sx: { mb: 4, position: 'relative' }, slotProps: { formHelperText: { sx: { position: 'absolute', bottom: -20 } } } } }}
                                    />
                                )}
                            />
                        </Grid>

                        {/* ===== ORGANIZATION SECTION (Οργανική Θέση) ===== */}
                        <Grid item xs={12}>
                            <Typography variant="h6" sx={{ mt: 1 }}>
                                Οργανική Θέση
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Διεύθυνση"
                                {...register('directorate', { valueAsNumber: true })}
                                fullWidth
                                type="number"
                                size="small"
                                sx={{ mb: 4 }}
                            />
                            <TextField
                                label="Τμήμα"
                                {...register('department', { valueAsNumber: true })}
                                fullWidth
                                type="number"
                                size="small"
                                sx={{ mb: 4 }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Τομέας"
                                {...register('sector', { valueAsNumber: true })}
                                fullWidth
                                type="number"
                                size="small"
                                sx={{ mb: 4 }}
                            />
                            <TextField
                                label="Γραφείο"
                                {...register('office', { valueAsNumber: true })}
                                fullWidth
                                type="number"
                                size="small"
                                sx={{ mb: 4 }}
                            />
                        </Grid>

                        {/* ===== WORK ORGANIZATION SECTION (Θέση Εργασίας) ===== */}
                        <Grid item xs={12}>
                            <Typography variant="h6" sx={{ mt: 1 }}>
                                Θέση Εργασίας
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Διεύθυνση Εργασίας"
                                {...register('workDirectorate', { valueAsNumber: true })}
                                fullWidth
                                type="number"
                                size="small"
                                sx={{ mb: 4 }}
                            />
                            <TextField
                                label="Τμήμα Εργασίας"
                                {...register('workDepartment', { valueAsNumber: true })}
                                fullWidth
                                type="number"
                                size="small"
                                sx={{ mb: 4 }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Τομέας Εργασίας"
                                {...register('workSector', { valueAsNumber: true })}
                                fullWidth
                                type="number"
                                size="small"
                                sx={{ mb: 4 }}
                            />
                            <TextField
                                label="Γραφείο Εργασίας"
                                {...register('workOffice', { valueAsNumber: true })}
                                fullWidth
                                type="number"
                                size="small"
                                sx={{ mb: 4 }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Button 
                                variant="contained" 
                                sx={{ mt: 2, textTransform: "none" }}
                                disabled={!isValid || isSavingService}
                                type="submit"
                            >
                                {isSavingService ? <CircularProgress size={24} /> : 'Καταχώρηση'}
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
                    Τα υπηρεσιακά στοιχεία ενημερώθηκαν επιτυχώς!
                </Alert>
            </Snackbar>
            <Snackbar
                open={failOpen}
                autoHideDuration={3000}
                onClose={() => setFailOpen(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={() => setFailOpen(false)} severity="error" variant="filled" sx={{ width: '100%' }}>
                    Πρόβλημα κατά την ενημέρωση των υπηρεσιακών στοιχείων. Παρακαλώ δοκιμάστε ξανά.
                </Alert>
            </Snackbar>
        </LocalizationProvider>
    );
}