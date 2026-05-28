using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MetaHuman.Backend.Models;

public class Pacient
{
    public int IdPacient { get; set; }

    [ForeignKey(nameof(Utilizator))]
    public int? IdUtilizator { get; set; }

    [ForeignKey(nameof(MedicResponsabil))]
    public int IdMedic { get; set; }

    [Required]
    [MaxLength(100)]
    public string Nume { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Prenume { get; set; } = string.Empty;

    [Range(1, int.MaxValue)]
    public int Varsta { get; set; }

    [MaxLength(13)]
    public string? Cnp { get; set; }

    [MaxLength(255)]
    public string? Adresa { get; set; }

    [MaxLength(20)]
    public string? Telefon { get; set; }

    [MaxLength(150)]
    public string? Email { get; set; }

    [MaxLength(100)]
    public string? Profesie { get; set; }

    [MaxLength(150)]
    public string? LocMunca { get; set; }

    public string? IstoricMedical { get; set; }

    public string? Alergii { get; set; }

    public string? ConsultatiiCardiologice { get; set; }

    public bool Activ { get; set; }

    [InverseProperty(nameof(Utilizator.Pacient))]
    public Utilizator? Utilizator { get; set; }

    [InverseProperty(nameof(Medic.Pacienti))]
    public Medic MedicResponsabil { get; set; } = null!;

    [InverseProperty(nameof(Masuratoare.Pacient))]
    public ICollection<Masuratoare> Masuratori { get; set; } = new List<Masuratoare>();

    [InverseProperty(nameof(Alerta.Pacient))]
    public ICollection<Alerta> Alerte { get; set; } = new List<Alerta>();

    [InverseProperty(nameof(Recomandare.Pacient))]
    public ICollection<Recomandare> Recomandari { get; set; } = new List<Recomandare>();

    [InverseProperty(nameof(DispozitivAsociat.Pacient))]
    public ICollection<DispozitivAsociat> DispozitiveAsociate { get; set; } = new List<DispozitivAsociat>();
}
