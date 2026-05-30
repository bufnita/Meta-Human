namespace MetaHuman.Backend.Models;

/// <summary>Roluri din doc. Proiectare IS 5.1 / 5.3 — autentificare separată medic și pacient.</summary>
public enum RolUtilizator
{
    Admin,
    Medic,
    Pacient
}

public static class RolUtilizatorExtensions
{
    public static string ToDbValue(this RolUtilizator rol) => rol.ToString();

    public static bool TryFromDbValue(string? value, out RolUtilizator rol) =>
        Enum.TryParse(value, ignoreCase: true, out rol);
}
