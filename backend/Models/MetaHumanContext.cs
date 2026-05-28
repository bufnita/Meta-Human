using Microsoft.EntityFrameworkCore;

namespace MetaHuman.Backend.Models
{
    public class MetaHumanContext : DbContext
    {
        public MetaHumanContext(DbContextOptions<MetaHumanContext> options) : base(options) { }

        // ==========================================
        // 1. DECLARAREA TABELELOR (DbSets)
        // ==========================================
        public DbSet<Utilizator> Utilizatori { get; set; }
        public DbSet<Medic> Medici { get; set; }
        public DbSet<Pacient> Pacienti { get; set; }
        public DbSet<DispozitivAsociat> DispozitiveAsociate { get; set; }
        public DbSet<PragAlerta> PraguriAlerta { get; set; }
        public DbSet<Masuratoare> Masuratori { get; set; }
        public DbSet<InregistrareECG> InregistrariECG { get; set; }
        public DbSet<Recomandare> Recomandari { get; set; }
        public DbSet<Alerta> Alerte { get; set; }
        public DbSet<SesiuneAutentificare> SesiuniAutentificare { get; set; }

        // ==========================================
        // 2. CONFIGURAREA MAPĂRII ȘI INDECȘILOR (Fluent API)
        // ==========================================
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Nume tabele aliniate la 01_init_schema.sql (PostgreSQL: identificatori nequoted → lowercase)
            // --- TABELUL UTILIZATOR ---
            modelBuilder.Entity<Utilizator>(entity =>
            {
                entity.ToTable("utilizator");
                entity.HasKey(u => u.IdUtilizator);
                entity.HasIndex(u => u.Email).IsUnique();
            });

            // --- TABELUL MEDIC ---
            modelBuilder.Entity<Medic>(entity =>
            {
                entity.ToTable("medic");
                entity.HasKey(m => m.IdMedic);
                entity.HasIndex(m => m.IdUtilizator).IsUnique();
            });

            // --- TABELUL PACIENT ---
            modelBuilder.Entity<Pacient>(entity =>
            {
                entity.ToTable("pacient", t =>
                    t.HasCheckConstraint("CK_Pacient_Varsta", "varsta > 0"));
                entity.HasKey(p => p.IdPacient);
                entity.HasIndex(p => p.IdUtilizator).IsUnique();
                entity.HasIndex(p => p.IdMedic);
                entity.HasIndex(p => p.Cnp).IsUnique();
            });

            // --- TABELUL MĂSURĂTOARE ---
            modelBuilder.Entity<Masuratoare>(entity =>
            {
                entity.ToTable("masuratoare");
                entity.HasKey(m => m.IdMasuratoare);
                entity.HasIndex(m => new { m.IdPacient, m.DataOra });
            });

            // --- TABELUL ÎNREGISTRARE ECG ---
            modelBuilder.Entity<InregistrareECG>(entity =>
            {
                entity.ToTable("inregistrareecg");
                entity.HasKey(e => e.IdInregistrareEcg);
            });

            // --- TABELUL PRAG ALERTĂ ---
            modelBuilder.Entity<PragAlerta>(entity =>
            {
                entity.ToTable("pragalerta");
                entity.HasKey(p => p.IdPrag);
                entity.HasIndex(p => new { p.IdPacient, p.TipParametru });
            });

            // --- TABELUL ALERTĂ ---
            modelBuilder.Entity<Alerta>(entity =>
            {
                entity.ToTable("alerta");
                entity.HasKey(a => a.IdAlerta);
                entity.HasIndex(a => new { a.IdPacient, a.DataOra });
            });

            // --- TABELUL RECOMANDARE ---
            modelBuilder.Entity<Recomandare>(entity =>
            {
                entity.ToTable("recomandare");
                entity.HasKey(r => r.IdRecomandare);
            });

            // --- TABELUL DISPOZITIV ASOCIAT ---
            modelBuilder.Entity<DispozitivAsociat>(entity =>
            {
                entity.ToTable("dispozitivasociat");
                entity.HasKey(d => d.IdDispozitiv);
                entity.HasIndex(d => d.Identificator).IsUnique();
                entity.HasIndex(d => d.IdPacient);
            });

            // --- TABELUL SESIUNE AUTENTIFICARE ---
            modelBuilder.Entity<SesiuneAutentificare>(entity =>
            {
                entity.ToTable("sesiuneautentificare");
                entity.HasKey(s => s.IdSesiune);
                entity.HasIndex(s => s.TokenReimprospatare).IsUnique();
            });
        }
    }
}
