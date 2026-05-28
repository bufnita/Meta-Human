using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MetaHuman.Backend.Models;

public class Alerta
{
    public int IdAlerta { get; set; }

    [ForeignKey(nameof(Pacient))]
    public int IdPacient { get; set; }

    [ForeignKey(nameof(Medic))]
    public int IdMedic { get; set; }

    [Required]
    [MaxLength(30)]
    public string TipAlerta { get; set; } = string.Empty;

    [Required]
    [MaxLength(30)]
    public string ParametruAsociat { get; set; } = string.Empty;

    public decimal? PragMinim { get; set; }

    public decimal? PragMaxim { get; set; }

    public decimal ValoareConstatata { get; set; }

    public DateTime DataOra { get; set; }

    public int DurataPersistentaSec { get; set; }

    [Required]
    [MaxLength(255)]
    public string Mesaj { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string Stare { get; set; } = string.Empty;

    [InverseProperty(nameof(Pacient.Alerte))]
    public Pacient Pacient { get; set; } = null!;

    public Medic Medic { get; set; } = null!;
}
