using System;
using System.Collections.Generic;
using System.Data.Odbc;
using System.Linq;
using System.Threading.Tasks;
using Application.Employees.DTOs;
using Application.Employees.DTOs.Personal;
using Application.Employees.DTOs.Services;
using Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Application.Core
{
    public class SybaseService : ISybaseService
    {
        private readonly string _connectionString;
        private readonly ILogger<SybaseService> _logger;
        private readonly AppDbContext _context;

        private const string Office = "PSS";
        private const string PcDescr = "ΙΣΙΔΩΡΟΣ-WEB";
        private const int UserId = 5;

        public SybaseService(IConfiguration configuration, ILogger<SybaseService> logger, AppDbContext context)
        {
            _connectionString = configuration.GetConnectionString("payroll_db")
                ?? throw new InvalidOperationException("Λείπει το connection string 'payroll_db'.");
            _logger = logger;
            _context = context;
        }

        private static object ToDbValue(object? value) => value ?? DBNull.Value;

        public async Task<bool> ExistsAsync(int am, string afm)
        {
            const string sql = @"
                SELECT count(*) 
                    FROM employee
                WHERE em_register_number = ? 
                AND em_tax_register = ?";

            await using var connection = new OdbcConnection(_connectionString);
            await connection.OpenAsync();

            await using var command = new OdbcCommand(sql, connection);
            command.Parameters.Add(new OdbcParameter("@am", am.ToString()));
            command.Parameters.Add(new OdbcParameter("@afm", afm));

            var count = Convert.ToInt32(await command.ExecuteScalarAsync());
            return count > 0;
        }

        private string GetHospitalCode()
        {
            var hospital = _context.Parameters.FirstOrDefault(e => e.Name == "hospital");
            if (hospital == null || hospital.Value1 == null)
            {
                _logger.LogError("Η παράμετρος 'hospital' δεν βρέθηκε στη βάση δεδομένων.");
                return "";
            }
            return hospital.Value1;
        }

        //PERSONAL
        public async Task<Result<string>> UpdateEmployeePersonalAsync(string afm, int am, EmployeePersonal empPersonalCurrent, EmployeePersonal empPersonalNew)
        {
            try
            {
                await using var connection = new OdbcConnection(_connectionString);
                await connection.OpenAsync();

                await UpdateWhitelistAsync(connection);

                var changedColumns = new List<string>();
                var changedValues = new List<object>();

                if (empPersonalCurrent.BirthDate != empPersonalNew.BirthDate)
                {
                    changedColumns.Add("em_birthday = ?");
                    changedValues.Add(ToDbValue(empPersonalNew.BirthDate.ToString("yyyy/MM/dd")));
                }

                if (empPersonalCurrent.FamilyStatus != empPersonalNew.FamilyStatus)
                {
                    changedColumns.Add("em_family_status = ?");
                    changedValues.Add(ToDbValue(empPersonalNew.FamilyStatus));
                }

                if (empPersonalCurrent.FatherName != empPersonalNew.FatherName)
                {
                    changedColumns.Add("em_name_father = ?");
                    changedValues.Add(ToDbValue(empPersonalNew.FatherName));
                }

                if (empPersonalCurrent.MotherName != empPersonalNew.MotherName)
                {
                    changedColumns.Add("em_name_mother = ?");
                    changedValues.Add(ToDbValue(empPersonalNew.MotherName));
                }

                if (changedColumns.Count == 0) return Result<string>.Success("Δεν υπήρξε αλλαγή στα προσωπικά στοιχεία");

                var table = "employee_net";
                var existsInEmployeeNet = await ExistsInEmployeeNetAsync(connection, am.ToString(), GetHospitalCode());
                var existsInEmployee = await ExistsInEmployeeAsync(connection, am.ToString(), GetHospitalCode());
                if (!existsInEmployeeNet) await CopyFromEmployeeToEmployeeNetAsync(connection, am.ToString(), afm);
                if (existsInEmployee) table = "employee";

                var updateSql = $@"
                    UPDATE {table} SET
                        {string.Join(", ", changedColumns)}
                    WHERE em_register_number = ?
                    AND em_hospital_code = ?";

                await using var updateCommand = new OdbcCommand(updateSql, connection);
                foreach (var value in changedValues)
                    updateCommand.Parameters.Add(new OdbcParameter("@value", value));
                updateCommand.Parameters.Add(new OdbcParameter("@am", am));
                updateCommand.Parameters.Add(new OdbcParameter("@hospital", GetHospitalCode()));

                var rows = await updateCommand.ExecuteNonQueryAsync();
                _logger.LogInformation("Ενημερώθηκαν τα πεδία [{Fields}] στον {Table} (AM={Am}, {Rows} γραμμές)", string.Join(", ", changedColumns), table, am, rows);

                return Result<string>.Success($"Ενημερώθηκαν τα προσωπικά στοιχεία στον {table} (AM={am})");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Αποτυχία ενημέρωσης προσωπικών στοιχείων στη Sybase (AM={Am}): {Message}", am, ex.Message);
                return Result<string>.Failure($"Αποτυχία ενημέρωσης προσωπικών στοιχείων στη μισθοδοσία για τον υπάλληλο {am}: {ex.Message}", 502);
            }
        }

        public async Task<Result<string>> UpdateEmployeeInfoAsync(string afm, int am, EmployeeInfo empInfoCurrent, EmployeeInfo empInfoNew)
        {
            try
            {
                await using var connection = new OdbcConnection(_connectionString);
                await connection.OpenAsync();

                await UpdateWhitelistAsync(connection);

                var changedColumns = new List<string>();
                var changedValues = new List<object>();

                if (empInfoCurrent.Address != empInfoNew.Address)
                {
                    changedColumns.Add("em_address = ?");
                    changedValues.Add(ToDbValue(empInfoNew.Address));
                }

                if (empInfoCurrent.PostCode != empInfoNew.PostCode)
                {
                    changedColumns.Add("em_postcode = ?");
                    changedValues.Add(ToDbValue(empInfoNew.PostCode));
                }

                if (empInfoCurrent.City != empInfoNew.City)
                {
                    changedColumns.Add("em_city = ?");
                    changedValues.Add(ToDbValue(empInfoNew.City));
                }

                if (empInfoCurrent.Phone != empInfoNew.Phone)
                {
                    changedColumns.Add("em_phone1 = ?");
                    changedValues.Add(ToDbValue(empInfoNew.Phone));
                }

                if (empInfoCurrent.Email != empInfoNew.Email)
                {
                    changedColumns.Add("em_email = ?");
                    changedValues.Add(ToDbValue(empInfoNew.Email));
                }

                if (changedColumns.Count == 0) return Result<string>.Success("Δεν υπήρξε αλλαγή στα στοιχεία επικοινωνίας");

                var table = "employee_net";
                var existsInEmployeeNet = await ExistsInEmployeeNetAsync(connection, am.ToString(), GetHospitalCode());
                var existsInEmployee = await ExistsInEmployeeAsync(connection, am.ToString(), GetHospitalCode());
                if (!existsInEmployeeNet) await CopyFromEmployeeToEmployeeNetAsync(connection, am.ToString(), afm);
                if (existsInEmployee) table = "employee";

                var updateSql = $@"
                    UPDATE {table} SET
                        {string.Join(", ", changedColumns)}
                    WHERE em_register_number = ?
                    AND em_hospital_code = ?";

                await using var updateCommand = new OdbcCommand(updateSql, connection);
                foreach (var value in changedValues)
                    updateCommand.Parameters.Add(new OdbcParameter("@value", value));
                updateCommand.Parameters.Add(new OdbcParameter("@am", am));
                updateCommand.Parameters.Add(new OdbcParameter("@hospital", GetHospitalCode()));

                var rows = await updateCommand.ExecuteNonQueryAsync();
                _logger.LogInformation("Ενημερώθηκαν τα πεδία [{Fields}] στον {Table} (AM={Am}, {Rows} γραμμές)", string.Join(", ", changedColumns), table, am, rows);

                return Result<string>.Success($"Ενημερώθηκαν τα στοιχεία επικοινωνίας στον {table} (AM={am})");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Αποτυχία ενημέρωσης στοιχείων επικοινωνίας στη Sybase (AM={Am}): {Message}", am, ex.Message);
                return Result<string>.Failure($"Αποτυχία ενημέρωσης στοιχείων επικοινωνίας στη μισθοδοσία για τον υπάλληλο {am}: {ex.Message}", 502);
            }
        }
        
        public async Task<Result<string>> UpdateEmployeeIdentityAsync(string afm, int am, EmployeeIdentity empIdentityCurrent, EmployeeIdentity empIdentityNew)
        {
            try
            {
                await using var connection = new OdbcConnection(_connectionString);
                await connection.OpenAsync();

                await UpdateWhitelistAsync(connection);

                var changedColumns = new List<string>();
                var changedValues = new List<object>();

                if (empIdentityCurrent.IdentityCardNumber != empIdentityNew.IdentityCardNumber)
                {
                    changedColumns.Add("em_police_id = ?");
                    changedValues.Add(ToDbValue(empIdentityNew.IdentityCardNumber));
                }

                if (changedColumns.Count == 0) return Result<string>.Success("Δεν υπήρξε αλλαγή στα στοιχεία ταυτότητας");

                var table = "employee_net";
                var existsInEmployeeNet = await ExistsInEmployeeNetAsync(connection, am.ToString(), GetHospitalCode());
                var existsInEmployee = await ExistsInEmployeeAsync(connection, am.ToString(), GetHospitalCode());
                if (!existsInEmployeeNet) await CopyFromEmployeeToEmployeeNetAsync(connection, am.ToString(), afm);
                if (existsInEmployee) table = "employee";

                var updateSql = $@"
                    UPDATE {table} SET
                        {string.Join(", ", changedColumns)}
                    WHERE em_register_number = ?
                    AND em_hospital_code = ?";

                await using var updateCommand = new OdbcCommand(updateSql, connection);
                foreach (var value in changedValues)
                    updateCommand.Parameters.Add(new OdbcParameter("@value", value));
                updateCommand.Parameters.Add(new OdbcParameter("@am", am));
                updateCommand.Parameters.Add(new OdbcParameter("@hospital", GetHospitalCode()));

                var rows = await updateCommand.ExecuteNonQueryAsync();
                _logger.LogInformation("Ενημερώθηκαν τα πεδία [{Fields}] στον {Table} (AM={Am}, {Rows} γραμμές)", string.Join(", ", changedColumns), table, am, rows);

                return Result<string>.Success($"Ενημερώθηκαν τα στοιχεία ταυτότητας στον {table} (AM={am})");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Αποτυχία ενημέρωσης στοιχείων ταυτότητας στη Sybase (AM={Am}): {Message}", am, ex.Message);
                return Result<string>.Failure($"Αποτυχία ενημέρωσης στοιχείων ταυτότητας στη μισθοδοσία για τον υπάλληλο {am}: {ex.Message}", 502);
            }
        }

        public async Task<Result<string>> UpdateEmployeeNumberAsync(string afm, int am, EmployeeNumber empNumberCurrent, EmployeeNumber empNumberNew)
        {
            try
            {
                await using var connection = new OdbcConnection(_connectionString);
                await connection.OpenAsync();

                await UpdateWhitelistAsync(connection);

                var changedColumns = new List<string>();
                var changedValues = new List<object>();

                if (empNumberCurrent.Afm != empNumberNew.Afm)
                {
                    changedColumns.Add("em_tax_register = ?");
                    changedValues.Add(ToDbValue(empNumberNew.Afm));
                }

                if (empNumberCurrent.Amka != empNumberNew.Amka)
                {
                    changedColumns.Add("em_amka = ?");
                    changedValues.Add(ToDbValue(empNumberNew.Amka));
                }

                if (empNumberCurrent.Ama != empNumberNew.Ama)
                {
                    changedColumns.Add("em_number_book_ika = ?");
                    changedValues.Add(ToDbValue(empNumberNew.Ama));
                }

                if (empNumberCurrent.Doy != empNumberNew.Doy)
                {
                    changedColumns.Add("em_doy_code = ?");
                    changedValues.Add(empNumberNew.Doy);
                }

                if (changedColumns.Count == 0) return Result<string>.Success("Δεν υπήρξε αλλαγή στον αριθμό μητρώου");

                var table = "employee_net";
                var existsInEmployeeNet = await ExistsInEmployeeNetAsync(connection, am.ToString(), GetHospitalCode());
                var existsInEmployee = await ExistsInEmployeeAsync(connection, am.ToString(), GetHospitalCode());
                if (!existsInEmployeeNet) await CopyFromEmployeeToEmployeeNetAsync(connection, am.ToString(), afm);
                if (existsInEmployee) table = "employee";

                Console.WriteLine("\n\n\n\n\n\nTable: " + table + "\n\n\n\n\n\n");

                var updateSql = $@"
                    UPDATE {table} SET
                        {string.Join(", ", changedColumns)}
                    WHERE em_register_number = ?
                    AND em_hospital_code = ?";

                await using var updateCommand = new OdbcCommand(updateSql, connection);
                foreach (var value in changedValues)
                    updateCommand.Parameters.Add(new OdbcParameter("@value", value));
                updateCommand.Parameters.Add(new OdbcParameter("@am", am));
                updateCommand.Parameters.Add(new OdbcParameter("@hospital", GetHospitalCode()));

                var rows = await updateCommand.ExecuteNonQueryAsync();
                _logger.LogInformation("Ενημερώθηκαν τα πεδία [{Fields}] στον {Table} (AM={Am}, {Rows} γραμμές)", string.Join(", ", changedColumns), table, am, rows);

                return Result<string>.Success($"Ενημερώθηκε ο αριθμός μητρώου στον {table} (AM={am})");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Αποτυχία ενημέρωσης αριθμού μητρώου στη Sybase (AM={Am}): {Message}", am, ex.Message);
                return Result<string>.Failure($"Αποτυχία ενημέρωσης αριθμού μητρώου στη μισθοδοσία για τον υπάλληλο {am}: {ex.Message}", 502);
            }
        }

        public async Task<Result<string>> UpdateEmployeeBankAsync(string afm, int am, EmployeeBank empBankCurrent, EmployeeBank empBankNew)
        {
            try
            {
                await using var connection = new OdbcConnection(_connectionString);
                await connection.OpenAsync();

                await UpdateWhitelistAsync(connection);

                var changedColumns = new List<string>();
                var changedValues = new List<object>();

                if (empBankCurrent.Iban1 != empBankNew.Iban1)
                {
                    changedColumns.Add("em_iban_01 = ?");
                    changedValues.Add(ToDbValue(empBankNew.Iban1));
                }

                if (empBankCurrent.Iban2 != empBankNew.Iban2)
                {
                    changedColumns.Add("em_iban_02 = ?");
                    changedValues.Add(ToDbValue(empBankNew.Iban2));
                }

                if (changedColumns.Count == 0) return Result<string>.Success("Δεν υπήρξε αλλαγή στα τραπεζικά στοιχεία");

                var table = "employee_net";
                var existsInEmployeeNet = await ExistsInEmployeeNetAsync(connection, am.ToString(), GetHospitalCode());
                var existsInEmployee = await ExistsInEmployeeAsync(connection, am.ToString(), GetHospitalCode());
                if (!existsInEmployeeNet) await CopyFromEmployeeToEmployeeNetAsync(connection, am.ToString(), afm);
                if (existsInEmployee) table = "employee";

                var updateSql = $@"
                    UPDATE {table} SET
                        {string.Join(", ", changedColumns)}
                    WHERE em_register_number = ?
                    AND em_hospital_code = ?";

                await using var updateCommand = new OdbcCommand(updateSql, connection);
                foreach (var value in changedValues)
                    updateCommand.Parameters.Add(new OdbcParameter("@value", value));
                updateCommand.Parameters.Add(new OdbcParameter("@am", am));
                updateCommand.Parameters.Add(new OdbcParameter("@hospital", GetHospitalCode()));

                var rows = await updateCommand.ExecuteNonQueryAsync();
                _logger.LogInformation("\n\n\n\nΕνημερώθηκαν τα πεδία [{Fields}] στον {Table} (AM={Am}, {Rows} γραμμές)\n\n\n\n\n", string.Join(", ", changedColumns), table, am, rows);

                return Result<string>.Success($"Ενημερώθηκαν τα τραπεζικά στοιχεία στον {table} (AM={am})");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Αποτυχία ενημέρωσης τραπεζικών στοιχείων στη Sybase (AM={Am}): {Message}", am, ex.Message);
                return Result<string>.Failure($"Αποτυχία ενημέρωσης τραπεζικών στοιχείων στη μισθοδοσία για τον υπάλληλο {am}: {ex.Message}", 502);
            }
        }

        // SERVICES
        public async Task<Result<string>> UpdateEmployeePositionAsync(string afm, int am, EmployeePosition empPositionCurrent, EmployeePosition empPositionNew)
        {
            try
            {
                await using var connection = new OdbcConnection(_connectionString);
                await connection.OpenAsync();
                await UpdateWhitelistAsync(connection);

                var changedColumns = new List<string>();
                var changedValues = new List<object>();

                if (empPositionCurrent.Category != empPositionNew.Category)
                {
                    changedColumns.Add("em_klados_ipaliloy = ?");
                    changedValues.Add(ToDbValue(empPositionNew.Category));
                }

                if (empPositionCurrent.Specialty != empPositionNew.Specialty)
                {
                    changedColumns.Add("em_code_speciality = ?");
                    changedValues.Add(ToDbValue(empPositionNew.Specialty));
                }

                if (empPositionCurrent.Branch != empPositionNew.Branch)
                {
                    changedColumns.Add("em_klados_ipaliloy2 = ?");
                    changedValues.Add(ToDbValue(empPositionNew.Branch));
                }

                if (changedColumns.Count == 0) return Result<string>.Success("Δεν υπήρξε αλλαγή στη θέση");

                var table = "employee_net";
                var existsInEmployeeNet = await ExistsInEmployeeNetAsync(connection, am.ToString(), GetHospitalCode());
                var existsInEmployee = await ExistsInEmployeeAsync(connection, am.ToString(), GetHospitalCode());
                if (!existsInEmployeeNet) await CopyFromEmployeeToEmployeeNetAsync(connection, am.ToString(), afm);
                if (existsInEmployee) table = "employee";

                var updateSql = $@"
                    UPDATE {table} SET
                        {string.Join(", ", changedColumns)}
                    WHERE em_register_number = ?
                    AND em_hospital_code = ?";

                await using var updateCommand = new OdbcCommand(updateSql, connection);
                foreach (var value in changedValues)
                    updateCommand.Parameters.Add(new OdbcParameter("@value", value));
                updateCommand.Parameters.Add(new OdbcParameter("@am", am));
                updateCommand.Parameters.Add(new OdbcParameter("@hospital", GetHospitalCode()));

                var rows = await updateCommand.ExecuteNonQueryAsync();
                _logger.LogInformation("Ενημερώθηκαν τα πεδία [{Fields}] στον {Table} (AM={Am}, {Rows} γραμμές)", string.Join(", ", changedColumns), table, am, rows);

                return Result<string>.Success($"Ενημερώθηκε η θέση στον {table} (AM={am})");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Αποτυχία ενημέρωσης θέσης στη Sybase (AM={Am}): {Message}", am, ex.Message);
                return Result<string>.Failure($"Αποτυχία ενημέρωσης θέσης στη μισθοδοσία για τον υπάλληλο {am}: {ex.Message}", 502);
            }
        }

        public async Task<Result<string>> UpdateEmployeePositionInfoAsync(string afm, int am, EmployeePositionInfo empPositionInfoCurrent, EmployeePositionInfo empPositionInfoNew)
        {
            try
            {
                await using var connection = new OdbcConnection(_connectionString);
                await connection.OpenAsync();
                await UpdateWhitelistAsync(connection);

                var changedColumns = new List<string>();
                var changedValues = new List<object>();

                if (empPositionInfoCurrent.HireDate != empPositionInfoNew.HireDate)
                {
                    changedColumns.Add("em_employment_date = ?");
                    changedValues.Add(ToDbValue(empPositionInfoNew.HireDate?.ToString("yyyy/MM/dd")));
                }

                if (changedColumns.Count == 0) return Result<string>.Success("Δεν υπήρξε αλλαγή στην ημερομηνία πρόσληψης");

                var table = "employee_net";
                var existsInEmployeeNet = await ExistsInEmployeeNetAsync(connection, am.ToString(), GetHospitalCode());
                var existsInEmployee = await ExistsInEmployeeAsync(connection, am.ToString(), GetHospitalCode());
                if (!existsInEmployeeNet) await CopyFromEmployeeToEmployeeNetAsync(connection, am.ToString(), afm);
                if (existsInEmployee) table = "employee";

                var updateSql = $@"
                    UPDATE {table} SET
                        {string.Join(", ", changedColumns)}
                    WHERE em_register_number = ?
                    AND em_hospital_code = ?";

                await using var updateCommand = new OdbcCommand(updateSql, connection);
                foreach (var value in changedValues)
                    updateCommand.Parameters.Add(new OdbcParameter("@value", value));
                updateCommand.Parameters.Add(new OdbcParameter("@am", am));
                updateCommand.Parameters.Add(new OdbcParameter("@hospital", GetHospitalCode()));

                var rows = await updateCommand.ExecuteNonQueryAsync();
                _logger.LogInformation("Ενημερώθηκαν τα πεδία [{Fields}] στον {Table} (AM={Am}, {Rows} γραμμές)", string.Join(", ", changedColumns), table, am, rows);

                return Result<string>.Success($"Ενημερώθηκε η ημερομηνία πρόσληψης στον {table} (AM={am})");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Αποτυχία ενημέρωσης ημερομηνίας πρόσληψης στη Sybase (AM={Am}): {Message}", am, ex.Message);
                return Result<string>.Failure($"Αποτυχία ενημέρωσης ημερομηνίας πρόσληψης στη μισθοδοσία για τον υπάλληλο {am}: {ex.Message}", 502);
            }
        }

        public async Task<Result<string>> UpdateEmployeeSalaryAsync(string afm, int am, EmployeeSalary empSalaryCurrent, EmployeeSalary empSalaryNew)
        {
            try
            {
                await using var connection = new OdbcConnection(_connectionString);
                await connection.OpenAsync();
                await UpdateWhitelistAsync(connection);

                var changedColumns = new List<string>();
                var changedValues = new List<object>();

                if (empSalaryCurrent.MK != empSalaryNew.MK)
                {
                    changedColumns.Add("em_misthologiko_klimakio = ?");
                    changedValues.Add(empSalaryNew.MK);
                }

                if (empSalaryCurrent.MKNextDate != empSalaryNew.MKNextDate)
                {
                    changedColumns.Add("em_date_change_misth_klim = ?");
                    changedValues.Add(ToDbValue(empSalaryNew.MKNextDate?.ToString("yyyy/MM/dd")));
                }

                if (changedColumns.Count == 0) return Result<string>.Success("Δεν υπήρξε αλλαγή στη μισθολογική κλίμακα");

                var table = "employee_net";
                var existsInEmployeeNet = await ExistsInEmployeeNetAsync(connection, am.ToString(), GetHospitalCode());
                var existsInEmployee = await ExistsInEmployeeAsync(connection, am.ToString(), GetHospitalCode());
                if (!existsInEmployeeNet) await CopyFromEmployeeToEmployeeNetAsync(connection, am.ToString(), afm);
                if (existsInEmployee) table = "employee";

                var updateSql = $@"
                    UPDATE {table} SET
                        {string.Join(", ", changedColumns)}
                    WHERE em_register_number = ?
                    AND em_hospital_code = ?";

                await using var updateCommand = new OdbcCommand(updateSql, connection);
                foreach (var value in changedValues)
                    updateCommand.Parameters.Add(new OdbcParameter("@value", value));
                updateCommand.Parameters.Add(new OdbcParameter("@am", am));
                updateCommand.Parameters.Add(new OdbcParameter("@hospital", GetHospitalCode()));

                var rows = await updateCommand.ExecuteNonQueryAsync();
                _logger.LogInformation("Ενημερώθηκαν τα πεδία [{Fields}] στον {Table} (AM={Am}, {Rows} γραμμές)", string.Join(", ", changedColumns), table, am, rows);

                return Result<string>.Success($"Ενημερώθηκε η μισθολογική κλίμακα στον {table} (AM={am})");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Αποτυχία ενημέρωσης μισθολογικής κλίμακας στη Sybase (AM={Am}): {Message}", am, ex.Message);
                return Result<string>.Failure($"Αποτυχία ενημέρωσης μισθολογικής κλίμακας στη μισθοδοσία για τον υπάλληλο {am}: {ex.Message}", 502);
            }
        }

        public async Task<Result<string>> UpdateEmployeeGradeAsync(string afm, int am, int grade)
        {
            try
            {
                await using var connection = new OdbcConnection(_connectionString);
                await connection.OpenAsync();
                await UpdateWhitelistAsync(connection);

                var table = "employee_net";
                var existsInEmployeeNet = await ExistsInEmployeeNetAsync(connection, am.ToString(), GetHospitalCode());
                var existsInEmployee = await ExistsInEmployeeAsync(connection, am.ToString(), GetHospitalCode());
                if (!existsInEmployeeNet) await CopyFromEmployeeToEmployeeNetAsync(connection, am.ToString(), afm);
                if (existsInEmployee) table = "employee";

                var updateSql = $@"
                    UPDATE {table} SET
                        em_sylogiki_symbasi = ?
                    WHERE em_register_number = ?
                    AND em_hospital_code = ?";

                await using var updateCommand = new OdbcCommand(updateSql, connection);
                updateCommand.Parameters.Add(new OdbcParameter("@grade", grade));
                updateCommand.Parameters.Add(new OdbcParameter("@am", am));
                updateCommand.Parameters.Add(new OdbcParameter("@hospital", GetHospitalCode()));

                var rows = await updateCommand.ExecuteNonQueryAsync();
                _logger.LogInformation("Ενημερώθηκε ο βαθμός στον {Table} (AM={Am}, {Rows} γραμμές)", table, am, rows);

                return Result<string>.Success($"Ενημερώθηκε ο βαθμός στον {table} (AM={am})");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Αποτυχία ενημέρωσης βαθμού στη Sybase (AM={Am}): {Message}", am, ex.Message);
                return Result<string>.Failure($"Αποτυχία ενημέρωσης βαθμού στη μισθοδοσία για τον υπάλληλο {am}: {ex.Message}", 502);
            }
        }

        public async Task CreateEmployeePersonalAsync(Employee employee, int childrenCount)
        {
            await using var connection = new OdbcConnection(_connectionString);
            await connection.OpenAsync();

            await UpdateWhitelistAsync(connection);

            var amText = employee.Am.ToString();
            var hospital = await _context.Parameters.FirstOrDefaultAsync(e => e.Name == "hospital");
            if (hospital == null || hospital.Value1 == null)
            {
                _logger.LogError("Η παράμετρος 'hospital' δεν βρέθηκε στη βάση δεδομένων.");
                return;
            }

            var amount = 0;              
            if(childrenCount == 1) amount = 70;
            else if(childrenCount == 2) amount = 120;
            else if(childrenCount == 3) amount = 170;
            else if(childrenCount == 4) amount = 220;
            else if(childrenCount == 5) amount = 290;
            else if(childrenCount >= 6) amount = 360;
            else amount = 0;

            const string insertSql = @"
                INSERT INTO employee (
                    em_name, em_surname, em_register_number, em_hospital_code, 
                    em_tax_register, em_birthday, em_family_status, em_name_father, 
                    em_name_mother, em_address, em_postcode, em_city, 
                    em_phone1, em_email, em_police_id, em_amka, 
                    em_number_book_ika, em_doy_code, em_iban_01, em_iban_02,
                    em_break_date, new_employee, em_category_code, em_misthologiko_klimakio,
                    em_date_change_misth_klim, em_epidoma_teknon
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

            await using var insertCommand = new OdbcCommand(insertSql, connection);
            insertCommand.Parameters.Add(new OdbcParameter("@em_name", employee.FirstName));
            insertCommand.Parameters.Add(new OdbcParameter("@em_surname", employee.LastName));
            insertCommand.Parameters.Add(new OdbcParameter("@em_register_number", employee.Am));
            insertCommand.Parameters.Add(new OdbcParameter("@em_hospital_code", hospital!.Value1));
            insertCommand.Parameters.Add(new OdbcParameter("@em_tax_register", employee.Afm));
            insertCommand.Parameters.Add(new OdbcParameter("@em_birthday", employee.BirthDate.HasValue ? employee.BirthDate.Value.ToString("yyyy/MM/dd") : "1900-01-01"));
            insertCommand.Parameters.Add(new OdbcParameter("@em_family_status", employee.FamilyStatus));
            insertCommand.Parameters.Add(new OdbcParameter("@em_name_father", employee.FatherName));
            insertCommand.Parameters.Add(new OdbcParameter("@em_name_mother", employee.MotherName));
            insertCommand.Parameters.Add(new OdbcParameter("@em_address", employee.Address));
            insertCommand.Parameters.Add(new OdbcParameter("@em_postcode", employee.PostCode));
            insertCommand.Parameters.Add(new OdbcParameter("@em_city", employee.City));
            insertCommand.Parameters.Add(new OdbcParameter("@em_phone1", employee.Phone));
            insertCommand.Parameters.Add(new OdbcParameter("@em_email", employee.Email));
            insertCommand.Parameters.Add(new OdbcParameter("@em_police_id", employee.IdentityCardNumber));
            insertCommand.Parameters.Add(new OdbcParameter("@em_amka", employee.Amka));
            insertCommand.Parameters.Add(new OdbcParameter("@em_number_book_ika", employee.Ama));
            insertCommand.Parameters.Add(new OdbcParameter("@em_doy_code", employee.Doy));
            insertCommand.Parameters.Add(new OdbcParameter("@em_iban_01", employee.Iban1));
            insertCommand.Parameters.Add(new OdbcParameter("@em_iban_02", employee.Iban2));
            insertCommand.Parameters.Add(new OdbcParameter("@em_break_date", "2000-01-01"));
            insertCommand.Parameters.Add(new OdbcParameter("@new_employee", "1"));
            insertCommand.Parameters.Add(new OdbcParameter("@em_category_code", employee.SalaryCode));
            insertCommand.Parameters.Add(new OdbcParameter("@em_misthologiko_klimakio", employee.MK));
            insertCommand.Parameters.Add(new OdbcParameter("@em_date_change_misth_klim", employee.MKNextDate.HasValue ? employee.MKNextDate.Value.ToString("yyyy/MM/dd") : "1900-01-01"));
            insertCommand.Parameters.Add(new OdbcParameter("@em_epidoma_teknon", amount));

            try
            {
                var rows = await insertCommand.ExecuteNonQueryAsync();
                _logger.LogInformation("\n\n\n\nΔημιουργήθηκε νέος υπάλληλος στον employee (AM={Am}, {Rows} γραμμές)\n\n\n\n", employee.Am, rows);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "\n\n\n\nΑποτυχία δημιουργίας υπαλλήλου στον employee (AM={Am}): {Message}\n\n\n\n", employee.Am, ex.Message);
            }
        }

        public async Task<Result<string>> UpdateEmployeeChildrenAsync(string afm, int am, int employeeChildrenCount)
        {
            try
            {
                await using var connection = new OdbcConnection(_connectionString);
                await connection.OpenAsync();
                await UpdateWhitelistAsync(connection);

                var table = "employee_net";
                var existsInEmployeeNet = await ExistsInEmployeeNetAsync(connection, am.ToString(), GetHospitalCode());
                var existsInEmployee = await ExistsInEmployeeAsync(connection, am.ToString(), GetHospitalCode());
                if (!existsInEmployeeNet) await CopyFromEmployeeToEmployeeNetAsync(connection, am.ToString(), afm);
                if (existsInEmployee) table = "employee";

                var amount = 0;              
                if(employeeChildrenCount == 1) amount = 70;
                else if(employeeChildrenCount == 2) amount = 120;
                else if(employeeChildrenCount == 3) amount = 170;
                else if(employeeChildrenCount == 4) amount = 220;
                else if(employeeChildrenCount == 5) amount = 290;
                else if(employeeChildrenCount >= 6) amount = 360;
                else amount = 0;

                string sql = @"
                    UPDATE " + table + @" SET
                        em_epidoma_teknon = ?
                    WHERE em_register_number = ? 
                    AND em_hospital_code = ?";

                await using var command = new OdbcCommand(sql, connection);
                command.Parameters.Add(new OdbcParameter("@employeeChildrenCount", amount));
                command.Parameters.Add(new OdbcParameter("@am", am));
                command.Parameters.Add(new OdbcParameter("@hospital", GetHospitalCode()));

                var rows = await command.ExecuteNonQueryAsync();
                _logger.LogInformation("Ενημερώθηκε ο αριθμός παιδιών του υπαλλήλου (AM={Am}, {Rows} γραμμές), {amount}", am, rows, amount);
                return Result<string>.Success("Επιτυχής ενημέρωση");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "\n\n\nΑποτυχία ενημέρωσης αριθμού παιδιών στη Sybase (AM={Am}): {Message}\n\n\n", am, ex.Message);
                return Result<string>.Failure($"Αποτυχία ενημέρωσης αριθμού παιδιών στη μισθοδοσία για τον υπάλληλο {am}: {ex.Message}", 502);
            }
        }

        public async Task<Result<string>> UpdateEmployeeBreakDate(string afm, int am, DateOnly breakDate)
        {
            try
            {
                await using var connection = new OdbcConnection(_connectionString);
                await connection.OpenAsync();
                await UpdateWhitelistAsync(connection);

                var table = "employee_net";
                var existsInEmployeeNet = await ExistsInEmployeeNetAsync(connection, am.ToString(), GetHospitalCode());
                var existsInEmployee = await ExistsInEmployeeAsync(connection, am.ToString(), GetHospitalCode());
                if (!existsInEmployeeNet) await CopyFromEmployeeToEmployeeNetAsync(connection, am.ToString(), afm);
                if (existsInEmployee) table = "employee";

                var updateSql = $@"
                    UPDATE {table} SET
                        em_break_date = ?
                    WHERE em_register_number = ?
                    AND em_hospital_code = ?";

                await using var updateCommand = new OdbcCommand(updateSql, connection);
                updateCommand.Parameters.Add(new OdbcParameter("@breakDate", breakDate.ToString("yyyy/MM/dd")));
                updateCommand.Parameters.Add(new OdbcParameter("@am", am));
                updateCommand.Parameters.Add(new OdbcParameter("@hospital", GetHospitalCode()));

                var rows = await updateCommand.ExecuteNonQueryAsync();
                if(rows > 0)
                    _logger.LogInformation("Ενημερώθηκαν τα πεδία [em_misthologiko_klimakio, em_date_change_misth_klim] στον {Table} (AM={Am}, {Rows} γραμμές)", table, am, rows);
                else
                    _logger.LogWarning("Δεν βρέθηκαν γραμμές για ενημέρωση των πεδίων [em_misthologiko_klimakio, em_date_change_misth_klim] στον {Table} (AM={Am})", table, am);
                return Result<string>.Success($"Ενημερώθηκε η μισθολογική κλίμακα στον {table} (AM={am})");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Αποτυχία ενημέρωσης μισθολογικής κλίμακας στη Sybase (AM={Am}): {Message}", am, ex.Message);
                return Result<string>.Failure($"Αποτυχία ενημέρωσης μισθολογικής κλίμακας στη μισθοδοσία για τον υπάλληλο {am}: {ex.Message}", 502);
            }
        }

        public async Task<Result<string>> UpdateEmployeeMKAsync(string afm, int am, int MK, DateOnly MKNextDate)
        {
            try
            {
                await using var connection = new OdbcConnection(_connectionString);
                await connection.OpenAsync();
                await UpdateWhitelistAsync(connection);

                var changedColumns = new List<string>();
                var changedValues = new List<object>();

                var table = "employee_net";
                var existsInEmployeeNet = await ExistsInEmployeeNetAsync(connection, am.ToString(), GetHospitalCode());
                var existsInEmployee = await ExistsInEmployeeAsync(connection, am.ToString(), GetHospitalCode());
                if (!existsInEmployeeNet) await CopyFromEmployeeToEmployeeNetAsync(connection, am.ToString(), afm);
                if (existsInEmployee) table = "employee";

                var updateSql = $@"
                    UPDATE {table} SET
                        em_misthologiko_klimakio = ?,
                        em_date_change_misth_klim = ?
                    WHERE em_register_number = ?
                    AND em_hospital_code = ?";

                await using var updateCommand = new OdbcCommand(updateSql, connection);
                updateCommand.Parameters.Add(new OdbcParameter("@MK", MK));
                updateCommand.Parameters.Add(new OdbcParameter("@MKNextDate", MKNextDate.ToString("yyyy/MM/dd")));
                updateCommand.Parameters.Add(new OdbcParameter("@am", am));
                updateCommand.Parameters.Add(new OdbcParameter("@hospital", GetHospitalCode()));

                var rows = await updateCommand.ExecuteNonQueryAsync();
                _logger.LogInformation("Ενημερώθηκαν τα πεδία [{Fields}] στον {Table} (AM={Am}, {Rows} γραμμές)", string.Join(", ", changedColumns), table, am, rows);

                return Result<string>.Success($"Ενημερώθηκε η μισθολογική κλίμακα στον {table} (AM={am})");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Αποτυχία ενημέρωσης μισθολογικής κλίμακας στη Sybase (AM={Am}): {Message}", am, ex.Message);
                return Result<string>.Failure($"Αποτυχία ενημέρωσης μισθολογικής κλίμακας στη μισθοδοσία για τον υπάλληλο {am}: {ex.Message}", 502);
            }
        }

        private async Task CopyFromEmployeeToEmployeeNetAsync(OdbcConnection connection, string am, string afm)
        {
            var copySql = $@"
                INSERT INTO employee_net 
                    (SELECT * 
                        FROM employee 
                        WHERE em_tax_register = ? 
                        AND em_register_number = ?
                    )";

            await using var copyCommand = new OdbcCommand(copySql, connection);
            copyCommand.Parameters.Add(new OdbcParameter("@afm", afm));
            copyCommand.Parameters.Add(new OdbcParameter("@am", am));

            var copiedRows = await copyCommand.ExecuteNonQueryAsync();
            _logger.LogInformation("Αντιγράφηκε ο υπάλληλος από τον employee στον employee_net (AM={Am}, {Rows} γραμμές)", am, copiedRows);
        }

        private static async Task<bool> ExistsInEmployeeNetAsync(OdbcConnection connection, string am, string hospital)
        {
            const string sql = @"
                SELECT count(*) 
                FROM employee_net
                WHERE em_register_number = ? 
                AND em_hospital_code = ?";

            await using var command = new OdbcCommand(sql, connection);
            command.Parameters.Add(new OdbcParameter("@am", am));
            command.Parameters.Add(new OdbcParameter("@hospital", hospital));

            var count = Convert.ToInt32(await command.ExecuteScalarAsync());
            return count > 0;
        }

        private static async Task<bool> ExistsInEmployeeAsync(OdbcConnection connection, string am, string hospital)
        {
            const string sql = @"
                SELECT count(*) 
                FROM employee
                WHERE em_register_number = ? 
                AND em_hospital_code = ? 
                AND new_employee = '1'
                AND em_break_date = '2000-01-01'";

            await using var command = new OdbcCommand(sql, connection);
            command.Parameters.Add(new OdbcParameter("@am", am));
            command.Parameters.Add(new OdbcParameter("@hospital", hospital));

            var count = Convert.ToInt32(await command.ExecuteScalarAsync());
            return count > 0;
        }

        private async Task UpdateWhitelistAsync(OdbcConnection connection)
        {
            const string sql = @"
                UPDATE whitelist
                SET dbid = (SELECT connection_property('number')), userid = ?
                WHERE office = ?
                AND pc_descr = ?";

            await using var command = new OdbcCommand(sql, connection);
            command.Parameters.Add(new OdbcParameter("@userId", UserId));
            command.Parameters.Add(new OdbcParameter("@office", Office));
            command.Parameters.Add(new OdbcParameter("@pcDescr", PcDescr));

            var rows = await command.ExecuteNonQueryAsync();
            _logger.LogInformation("Whitelist ενημερώθηκε στη σύνδεση της εργασίας ({Rows} γραμμές)", rows);
        }

    }
}
