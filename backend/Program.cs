using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using MetaHuman.Backend.Services;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using MetaHuman.Backend.Models;

var builder = WebApplication.CreateBuilder(args);

// 1. Conectarea la PostgreSQL folosind setările din appsettings.json
builder.Services.AddDbContext<MetaHumanContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("PostgresConnection"))
           .UseSnakeCaseNamingConvention());

var cheieJwt =
    builder.Configuration["Autentificare:CheieJwt"];

// 2. Autentificare
builder.Services
    .AddAuthentication(
        JwtBearerDefaults.AuthenticationScheme
    )
    .AddJwtBearer(optiuni =>
    {
        optiuni.TokenValidationParameters =
            new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,

                ValidIssuer =
                    builder.Configuration["Autentificare:Emitent"],

                ValidAudience =
                    builder.Configuration["Autentificare:Audienta"],

                IssuerSigningKey =
                    new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(cheieJwt!)
                    )
            };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("Admin", policy =>
        policy.RequireRole(RolUtilizator.Admin.ToDbValue()));
    options.AddPolicy("Medic", policy =>
        policy.RequireRole(RolUtilizator.Medic.ToDbValue()));
    options.AddPolicy("Pacient", policy =>
        policy.RequireRole(RolUtilizator.Pacient.ToDbValue()));
});

builder.Services.AddScoped<JwtService>();

// 3. Adăugarea suportului pentru controlere (inclusiv MasuratoriController)
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 4. Configurarea anteturilor pentru Nginx (Reverse Proxy)
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

// Expunem API-ul intern pe portul 5000
builder.WebHost.UseUrls("http://0.0.0.0:5000");

// CORS origins
var allowAnyOrigin =
    builder.Configuration.GetValue<bool>(
        "Cors:AllowAnyOrigin"
    );

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        if (allowAnyOrigin)
        {
            policy
                .AllowAnyOrigin()
                .AllowAnyHeader()
                .AllowAnyMethod();
        }
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// 4. Pipeline-ul cererilor HTTP
app.UseForwardedHeaders();
app.UseRouting();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();