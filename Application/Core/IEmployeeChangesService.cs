namespace Application.Core
{
    public interface IEmployeeChangesService
    {
        Task<Result<string>> CreateEmployeeChange(int am, int type, int previousState, int nextState, DateOnly changeDate, DateOnly nextChangeDate);
    }
}