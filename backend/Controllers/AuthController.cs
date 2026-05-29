using BCrypt.Net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MetaHuman.Backend.DTOs;
using MetaHuman.Backend.Models;
using MetaHuman.Backend.Services;

namespace MetaHuman.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly MetaHumanContext _context;
    private readonly JwtService _jwtService;

    public AuthController(
        MetaHumanContext context,
        JwtService jwtService)
    {
        _context = context;
        _jwtService = jwtService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<RaspunsAutentificareDTO>>
        Login(CerereAutentificareDTO cerere)
    {
        var utilizator =
            await _context.Utilizatori
                .FirstOrDefaultAsync(u =>
                    u.Email == cerere.Email);

        if (utilizator == null)
            return Unauthorized();

        if (!utilizator.Activ)
            return Unauthorized();

        bool parolaValida =
            BCrypt.Net.BCrypt.Verify(
                cerere.Parola,
                utilizator.HashParola
            );

        if (!parolaValida)
            return Unauthorized();

        string nume = "";
        string prenume = "";

        if (utilizator.Rol == "Medic")
        {
            var medic =
                await _context.Medici
                    .FirstOrDefaultAsync(m =>
                        m.IdUtilizator ==
                        utilizator.IdUtilizator);

            if (medic != null)
            {
                nume = medic.Nume;
                prenume = medic.Prenume;
            }
        }

        if (utilizator.Rol == "Pacient")
        {
            var pacient =
                await _context.Pacienti
                    .FirstOrDefaultAsync(p =>
                        p.IdUtilizator ==
                        utilizator.IdUtilizator);

            if (pacient != null)
            {
                nume = pacient.Nume;
                prenume = pacient.Prenume;
            }
        }

        return Ok(
            new RaspunsAutentificareDTO
            {
                Email = utilizator.Email,
                Rol = utilizator.Rol,
                Nume = nume,
                Prenume = prenume,
                Token =
                    _jwtService.GenereazaToken(
                        utilizator
                    )
            }
        );
    }
}