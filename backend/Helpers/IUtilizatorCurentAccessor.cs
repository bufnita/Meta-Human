using MetaHuman.Backend.Models;

namespace MetaHuman.Backend.Helpers;

/// <summary>Citește identitatea din JWT (HttpContext). Un singur loc — DRY pentru toate serviciile.</summary>
public interface IUtilizatorCurentAccessor
{
    int? IdUtilizator { get; }
    RolUtilizator? Rol { get; }
    bool EsteAdmin { get; }
    bool EsteMedic { get; }
    bool EstePacient { get; }
}
