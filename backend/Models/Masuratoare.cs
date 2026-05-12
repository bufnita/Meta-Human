namespace MetaHuman.Backend.Models;

public class Masuratoare
{
    public int Id { get; set; }

    public int IdPacient { get; set; }

    public Pacient Pacient { get; set; } = null!;

    public string TipParametru { get; set; } = string.Empty;

    public double Valoare { get; set; }

    public string Unitate { get; set; } = string.Empty;

    public DateTime DataOra { get; set; }

    public string Sursa { get; set; } = string.Empty;
}