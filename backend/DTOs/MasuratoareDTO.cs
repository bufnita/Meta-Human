using System;

namespace MetaHuman.Backend.DTOs
{
    public class MasuratoareDTO
    {
        public int IdPacient { get; set; }
        public string TipParametru { get; set; } = string.Empty;
        public decimal Valoare { get; set; }
        public string Unitate { get; set; } = string.Empty;
        public DateTime DataOra { get; set; }
        public string Sursa { get; set; } = string.Empty;
    }
}