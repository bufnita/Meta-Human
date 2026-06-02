using System.ComponentModel.DataAnnotations;

namespace MetaHuman.Backend.DTOs;

public class CerereRecomandareDTO
{
    [Required]
    [MaxLength(100)]
    public string TipActivitate { get; set; } = string.Empty;

    [MaxLength(50)]
    public string? DurataZilnica { get; set; }

    public string? AlteIndicatii { get; set; }

    [Required]
    public DateOnly DataInceput { get; set; }

    public DateOnly? DataSfarsit { get; set; }
}

public class RaspunsRecomandareDTO
{
    public int IdRecomandare { get; set; }
    public int IdPacient { get; set; }
    public string TipActivitate { get; set; } = string.Empty;
    public string? DurataZilnica { get; set; }
    public string? AlteIndicatii { get; set; }
    public DateOnly DataInceput { get; set; }
    public DateOnly? DataSfarsit { get; set; }
    public string Stare { get; set; } = string.Empty;
}
