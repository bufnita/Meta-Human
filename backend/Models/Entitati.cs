using System;
using System.Collections.Generic;

namespace MetaHuman.Backend.Models
{
    // ==========================================
    // 1. UTILIZATOR [1]
    // ==========================================
    public class Utilizator
    {
        public int IdUtilizator { get; set; }
        public string Email { get; set; } = string.Empty;
        public string HashParola { get; set; } = string.Empty;
        public string Rol { get; set; } = string.Empty;
        public bool Activ { get; set; }
        public DateTime DataCreare { get; set; }
    }

    // ==========================================
    // 2. MEDIC [3]
    // ==========================================
    public class Medic
    {
        public int IdMedic { get; set; }
        public int IdUtilizator { get; set; }
        public string Nume { get; set; } = string.Empty;
        public string Prenume { get; set; } = string.Empty;
        public string? Specializare { get; set; }
        public string? Telefon { get; set; }

        public ICollection<Pacient> Pacienti { get; set; } = new List<Pacient>();
    }

    // ==========================================
    // 3. PACIENT [4, 5]
    // ==========================================
    public class Pacient
    {
        public int IdPacient { get; set; }
        public int? IdUtilizator { get; set; }
        public int IdMedic { get; set; }
        public string Nume { get; set; } = string.Empty;
        public string Prenume { get; set; } = string.Empty;
        public int Varsta { get; set; }
        public string? Cnp { get; set; }
        public string? Adresa { get; set; }
        public string? Telefon { get; set; }
        public string? Email { get; set; }
        public string? Profesie { get; set; }
        public string? LocMunca { get; set; }
        public string? IstoricMedical { get; set; }
        public string? Alergii { get; set; }
        public string? ConsultatiiCardiologice { get; set; }
        public bool Activ { get; set; }

        // Relații de navigare pentru Entity Framework
        public Medic MedicResponsabil { get; set; } = null!;
        public ICollection<Masuratoare> Masuratori { get; set; } = new List<Masuratoare>();
        public ICollection<Alerta> Alerte { get; set; } = new List<Alerta>();
    }

    // ==========================================
    // 4. MĂSURĂTOARE (valori simple) [6]
    // ==========================================
    public class Masuratoare
    {
        public int IdMasuratoare { get; set; }
        public int IdPacient { get; set; }
        public string TipParametru { get; set; } = string.Empty;
        public decimal Valoare { get; set; }
        public string UnitateMasura { get; set; } = string.Empty;
        public DateTime DataOra { get; set; }
        public string Stare { get; set; } = string.Empty;
        public string Sursa { get; set; } = string.Empty;
        public string? Observatii { get; set; }

        public Pacient Pacient { get; set; } = null!;
    }

    // ==========================================
    // 5. ÎNREGISTRARE ECG (capturi de semnal) [7]
    // ==========================================
    public class InregistrareECG
    {
        public int IdInregistrareEcg { get; set; }
        public int IdPacient { get; set; }
        public string SecventaValori { get; set; } = string.Empty;
        public int? FrecventaEsantionare { get; set; }
        public int DurataCapturiiSec { get; set; }
        public DateTime DataOra { get; set; }
        public string? Observatii { get; set; }
        public string StareValidare { get; set; } = string.Empty;
    }

    // ==========================================
    // 6. PRAG ALERTĂ [8]
    // ==========================================
    public class PragAlerta
    {
        public int IdPrag { get; set; }
        public int IdPacient { get; set; }
        public int IdMedic { get; set; }
        public string TipParametru { get; set; } = string.Empty;
        public decimal? ValoareMinima { get; set; }
        public decimal? ValoareMaxima { get; set; }
        public int DurataPersistentaSec { get; set; }
        public bool Activ { get; set; }
    }

    // ==========================================
    // 7. ALERTĂ [9, 10]
    // ==========================================
    public class Alerta
    {
        public int IdAlerta { get; set; }
        public int IdPacient { get; set; }
        public int IdMedic { get; set; }
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
}