using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MetaHuman.Backend.Models;

public class SesiuneAutentificare
{
    public int IdSesiune { get; set; }

    [ForeignKey(nameof(Utilizator))]
    public int IdUtilizator { get; set; }

    [Required]
    [MaxLength(255)]
    public string TokenReimprospatare { get; set; } = string.Empty;

    public DateTime ExpiraLa { get; set; }

    public bool Revocat { get; set; }

    public DateTime DataCreare { get; set; }

    public Utilizator Utilizator { get; set; } = null!;
}
