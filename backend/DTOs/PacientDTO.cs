using System;

namespace MetaHuman.Backend.DTOs
{
    public class PacientDTO
    {
        public int IdMedic { get; set; }
        public string Nume { get; set; } = string.Empty;
        public string Prenume { get; set; } = string.Empty;
        public int Varsta { get; set; }
        public string? Cnp { get; set; }
        public string? Telefon { get; set; }
        public string? Email { get; set; }
    }
}