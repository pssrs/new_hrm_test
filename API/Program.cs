using Application.Employees.Queries;
using Application.Core;
using Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using API.Services;
using Application.Core.Services;
using Application.Core.Services.Reports;

var builder = WebApplication.CreateBuilder(args);

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });
builder.Services.AddHttpContextAccessor();
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("HRM(web)"),
        new MySqlServerVersion(new Version(8, 0, 34))
    )
);

builder.Services.AddCors();
builder.Services.AddMediatR(x => {
    x.RegisterServicesFromAssemblyContaining<GetEmployeeList.Handler>();
});

builder.Services.AddAutoMapper(config =>
{
    config.AddProfile<MappingProfiles>();
});

builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<ISybaseService, SybaseService>();
builder.Services.AddScoped<IEmployeeChangesService, EmployeeChangesService>();

// νέα γραμμή:
builder.Services.AddScoped<IEmployeeReportService>(sp =>
{
    var config = sp.GetRequiredService<IConfiguration>();
    var basePath = config["ReportTemplates:BasePath"]!;
    return new EmployeeReportService(
        Path.Combine(basePath, "vevaiosi_ergasias.docx"),
        Path.Combine(basePath, "adky_atomiko_deltio_katataxis.docx"),
        Path.Combine(basePath, "vevaiosi_proipiresias_template.docx"),
        Path.Combine(basePath, "vevaiwsi_anarrotikis_template.docx"),
        Path.Combine(basePath, "deltio_ypiresiakon_metavolon_template.docx"),
        sp.GetRequiredService<AppDbContext>());
});
builder.Services.AddHostedService<PeriodicMaintenanceService>();

var jwtKey = builder.Configuration["Jwt:Key"]!;

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                return Task.CompletedTask;
            },
            OnTokenValidated = context =>
            {
                return Task.CompletedTask;
            }
        };
    });
builder.Services.AddAuthorization();

builder.Services.AddOpenApi();

var app = builder.Build();

// Sub-path: strip /hrm_test prefix — μόνο σε production (IIS sub-application)
if (!app.Environment.IsDevelopment())
{
    app.UsePathBase("/hrm_test");
}

app.UseCors(x =>
    x.AllowAnyHeader()
     .AllowAnyMethod()
     .WithOrigins("http://localhost:3000", "https://localhost:3000", "http://myhrm.local", "https://myhrm.local", "http://localhost:150", "https://apps.payrollrs.gr")
     .AllowCredentials()
     .SetPreflightMaxAge(TimeSpan.FromSeconds(3600))
);

app.UseAuthentication();
app.UseAuthorization();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Serve React static files from wwwroot
app.UseDefaultFiles();
app.UseStaticFiles();

// API routes
app.MapControllers();

// SPA fallback: all non-API routes serve index.html (for React Router)
app.MapFallbackToFile("index.html");

app.Run();
