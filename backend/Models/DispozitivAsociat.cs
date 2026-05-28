using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MetaHuman.Backend.Models;

public class DispozitivAsociat
{
    public int IdDispozitiv { get; set; }

    [ForeignKey(nameof(Pacient))]
    public int IdPacient { get; set; }

    [Required]
    [MaxLength(100)]
    public string Identificator { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string TipDispozitiv { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string StareAsociere { get; set; } = string.Empty;

    [MaxLength(50)]
    public string? VersiuneFirmware { get; set; }

    public DateTime DataAsociere { get; set; }

    [InverseProperty(nameof(Pacient.DispozitiveAsociate))]
    public Pacient Pacient { get; set; } = null!;
}
