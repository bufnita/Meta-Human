namespace MetaHuman.Backend.DTOs;

public class RaspunsAlertaDTO
{
    public int IdAlerta { get; set; }
    public int IdPacient { get; set; }
    public string PacientNume { get; set; } = string.Empty;
    public string PacientPrenume { get; set; } = string.Empty;
    public string TipAlerta { get; set; } = string.Empty;
    public string ParametruAsociat { get; set; } = string.Empty;
    public decimal? PragMinim { get; set; }
    public decimal? PragMaxim { get; set; }
    public decimal ValoareConstatata { get; set; }
    public DateTime DataOra { get; set; }
    public int DurataPersistentaSec { get; set; }
    public string Mesaj { get; set; } = string.Empty;
    public string Stare { get; set; } = string.Empty;
}
