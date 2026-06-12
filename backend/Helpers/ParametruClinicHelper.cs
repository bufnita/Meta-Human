namespace MetaHuman.Backend.Helpers;

public static class ParametruClinicHelper
{
    public const string Temperatura = "temperatura";
    public const string Puls = "puls";
    public const string Ecg = "ecg";

    private static readonly HashSet<string> TipuriSuportate =
        new([Temperatura, Puls, Ecg], StringComparer.Ordinal);

    public static string NormalizeazaFaraValidare(string? tipParametru)
    {
        return (tipParametru ?? string.Empty)
            .Trim()
            .ToLowerInvariant();
    }

    public static string NormalizeazaSauArunca(string? tipParametru)
    {
        var valoareNormalizata = NormalizeazaFaraValidare(tipParametru);

        if (!TipuriSuportate.Contains(valoareNormalizata))
        {
            throw new InvalidOperationException(
                "Tipul parametrului trebuie să fie unul dintre: temperatura, puls, ecg.");
        }

        return valoareNormalizata;
    }

    public static (decimal Minim, decimal Maxim)? ObtineIntervalFiziologic(string? tipParametru)
    {
        return NormalizeazaFaraValidare(tipParametru) switch
        {
            Puls => (1m, 300m),
            Temperatura => (20m, 45m),
            Ecg => (0m, 1023m),
            _ => null
        };
    }
}
