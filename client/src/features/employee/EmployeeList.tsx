import { Box, Button, CircularProgress, Pagination, Paper, styled, Table, TableBody, TableCell, tableCellClasses, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useEmployee } from "../../lib/hooks/useEmployee";

const StyledTableCell = styled(TableCell)(() => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: "#eaecf0",
        color: "black",
        fontWeight: "bold",
        borderRight: "1px solid #d0d0d0",
        '&:nth-of-type(1)': {
            width: "70px",
        },
        '&:nth-of-type(2), &:nth-of-type(3), &:nth-of-type(4)': {
            width: "calc((100% - 70px) / 3)",
        },
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
        borderRight: "1px solid #e0e0e0",
        '&:nth-of-type(1)': {
            width: "50px",
        },
        '&:nth-of-type(2), &:nth-of-type(3), &:nth-of-type(4)': {
            width: "calc((100% - 70px) / 3)",
        },
    },
}));

const StyledTableRow = styled(TableRow)(() => ({
    '&:nth-of-type(odd)': {
        backgroundColor: "#f9f9f9",
    },
    '&:hover': {
        backgroundColor: "#eef1f5",
        transition: "background-color 0.2s ease",
    },
}));

export default function EmployeeList() {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const pageSize = 8;

    const { employeeGroup, isLoading, isError } = useEmployee({
        page,
        pageSize
    });

    if (isLoading) return <CircularProgress />
    if (isError) return <Typography>Error...</Typography>
    if (!employeeGroup) return <Typography>No leaves found</Typography>

    const totalPages = Math.ceil(
        employeeGroup.totalCount / pageSize
    );

    return (
        <Box sx={{ padding: "1rem"}}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", width: "100%" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography variant="h4">Διαχείριση υπαλλήλων</Typography>
                    
                </Box>
                <Button variant="contained" color="primary" onClick={() => navigate('/newemployee')}>
                    Προσθήκη
                </Button>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, backgroundColor: "white", height: "700px", marginTop: "1.4rem"}}>
                <TableContainer component={Paper} elevation={0} sx={{ paddingLeft: "1.5rem", paddingRight: "1.5rem", border: "none" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Typography variant="h5" sx={{ paddingTop: "1rem", paddingRight: "1rem", paddingBottom: "1rem" }}>
                            Λίστα υπαλλήλων
                        </Typography>
                        <Typography variant="caption" sx={{ color: "black", backgroundColor: "#d2f4ea", padding: "0.1rem 0.3rem", borderRadius: "4px", fontSize: "0.7rem" }}>
                            {employeeGroup.totalCount} υπάλληλοι
                        </Typography>
                    </Box>
                    <Table size="medium" sx={{marginTop: "3.5rem", border: "1px solid #cfcfcf", tableLayout: "fixed", width: "100%" }}>
                        <TableHead>
                            <TableRow>
                                <StyledTableCell>A.M.</StyledTableCell>
                                <StyledTableCell>Επίθετο</StyledTableCell>
                                <StyledTableCell>Όνομα</StyledTableCell>
                                <StyledTableCell>ΑΦΜ</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {employeeGroup.items.map(emp => (
                                <StyledTableRow
                                    key={emp.id}
                                    sx={{ cursor: "pointer" }}
                                    onClick={() => navigate(`/employeeTab/${emp.id}`)}
                                >
                                    <StyledTableCell>{emp.id}</StyledTableCell>
                                    <StyledTableCell>{emp.lastName}</StyledTableCell>
                                    <StyledTableCell>{emp.firstName}</StyledTableCell>
                                    <StyledTableCell>{emp.afm}</StyledTableCell>
                                </StyledTableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {employeeGroup.totalCount > pageSize && (
                        <Pagination
                            sx={{ display: "flex", padding: "1.5rem 0" }}
                            page={page}
                            count={totalPages}
                            onChange={(_, value) => setPage(value)}
                            color="primary" variant="outlined" shape="rounded" 
                        />
                )}
                </TableContainer>

                
            </Box>
        </Box>
    );
}
