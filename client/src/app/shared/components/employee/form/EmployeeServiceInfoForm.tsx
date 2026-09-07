import { Box, Divider, MenuItem, Select, Typography } from '@mui/material';
import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/Grid';
import OutlinedInput from '@mui/material/OutlinedInput';
import { styled } from '@mui/material/styles';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { employeeServiceSchema, type EmployeeServiceSchema } from '../../../../../lib/schemas/employeeServiceSchema';
import { useValues } from '../../../../../lib/hooks/useValues';

const FormGrid = styled(Grid)(() => ({
  display: 'flex',
  flexDirection: 'column',
}));


export default function EmployeeServiceInfoForm() {

    const { category, kladoi, sector, department, address, office, positions, eidikothtes, grade} = useValues();

    const { control, setValue } = useForm<EmployeeServiceSchema>({
        mode: 'onChange',
        reValidateMode: 'onChange',
        resolver: zodResolver(employeeServiceSchema),
        defaultValues: {
            id: 0, am: 0,
            hireDate: null, publicationDate: null, appointmentDate: null,
            terminationDate: null, mkDate: null, rankDate: null,
            workRelation: 0, position: 0, employmentType: 0,
            mk: 0, salaryGrade: '', salaryCode: '',
            category: '', branch: '', specialty: '', rank: '', fek: '',
            directorate: 0, sector: -1, department: -1, office: 0,
            workDirectorate: 0, workSector: -1, workDepartment: -1, workOffice: 0,
            flag: 0,
        },
    });

    const watchDirectorate = useWatch({ control, name: 'directorate' });
    const watchSector = useWatch({ control, name: 'sector' });
    const watchWorkDirectorate = useWatch({ control, name: 'workDirectorate' });
    const watchWorkSector = useWatch({ control, name: 'workSector' });
    const watchCategory = useWatch({ control, name: 'category' });

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            width: { sm: '100%', md: '100%' },
            maxWidth: '1118px',
            gap: { xs: 5, md: 'none' },
            margin: '0 auto',
            border: '1px solid lightgray',
            backgroundColor: '#ffffff',
            padding: { xs: 2, md: 4 },
            borderRadius: 1.5,
            mt: 4,
        }}>
            <Typography variant='h5'>Υπηρεσιακά</Typography>
            <Grid container spacing={3}>
                <FormGrid size={{ xs: 15, md: 6 }}>
                <FormLabel htmlFor="first-name" required>
                    Ημ/νία ανάλυψης καθηκόντων
                </FormLabel>
                <OutlinedInput
                    id="first-name"
                    name="first-name"
                    type="date"
                    required
                    size="small"
                />
                </FormGrid>
                <FormGrid size={{ xs: 15, md: 6 }}>
                <FormLabel htmlFor="last-name" required>
                    Ημ/νία ορκωμοσίας
                </FormLabel>
                <OutlinedInput
                    id="last-name"
                    name="last-name"
                    type="date"
                    required
                    size="small"
                />
                </FormGrid>
                <FormGrid size={{ xs: 15, md: 6 }}>
                    <FormLabel>Εργασιακή σχέση</FormLabel>
                    <Select
                        input={<OutlinedInput size="small" />}
                        inputProps={{ style: { WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none' } }}
                    >
                        <MenuItem value={0}>Κενό</MenuItem>
                        <MenuItem value={1}>Μόνιμος Υπάλληλος Δημοσίου</MenuItem>
                        <MenuItem value={2}>ΙΔΑΧ</MenuItem>
                        <MenuItem value={3}>ΙΔΟΧ</MenuItem>
                        <MenuItem value={4}>Σύμβαση Μίσθωσης Έργου</MenuItem>
                        <MenuItem value={5}>Επί Θητεία</MenuItem>
                    </Select>
                </FormGrid>
                <FormGrid size={{ xs: 15, md: 6 }}>
                <FormLabel htmlFor="address2">Θέση στην υπηρεσία</FormLabel>
                <Select
                    input={<OutlinedInput size="small" />}
                    inputProps={{ style: { WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none' } }}
                    defaultValue=""
                >
                    <MenuItem value="">Κενό</MenuItem>
                    {positions.map(k => (
                        <MenuItem key={k.id} value={k.id}>{k.description}</MenuItem>
                    ))}
                </Select>
                </FormGrid>
                <FormGrid size={{ xs: 15, md: 6 }}>
                <FormLabel htmlFor="city" required>Κωδικός μισθολογίου</FormLabel>
                <Controller name="salaryCode" control={control} render={({ field }) => (
                <Select {...field} input={<OutlinedInput size="small" />} inputProps={{ style: { WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none' } }}>
                    <MenuItem value="">Κενό</MenuItem>
                    {category.map(k => (
                        <MenuItem key={k.id} value={k.code}>{k.description}</MenuItem>
                    ))}
                </Select>
                )} />
                </FormGrid>
                <FormGrid size={{ xs: 15, md: 6 }}>
                    <FormLabel>Κατηγορία</FormLabel>
                    <Controller name="category" control={control} render={({ field }) => (
                        <Select {...field} onChange={e => { field.onChange(e); setValue('branch', ''); }} input={<OutlinedInput size="small" />} inputProps={{ style: { WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none' } }}>
                        <MenuItem value="">Κενό</MenuItem>
                        <MenuItem value="pe">ΠΕ</MenuItem>
                        <MenuItem value="pe6">ΠΕ6</MenuItem>
                        <MenuItem value="te">ΤΕ</MenuItem>
                        <MenuItem value="de">ΔΕ</MenuItem>
                        <MenuItem value="ye0">ΥΕ</MenuItem>
                        </Select>
                    )} />
                </FormGrid>
                <FormGrid size={{ xs: 15, md: 6 }}>
                <FormLabel>Κλάδος</FormLabel>
                <Controller name="branch" control={control} render={({ field }) => (
                <Select {...field} input={<OutlinedInput size="small" />} inputProps={{ style: { WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none' } }} disabled={!watchCategory}>
                    <MenuItem value="">Κενό</MenuItem>
                    {kladoi
                        .filter(k => k.code.startsWith(watchCategory === 'ye0' ? 'ye' : watchCategory))
                        .map(k => (
                            <MenuItem key={k.id} value={k.code}>{k.description}</MenuItem>
                        ))}
                </Select>
                )} />
                </FormGrid>
                <FormGrid size={{ xs: 15, md: 6 }}>
                <FormLabel htmlFor="country" required>Ειδικότητα</FormLabel>
                <Controller name="specialty" control={control} render={({ field }) => (
                <Select {...field} input={<OutlinedInput size="small" />} inputProps={{ style: { WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none' } }}>
                    <MenuItem value="">Κενό</MenuItem>
                    {eidikothtes.map(k => (
                        <MenuItem key={k.id} value={k.code}>{k.description}</MenuItem>
                    ))}
                </Select>
                )} />
                </FormGrid>
                <FormGrid size={{ xs: 15, md: 6 }}>
                <FormLabel htmlFor="country" required>Μισθολογικό Κλιμάκιο</FormLabel>
                <Controller name="mk" control={control} render={({ field }) => (
                    <OutlinedInput
                    {...field}
                    type="number"
                    inputProps={{ min: 0, max: 20, step: 1 }}
                    onChange={e => field.onChange(Number(e.target.value))}
                    />
                )} />
                </FormGrid>
                <FormGrid size={{ xs: 15, md: 6 }}>
                <FormLabel htmlFor="country" required>Ημ/νια αλλαγής Μ.Κ</FormLabel>
                <OutlinedInput
                    id="last-name"
                    name="last-name"
                    type="date"
                    required
                    size="small"
                />
                </FormGrid>
                <FormGrid size={{ xs: 15, md: 6 }}>
                <FormLabel htmlFor="country" required>Βαθμός</FormLabel>
                <Controller name="specialty" control={control} render={({ field }) => (
                <Select {...field} input={<OutlinedInput size="small" />} inputProps={{ style: { WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none' } }}>
                    <MenuItem value="">Κενό</MenuItem>
                    {grade.map(k => (
                        <MenuItem key={k.id} value={k.code}>{k.description}</MenuItem>
                    ))}
                </Select>
                )} />
                </FormGrid>
                <FormGrid size={{ xs: 15, md: 6 }}>
                <FormLabel htmlFor="country" required>Ημ/νια αλλαγής βαθμού</FormLabel>
                <OutlinedInput
                    id="last-name"
                    name="last-name"
                    type="date"
                    required
                    size="small"
                />
                </FormGrid>
                <Divider sx={{ width: '100%', my: 2 }} />
                <Typography variant='h6' sx={{ pr: 100 }}>Ανήκει</Typography>
                <FormGrid size={{ xs: 15, md: 6 }}>
                <FormLabel htmlFor="sex" required>Διεύθυνση</FormLabel>
                <Controller name="directorate" control={control} render={({ field }) => (
                <Select {...field} onChange={e => { field.onChange(e); setValue('sector', -1); setValue('department', -1); }} input={<OutlinedInput size="small" />} inputProps={{ style: { WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none' } }}>
                    <MenuItem value={0}>Κενό</MenuItem>
                    {address.map(k => (
                        <MenuItem key={k.id} value={k.id}>{k.address_str}</MenuItem>
                    ))}
                </Select>
                )} />
                </FormGrid>
                <FormGrid size={{ xs: 15, md: 6 }}>
                <FormLabel htmlFor="country" required>Τομέας</FormLabel>
                <Controller name="sector" control={control} render={({ field }) => (
                <Select {...field} onChange={e => { field.onChange(e); setValue('department', -1); }} input={<OutlinedInput size="small" />} inputProps={{ style: { WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none' } }} disabled={!watchDirectorate}>
                    <MenuItem value={-1}>Κενό</MenuItem>
                    {sector.filter(s => s.addressId === watchDirectorate).map(k => (
                        <MenuItem key={k.id} value={k.sectorId}>{k.sectorName}</MenuItem>
                    ))}
                </Select>
                )} />
                </FormGrid><FormGrid size={{ xs: 15, md: 6 }}>
                <FormLabel htmlFor="country" required>Τμήμα</FormLabel>
                <Controller name="department" control={control} render={({ field }) => (
                <Select {...field} input={<OutlinedInput size="small" />} inputProps={{ style: { WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none' } }} disabled={watchSector === -1}>
                    <MenuItem value={-1}>Κενό</MenuItem>
                    {department.filter(d => d.sectorId === watchSector && d.addressId === watchDirectorate).map(k => (
                        <MenuItem key={k.departmentId} value={k.departmentId}>{k.departmentName}</MenuItem>
                    ))}
                </Select>
                )} />
                </FormGrid>
                <FormGrid size={{ xs: 15, md: 6 }}>
                <FormLabel htmlFor="country" required>Γραφείο</FormLabel>
                <Select
                    input={<OutlinedInput size="small" />}
                    inputProps={{ style: { WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none' } }}
                    defaultValue=""
                >
                    <MenuItem value="">Κενό</MenuItem>
                    {office.map(k => (
                        <MenuItem key={k.id} value={k.id}>{k.officeName}</MenuItem>
                    ))}
                </Select>
                </FormGrid>
                <Divider sx={{ width: '100%', my: 2 }} />
                <Typography variant='h6' sx={{ pr: 100 }}>Εργάζεται</Typography>
                <FormGrid size={{ xs: 15, md: 6 }}>
                <FormLabel htmlFor="sex" required>Διεύθυνση</FormLabel>
                <Controller name="workDirectorate" control={control} render={({ field }) => (
                <Select {...field} onChange={e => { field.onChange(e); setValue('workSector', -1); setValue('workDepartment', -1); }} input={<OutlinedInput size="small" />} inputProps={{ style: { WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none' } }}>
                    <MenuItem value={0}>Κενό</MenuItem>
                    {address.map(k => (
                        <MenuItem key={k.id} value={k.id}>{k.address_str}</MenuItem>
                    ))}
                </Select>
                )} />
                </FormGrid>
                <FormGrid size={{ xs: 15, md: 6 }}>
                <FormLabel htmlFor="country" required>Τομέας</FormLabel>
                <Controller name="workSector" control={control} render={({ field }) => (
                <Select {...field} onChange={e => { field.onChange(e); setValue('workDepartment', -1); }} input={<OutlinedInput size="small" />} inputProps={{ style: { WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none' } }} disabled={!watchWorkDirectorate}>
                    <MenuItem value={-1}>Κενό</MenuItem>
                    {sector.filter(s => s.addressId === watchWorkDirectorate).map(k => (
                        <MenuItem key={k.sectorId} value={k.sectorId}>{k.sectorName}</MenuItem>
                    ))}
                </Select>
                )} />
                </FormGrid><FormGrid size={{ xs: 15, md: 6 }}>
                <FormLabel htmlFor="country" required>Τμήμα</FormLabel>
                <Controller name="workDepartment" control={control} render={({ field }) => (
                <Select {...field} input={<OutlinedInput size="small" />} inputProps={{ style: { WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none' } }} disabled={watchWorkSector === -1}>
                    <MenuItem value={-1}>Κενό</MenuItem>
                    {department.filter(d => d.sectorId === watchWorkSector && d.addressId === watchWorkDirectorate).map(k => (
                        <MenuItem key={k.departmentId} value={k.departmentId}>{k.departmentName}</MenuItem>
                    ))}
                </Select>
                )} />
                </FormGrid>
                <FormGrid size={{ xs: 15, md: 6 }}>
                <FormLabel htmlFor="country" required>Γραφείο</FormLabel>
                <Select
                    input={<OutlinedInput size="small" />}
                    inputProps={{ style: { WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none' } }}
                    defaultValue=""
                >
                    <MenuItem value="">Κενό</MenuItem>
                    {office.map(k => (
                        <MenuItem key={k.id} value={k.id}>{k.officeName}</MenuItem>
                    ))}
                </Select>
                </FormGrid>
            </Grid>
        </Box>
    );
}
