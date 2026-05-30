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
                    u.Email == cerere.Email.Trim());

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

        if (!RolUtilizatorExtensions.TryFromDbValue(utilizator.Rol, out var rol))
            return Unauthorized();

        string nume = "";
        string prenume = "";

        switch (rol)
        {
            case RolUtilizator.Medic:
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

                break;
            }
            case RolUtilizator.Pacient:
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

                break;
            }
            case RolUtilizator.Admin:
                break;
        }

        return Ok(
            new RaspunsAutentificareDTO
            {
                Email = utilizator.Email,
                Rol = rol.ToDbValue(),
                Nume = nume,
                Prenume = prenume,
                Token = _jwtService.GenereazaToken(utilizator)
            }
        );
    }
}
