namespace MetaHuman.Backend.Models;

public class Alerta
{
    public int Id { get; set; }

    public int IdPacient { get; set; }

    public string TipParametru { get; set; } = string.Empty;

    public string Mesaj { get; set; } = string.Empty;

    public DateTime DataGenerare { get; set; }
}