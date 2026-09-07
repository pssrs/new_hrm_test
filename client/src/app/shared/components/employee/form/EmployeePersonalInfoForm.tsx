import { Box, Divider, MenuItem, Select, Typography } from '@mui/material';
import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/Grid';
import OutlinedInput from '@mui/material/OutlinedInput';
import { styled } from '@mui/material/styles';

const FormGrid = styled(Grid)(() => ({
  display: 'flex',
  flexDirection: 'column',
}));

export default function EmployeePersonalInfoForm() {
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
      <Typography variant='h5'>Προσωπικά</Typography>
      <Grid container spacing={3}>
        <FormGrid size={{ xs: 15, md: 6 }}>
          <FormLabel htmlFor="first-name" required>
            Αριθμός Μητρώου
          </FormLabel>
          <OutlinedInput
            id="first-name"
            name="first-name"
            type="name"
            required
            size="small"
          />
        </FormGrid>
        <FormGrid size={{ xs: 15, md: 6 }}>
          <FormLabel htmlFor="last-name" required>
            Όνομα
          </FormLabel>
          <OutlinedInput
            id="last-name"
            name="last-name"
            type="last-name"
            required
            size="small"
          />
        </FormGrid>
        <FormGrid size={{ xs: 15, md: 6 }}>
          <FormLabel htmlFor="address1" required>Επώνυμο</FormLabel>
          <OutlinedInput
            id="address1"
            name="address1"
            type="address1"
            required
            size="small"
          />
        </FormGrid>
        <FormGrid size={{ xs: 15, md: 6 }}>
          <FormLabel htmlFor="address2">Όνομα μητέρας</FormLabel>
          <OutlinedInput
            id="address2"
            name="address2"
            type="address2"
            required
            size="small"
          />
        </FormGrid>
        <FormGrid size={{ xs: 15, md: 6 }}>
          <FormLabel htmlFor="city" required>Όνομα πατέρα</FormLabel>
          <OutlinedInput
            id="city"
            name="city"
            type="city"
            required
            size="small"
          />
        </FormGrid>
        <FormGrid size={{ xs: 15, md: 6 }}>
          <FormLabel htmlFor="state" required>Όνομα συζήγου</FormLabel>
          <OutlinedInput
            id="state"
            name="state"
            type="state"
            required
            size="small"
          />
        </FormGrid>
        <FormGrid size={{ xs: 15, md: 6 }}>
          <FormLabel>Ημερομηνία Γέννησης</FormLabel>
          <OutlinedInput type="date"/>
        </FormGrid>
        <FormGrid size={{ xs: 15, md: 6 }}>
          <FormLabel htmlFor="country" required>Τόπος Γέννησης</FormLabel>
          <OutlinedInput
            id="country"
            name="country"
            type="country"
            required
            size="small"
          />
        </FormGrid>
        <FormGrid size={{ xs: 15, md: 6 }}>
          <FormLabel htmlFor="country" required>Διεύθυνση</FormLabel>
          <OutlinedInput
            id="country"
            name="country"
            type="country"
            required
            size="small"
          />
        </FormGrid>
        <FormGrid size={{ xs: 15, md: 6 }}>
          <FormLabel htmlFor="country" required>Περιοχή</FormLabel>
          <OutlinedInput
            id="country"
            name="country"
            type="country"
            required
            size="small"
          />
        </FormGrid><FormGrid size={{ xs: 15, md: 6 }}>
          <FormLabel htmlFor="country" required>Πόλη</FormLabel>
          <OutlinedInput
            id="country"
            name="country"
            type="country"
            required
            size="small"
          />
        </FormGrid>
        <FormGrid size={{ xs: 15, md: 6 }}>
          <FormLabel htmlFor="country" required>Ταχυδρομικός Κώδικας</FormLabel>
          <OutlinedInput
            id="country"
            name="country"
            type="country"
            required
            size="small"
          />
        </FormGrid>
        <FormGrid size={{ xs: 15, md: 6 }}>
          <FormLabel htmlFor="sex" required>Φύλο</FormLabel>
          <Select
            id="sex"
            input={<OutlinedInput size="small" />}
            inputProps={{ style: { WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none' } }}
          >
            <MenuItem value="0">Κενό</MenuItem>
            <MenuItem value="1">Άνδρας</MenuItem>
            <MenuItem value="2">Γυναίκα</MenuItem>
          </Select>
        </FormGrid>
        <FormGrid size={{ xs: 15, md: 6 }}>
          <FormLabel htmlFor="familyStatus" required>Οικογενειακή Κατάσταση</FormLabel>
          <Select
            id="familyStatus"
            input={<OutlinedInput size="small" />}
            inputProps={{ style: { WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none' } }}
          >
            <MenuItem value="">Κενό</MenuItem>
            <MenuItem value="1">Έγγαμος</MenuItem>
            <MenuItem value="2">Άγαμος</MenuItem>
            <MenuItem value="3">Διαζευμένος</MenuItem>
            <MenuItem value="4">Εν χηρεία</MenuItem>
          </Select>
        </FormGrid>
        <FormGrid size={{ xs: 15, md: 6 }}>
          <FormLabel htmlFor="country" required>Υπηκοότητα</FormLabel>
          <OutlinedInput
            id="country"
            name="country"
            type="country"
            required
            size="small"
          />
        </FormGrid>
        <FormGrid size={{ xs: 15, md: 6 }}>
          <FormLabel htmlFor="country" required>Εθνικότητα</FormLabel>
          <OutlinedInput
            id="country"
            name="country"
            type="country"
            required
            size="small"
          />
        </FormGrid>
        <FormGrid size={{ xs: 15, md: 6 }}>
          <FormLabel htmlFor="country" required>Email</FormLabel>
          <OutlinedInput
            id="country"
            name="country"
            type="country"            
            required
            size="small"
          />
        </FormGrid>
        <FormGrid size={{ xs: 15, md: 6 }}>
          <FormLabel htmlFor="country" required>Τηλέφωνο Επικοινωνίας</FormLabel>
          <OutlinedInput
            id="country"
            name="country"
            type="country"
            required
            size="small"
          />
        </FormGrid>
        <FormGrid size={{ xs: 15, md: 6 }}>
          <FormLabel htmlFor="country" required>Ταυτότητα</FormLabel>
          <OutlinedInput
            id="country"
            name="country"
            type="country"
            required
            size="small"
          />
        </FormGrid>
        <FormGrid size={{ xs: 15, md: 6 }}>
          <FormLabel htmlFor="country" required>Ημερομηνία έκδοσης ταυτότητας</FormLabel>
          <OutlinedInput type="date"/>
        </FormGrid>
        <FormGrid size={{ xs: 15, md: 6 }}>
          <FormLabel htmlFor="country" required>ΑΦΜ</FormLabel>
          <OutlinedInput
            id="country"
            name="country"
            type="country"
            required
            size="small"
          />
        </FormGrid>
        <FormGrid size={{ xs: 15, md: 6 }}>
          <FormLabel htmlFor="country" required>ΑΜΚΑ</FormLabel>
          <OutlinedInput
            id="country"
            name="country"
            type="country"
            required
            size="small"
          />
        </FormGrid>
        <FormGrid size={{ xs: 15, md: 6 }}>
          <FormLabel htmlFor="country" required>ΑΜΑ</FormLabel>
          <OutlinedInput
            id="country"
            name="country"
            type="country"
            required
            size="small"
          />
        </FormGrid>
        <FormGrid size={{ xs: 15, md: 6 }}>
          <FormLabel htmlFor="country" required>Προσωπικός Αριθμός</FormLabel>
          <OutlinedInput
            id="country"
            name="country"
            type="country"
            required
            size="small"
          />
        </FormGrid>
        <FormGrid size={{ xs: 15, md: 6 }}>
          <FormLabel htmlFor="country" required>ΔΟΥ</FormLabel>
          <OutlinedInput
            id="country"
            name="country"
            type="country"
            required
            size="small"
          />
        </FormGrid>
        <FormGrid size={{ xs: 15, md: 6 }}>
          <FormLabel htmlFor="employmentState" required>Εργασιακή κατάσταση</FormLabel>
          <Select
            id="employmentState"
            input={<OutlinedInput size="small" />}
            inputProps={{ style: { WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none' } }}
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
        </FormGrid>
        <Divider sx={{ width: '100%', my: 2 }} />
        <Typography variant='h5'>Τραπεζικοί Λογαριασμοί</Typography>
        <FormGrid size={{ xs: 15, md: 6 }}>
        </FormGrid>
        <FormGrid size={{ xs: 15, md: 6 }}>
          <FormLabel htmlFor="country" required>IBAN 1</FormLabel>
          <OutlinedInput
            id="country"
            name="country"
            type="country"
            required
            size="small"
          />
        </FormGrid>
        <FormGrid size={{ xs: 15, md: 6 }}>
          <FormLabel htmlFor="country" required>IBAN 2</FormLabel>
          <OutlinedInput
            id="country"
            name="country"
            type="country"
            required
            size="small"
          />
        </FormGrid>
      </Grid>
    </Box>
  );
}
