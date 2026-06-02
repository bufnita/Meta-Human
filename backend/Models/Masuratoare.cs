using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MetaHuman.Backend.Models;

public class Masuratoare
{
    public int IdMasuratoare { get; set; }

    [ForeignKey(nameof(Pacient))]
    public int IdPacient { get; set; }

    [Required]
    [MaxLength(30)]
    public string TipParametru { get; set; } = string.Empty;

    public decimal Valoare { get; set; }

    [Required]
    [MaxLength(20)]
    public string UnitateMasura { get; set; } = string.Empty;

    public DateTime DataOra { get; set; }

    [Required]
    [MaxLength(20)]
    public string Stare { get; set; } = string.Empty;

    [Required]
    [MaxLength(30)]
    public string Sursa { get; set; } = string.Empty;

    [MaxLength(255)]
    public string? Observatii { get; set; }

    [InverseProperty(nameof(Pacient.Masuratori))]
    public Pacient Pacient { get; set; } = null!;
}
