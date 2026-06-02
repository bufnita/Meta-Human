using System.ComponentModel.DataAnnotations;

namespace MetaHuman.Backend.DTOs;

public class CererePragAlertaDTO
{
    [Required]
    [MaxLength(30)]
    public string TipParametru { get; set; } = string.Empty;

    public decimal? ValoareMinima { get; set; }

    public decimal? ValoareMaxima { get; set; }

    [Range(1, int.MaxValue)]
    public int DurataPersistentaSec { get; set; }

    public bool Activ { get; set; } = true;
}

public class RaspunsPragAlertaDTO
{
    public int IdPrag { get; set; }
    public int IdPacient { get; set; }
    public string TipParametru { get; set; } = string.Empty;
    public decimal? ValoareMinima { get; set; }
    public decimal? ValoareMaxima { get; set; }
    public int DurataPersistentaSec { get; set; }
    public bool Activ { get; set; }
}
