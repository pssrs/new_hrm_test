using Application.Employees.Queries;
using Application.Core;
using Domain;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
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

// Αλλαγή εδώ
builder.Services.AddAutoMapper(config =>
{
    config.AddProfile<MappingProfiles>();
});

// JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"]!;
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });
builder.Services.AddAuthorization();

builder.Services.AddOpenApi();

var app = builder.Build();

app.UseCors(x =>
    x.AllowAnyHeader()
     .AllowAnyMethod()
     .WithOrigins("http://localhost:3000", "https://localhost:3000", "http://myhrm.local", "https://myhrm.local")
     .AllowCredentials()
);

app.UseAuthentication();
app.UseAuthorization();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Serve React static files from wwwroot
app.UseDefaultFiles(); // serves index.html at root
app.UseStaticFiles();  // serves JS, CSS, images etc.

app.MapControllers();

// SPA fallback: για όλα τα routes που δεν είναι API, επέστρεψε index.html
app.MapFallbackToFile("index.html");

app.Run();
