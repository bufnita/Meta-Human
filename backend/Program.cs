using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
// using MetaHuman.Backend.Models;
// using MetaHuman.Backend.Services;

var builder = WebApplication.CreateBuilder(args);

// =====================================================================
// 1. CONFIGURAREA BAZEI DE DATE (PostgreSQL - LXC 3)
// =====================================================================
// Backend-ul este singura componentă care are permisiunea să interogheze baza de date [1].
// Folosim Entity Framework Core pentru a mapa tabelele în entități C# [3].
builder.Services.AddDbContext<MetaHumanContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("PostgresConnection")));

// =====================================================================
// 2. DEPENDENCY INJECTION (Servicii de Business)
// =====================================================================
// Aici vom înregistra clasele care conțin logica medicală și de aplicație [3].
// ex: builder.Services.AddScoped<AlertService>();

// =====================================================================
// 3. CONFIGURAREA CONTROLERELOR
// =====================================================================
// Adăugăm suportul pentru Controlere, care vor expune punctele finale (endpoints) ale API-ului REST [3].
builder.Services.AddControllers();

// =====================================================================
// 4. CONFIGURAREA PENTRU NGINX (Reverse Proxy - LXC 1)
// =====================================================================
// Deoarece Nginx preia cererile HTTPS și rutează traficul către backend [2], 
// aplicația trebuie să citească headerele speciale pentru a afla IP-ul real al clientului.
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    // Fiind într-o rețea internă izolată (LXC), permitem preluarea anteturilor de la proxy-ul local.
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

var app = builder.Build();

// =====================================================================
// PIPELINE-UL HTTP (Ordinea este foarte importantă)
// =====================================================================

// 1. Aplicăm headerele trimise de Nginx (esențial pentru ca backend-ul să știe că cererea originală a fost HTTPS)
app.UseForwardedHeaders();

// 2. Rutarea internă a cererilor
app.UseRouting();

// 3. Autentificare și Autorizare pe bază de roluri (folosind tokenuri JWT) [1]
app.UseAuthentication();
app.UseAuthorization();

// 4. Maparea rutelor către clasele din folderul /Controllers (ex: POST /api/masuratori) [4]
app.MapControllers();

// Pornirea aplicației pe portul intern (ex: 5000, conform configurărilor noastre anterioare)
app.Run();