using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MetaHuman.Backend.Models;

public class Medic
{
    public int IdMedic { get; set; }

    [ForeignKey(nameof(Utilizator))]
    public int IdUtilizator { get; set; }

    [Required]
    [MaxLength(100)]
    public string Nume { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Prenume { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? Specializare { get; set; }

    [MaxLength(20)]
    public string? Telefon { get; set; }

    [InverseProperty(nameof(Utilizator.Medic))]
    public Utilizator Utilizator { get; set; } = null!;

    [InverseProperty(nameof(Pacient.MedicResponsabil))]
    public ICollection<Pacient> Pacienti { get; set; } = new List<Pacient>();
}
