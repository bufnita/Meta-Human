using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using MetaHuman.Backend.Models;

namespace MetaHuman.Backend.Services;

public class JwtService
{
    private readonly IConfiguration _configuratie;

    public JwtService(IConfiguration configuratie)
    {
        _configuratie = configuratie;
    }

    public string GenereazaToken(Utilizator utilizator)
    {
        var cheie =
            new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(
                    _configuratie["Autentificare:CheieJwt"]!
                )
            );

        var credentiale =
            new SigningCredentials(
                cheie,
                SecurityAlgorithms.HmacSha256
            );

        var claimuri = new List<Claim>
        {
            new(
                ClaimTypes.NameIdentifier,
                utilizator.IdUtilizator.ToString()
            ),

            new(
                ClaimTypes.Email,
                utilizator.Email
            ),

            new(
                ClaimTypes.Role,
                utilizator.Rol
            )
        };

        var token =
            new JwtSecurityToken(
                issuer:
                    _configuratie["Autentificare:Emitent"],

                audience:
                    _configuratie["Autentificare:Audienta"],

                claims: claimuri,

                expires:
                    DateTime.UtcNow.AddMinutes(
                        int.Parse(
                            _configuratie["Autentificare:DurataMinute"]!
                        )
                    ),

                signingCredentials: credentiale
            );

        return new JwtSecurityTokenHandler()
            .WriteToken(token);
    }
}