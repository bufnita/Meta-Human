using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using MetaHuman.Backend.Models;

var builder = WebApplication.CreateBuilder(args);

// 1. Conectarea la PostgreSQL folosind setările din appsettings.json
builder.Services.AddDbContext<MetaHumanContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("PostgresConnection"))
           .UseSnakeCaseNamingConvention());

// 2. Adăugarea suportului pentru controlere (inclusiv MasuratoriController)
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 3. Configurarea anteturilor pentru Nginx (Reverse Proxy)
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

// Expunem API-ul intern pe portul 5000
builder.WebHost.UseUrls("http://0.0.0.0:5000");

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// 4. Pipeline-ul cererilor HTTP
app.UseForwardedHeaders();
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();