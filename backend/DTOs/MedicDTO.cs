using System.ComponentModel.DataAnnotations;

namespace MetaHuman.Backend.DTOs;

public class CerereMedicDTO
{
    [Required]
    [MaxLength(100)]
    public string Nume { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Prenume { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    public string Parola { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? Specializare { get; set; }

    [MaxLength(20)]
    public string? Telefon { get; set; }
}

public class RaspunsMedicDTO
{
    public int IdMedic { get; set; }
    public string Nume { get; set; } = string.Empty;
    public string Prenume { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Specializare { get; set; }
    public string? Telefon { get; set; }
    public bool Activ { get; set; }
}

public class CerereActualizareMedicDTO
{
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
}
