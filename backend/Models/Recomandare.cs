using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MetaHuman.Backend.Models;

public class Recomandare
{
    public int IdRecomandare { get; set; }

    [ForeignKey(nameof(Pacient))]
    public int IdPacient { get; set; }

    [ForeignKey(nameof(Medic))]
    public int IdMedic { get; set; }

    [Required]
    [MaxLength(100)]
    public string TipActivitate { get; set; } = string.Empty;

    [MaxLength(50)]
    public string? DurataZilnica { get; set; }

    public string? AlteIndicatii { get; set; }

    public DateOnly DataInceput { get; set; }

    public DateOnly? DataSfarsit { get; set; }

    [Required]
    [MaxLength(20)]
    public string Stare { get; set; } = string.Empty;

    [InverseProperty(nameof(Pacient.Recomandari))]
    public Pacient Pacient { get; set; } = null!;
    public Medic Medic { get; set; } = null!;
}
