using System.ComponentModel.DataAnnotations;

namespace MetaHuman.Backend.Models;

public class Utilizator
{
    public int IdUtilizator { get; set; }

    [Required]
    [MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    public string HashParola { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string Rol { get; set; } = string.Empty;

    public bool Activ { get; set; }

    public DateTime DataCreare { get; set; }

    public Medic? Medic { get; set; }
    public Pacient? Pacient { get; set; }
}
