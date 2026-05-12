namespace MetaHuman.Backend.Models;

public class Pacient
{
    public int Id { get; set; }

    public string Nume { get; set; } = string.Empty;

    public DateTime DataNasterii { get; set; }

    public ICollection<Masuratoare> Masuratori { get; set; }
        = new List<Masuratoare>();

    public ICollection<Alerta> Alerte { get; set; }
        = new List<Alerta>();
}