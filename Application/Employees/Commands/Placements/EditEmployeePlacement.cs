using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Core;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Employees.Commands.Placements
{
    public class EditEmployeePlacement
    {
        public class Command : IRequest<Result<string>>
        {
            public required Placement Placement { get; set; }
        }

        public class Handler(AppDbContext context, IMapper mapper) : IRequestHandler<Command, Result<string>>
        {
            public async Task<Result<string>> Handle(Command request, CancellationToken cancellationToken)
            {
                var employee = await context.Employees.FirstOrDefaultAsync(x => x.Am == request.Placement.Am, cancellationToken);
                if (employee == null) return Result<string>.Failure("Employee not found", 404);

                var placement = await context.Placements.FirstOrDefaultAsync(x => x.Id == request.Placement.Id, cancellationToken);
                if (placement == null) return Result<string>.Failure("Placement not found", 404);

                mapper.Map(request.Placement, placement);

                employee.WorkDirectorate = placement.NewAddress;
                employee.WorkDepartment = placement.NewDepartment;
                employee.WorkSector = placement.NewSector;
                employee.WorkOffice = placement.NewTeam;

                var result = await context.SaveChangesAsync(cancellationToken) >= 0;
                if (!result) return Result<string>.Failure("Failed to update the placement", 400);

                return Result<string>.Success(placement.Id.ToString());
            }
        }
    }
}