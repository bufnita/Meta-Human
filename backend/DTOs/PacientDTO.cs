using System.ComponentModel.DataAnnotations;

namespace MetaHuman.Backend.DTOs;

public class CererePacientDTO
{
    /// <summary>Obligatoriu doar pentru Admin; ignorat pentru Medic (setat din JWT).</summary>
    public int? IdMedic { get; set; }

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

    [Required]
    [EmailAddress]
    [MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    /// <summary>Obligatoriu la creare (POST); ignorat la actualizare (PUT).</summary>
    public string? Parola { get; set; }

    [MaxLength(100)]
    public string? Profesie { get; set; }

    [MaxLength(150)]
    public string? LocMunca { get; set; }

    public string? IstoricMedical { get; set; }

    public string? Alergii { get; set; }

    public string? ConsultatiiCardiologice { get; set; }
}

public class RaspunsPacientDTO
{
    public int IdPacient { get; set; }
    public int IdMedic { get; set; }
    public string Nume { get; set; } = string.Empty;
    public string Prenume { get; set; } = string.Empty;
    public int Varsta { get; set; }
    public string? Cnp { get; set; }
    public string? Telefon { get; set; }
    public string? Email { get; set; }
    public bool Activ { get; set; }
}

public class RaspunsPacientDetaliuDTO
{
    public int IdPacient { get; set; }
    public int IdMedic { get; set; }
    public string Nume { get; set; } = string.Empty;
    public string Prenume { get; set; } = string.Empty;
    public int Varsta { get; set; }
    public string? Cnp { get; set; }
    public string? Adresa { get; set; }
    public string? Telefon { get; set; }
    public string? Email { get; set; }
    public string? Profesie { get; set; }
    public string? LocMunca { get; set; }
    public string? IstoricMedical { get; set; }
    public string? Alergii { get; set; }
    public string? ConsultatiiCardiologice { get; set; }
    public bool Activ { get; set; }
}
