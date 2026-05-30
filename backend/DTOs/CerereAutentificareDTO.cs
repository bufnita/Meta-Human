using System.ComponentModel.DataAnnotations;

namespace MetaHuman.Backend.DTOs;

public class CerereAutentificareDTO
{
    [Required]
    [EmailAddress]
    [MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    public string Parola { get; set; } = string.Empty;
}
