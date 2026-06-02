using System.ComponentModel.DataAnnotations;

namespace MetaHuman.Backend.DTOs;

public class CerereMasuratoareDTO
{
    public int IdPacient { get; set; }

    [Required]
    [MaxLength(30)]
    public string TipParametru { get; set; } = string.Empty;

    public decimal Valoare { get; set; }

    [Required]
    [MaxLength(20)]
    public string Unitate { get; set; } = string.Empty;

    public DateTime DataOra { get; set; }

    [Required]
    [MaxLength(30)]
    public string Sursa { get; set; } = string.Empty;

    [MaxLength(255)]
    public string? Observatii { get; set; }
}

public class RaspunsMasuratoareDTO
{
    public int IdMasuratoare { get; set; }
    public int IdPacient { get; set; }
    public string TipParametru { get; set; } = string.Empty;
    public decimal Valoare { get; set; }
    public string UnitateMasura { get; set; } = string.Empty;
    public DateTime DataOra { get; set; }
    public string Stare { get; set; } = string.Empty;
}

public class RaspunsIstoricMasuratoriDTO
{
    public int IdPacient { get; set; }
    public IReadOnlyList<RaspunsMasuratoareDTO> Masuratori { get; set; } =
        Array.Empty<RaspunsMasuratoareDTO>();
}
