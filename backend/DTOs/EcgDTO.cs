using System.ComponentModel.DataAnnotations;

namespace MetaHuman.Backend.DTOs;

public class CerereEcgDTO
{
    public int IdPacient { get; set; }

    [Required]
    public string SecventaValori { get; set; } = string.Empty;

    public int? FrecventaEsantionare { get; set; }

    [Range(1, int.MaxValue)]
    public int DurataCapturiiSec { get; set; }

    public string? Observatii { get; set; }
}

public class RaspunsEcgDTO
{
    public int IdInregistrareEcg { get; set; }
    public int IdPacient { get; set; }
    public DateTime DataOra { get; set; }
    public string StareValidare { get; set; } = string.Empty;
}
