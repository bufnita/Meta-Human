using System.Security.Claims;
using MetaHuman.Backend.Models;

namespace MetaHuman.Backend.Helpers;

public class UtilizatorCurentAccessor : IUtilizatorCurentAccessor
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public UtilizatorCurentAccessor(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public int? IdUtilizator
    {
        get
        {
            var val = _httpContextAccessor.HttpContext?.User
                .FindFirstValue(ClaimTypes.NameIdentifier);
            return int.TryParse(val, out var id) ? id : null;
        }
    }

    public RolUtilizator? Rol
    {
        get
        {
            var rol = _httpContextAccessor.HttpContext?.User
                .FindFirstValue(ClaimTypes.Role);
            return RolUtilizatorExtensions.TryFromDbValue(rol, out var parsed)
                ? parsed
                : null;
        }
    }

    public bool EsteAdmin => Rol == RolUtilizator.Admin;
    public bool EsteMedic => Rol == RolUtilizator.Medic;
    public bool EstePacient => Rol == RolUtilizator.Pacient;
}
