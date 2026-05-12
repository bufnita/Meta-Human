namespace MetaHuman.Backend.Models;

public class PragAlerta
{
    public int Id { get; set; }

    public int IdPacient { get; set; }

    public string TipParametru { get; set; } = string.Empty;

    public double Minim { get; set; }

    public double Maxim { get; set; }

    public int DurataPersistentaSec { get; set; }
}