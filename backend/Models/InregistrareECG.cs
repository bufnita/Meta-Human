using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MetaHuman.Backend.Models;

public class InregistrareECG
{
    public int IdInregistrareEcg { get; set; }

    [ForeignKey(nameof(Pacient))]
    public int IdPacient { get; set; }

    [Required]
    public string SecventaValori { get; set; } = string.Empty;

    public int? FrecventaEsantionare { get; set; }

    public int DurataCapturiiSec { get; set; }

    public DateTime DataOra { get; set; }

    public string? Observatii { get; set; }

    [Required]
    [MaxLength(20)]
    public string StareValidare { get; set; } = string.Empty;

    public Pacient Pacient { get; set; } = null!;
}
