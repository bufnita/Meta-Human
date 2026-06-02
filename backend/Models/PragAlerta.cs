using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MetaHuman.Backend.Models;

public class PragAlerta
{
    public int IdPrag { get; set; }

    [ForeignKey(nameof(Pacient))]
    public int IdPacient { get; set; }

    [ForeignKey(nameof(Medic))]
    public int IdMedic { get; set; }

    [Required]
    [MaxLength(30)]
    public string TipParametru { get; set; } = string.Empty;

    public decimal? ValoareMinima { get; set; }

    public decimal? ValoareMaxima { get; set; }

    public int DurataPersistentaSec { get; set; }

    public bool Activ { get; set; }

    public Pacient Pacient { get; set; } = null!;
    public Medic Medic { get; set; } = null!;
}
