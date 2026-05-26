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
//        public DbSet<DispozitivAsociat> DispozitiveAsociate { get; set; }
//        public DbSet<PragAlerta> PraguriAlerta { get; set; }
        public DbSet<Masuratoare> Masuratori { get; set; }
        public DbSet<InregistrareECG> InregistrariECG { get; set; }
//        public DbSet<Recomandare> Recomandari { get; set; }
        public DbSet<Alerta> Alerte { get; set; }
//        public DbSet<SesiuneAutentificare> SesiuniAutentificare { get; set; }

        // ==========================================
        // 2. CONFIGURAREA RELAȚIILOR ȘI INDECȘILOR (Fluent API)
        // ==========================================
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // --- TABELUL UTILIZATOR ---
            modelBuilder.Entity<Utilizator>(entity =>
            {
                entity.ToTable("utlizator");
                entity.HasKey(u => u.IdUtilizator);
                
                // Index unic cerut pentru adresa de e-mail [2]
                entity.HasIndex(u => u.Email).IsUnique(); 
            });

            // --- TABELUL MEDIC ---
            modelBuilder.Entity<Medic>(entity =>
            {
                entity.ToTable("medic");
                entity.HasKey(m => m.IdMedic);

                // Relație 1:1 cu Utilizator [1]
                entity.HasOne<Utilizator>()
                      .WithOne()
                      .HasForeignKey<Medic>(m => m.IdUtilizator);
            });

            // --- TABELUL PACIENT ---
            modelBuilder.Entity<Pacient>(entity =>
            {
                entity.ToTable("pacient");
                entity.HasKey(p => p.IdPacient);

                // Relație 1:1 cu Utilizator [1]
                entity.HasOne<Utilizator>()
                      .WithOne()
                      .HasForeignKey<Pacient>(p => p.IdUtilizator);

                // Relație 1:N cu Medic [1]
                entity.HasOne(p => p.MedicResponsabil)
                      .WithMany(m => m.Pacienti)
                      .HasForeignKey(p => p.IdMedic);
                      
                // Index pentru optimizarea interogărilor medicului [2]
                entity.HasIndex(p => p.IdMedic); 
            });

            // --- TABELUL MĂSURĂTOARE ---
            modelBuilder.Entity<Masuratoare>(entity =>
            {
                entity.ToTable("masuratoare");
                entity.HasKey(m => m.IdMasuratoare);

                // Relație N:1 cu Pacient
                entity.HasOne(m => m.Pacient)
                      .WithMany(p => p.Masuratori)
                      .HasForeignKey(m => m.IdPacient);

                // Index compus cerut în proiectare pentru extragerea rapidă a istoricului [2]
                entity.HasIndex(m => new { m.IdPacient, m.DataOra });
            });

            // --- TABELUL ÎNREGISTRARE ECG ---
            modelBuilder.Entity<InregistrareECG>(entity =>
            {
                entity.ToTable("inregistrareECG");
                entity.HasKey(e => e.IdInregistrareEcg);

                entity.HasOne<Pacient>()
                      .WithMany()
                      .HasForeignKey(e => e.IdPacient);
            });

            // --- TABELUL PRAG ALERTĂ ---
            modelBuilder.Entity<PragAlerta>(entity =>
            {
                entity.ToTable("PragAlerta");
                entity.HasKey(p => p.IdPrag);
                
                entity.HasOne<Pacient>()
                      .WithMany()
                      .HasForeignKey(p => p.IdPacient);

                entity.HasOne<Medic>()
                      .WithMany()
                      .HasForeignKey(p => p.IdMedic);

                // Index compus pentru validarea rapidă a noilor măsurători cu pragurile [2]
                entity.HasIndex(p => new { p.IdPacient, p.TipParametru });
            });

            // --- TABELUL ALERTĂ ---
            modelBuilder.Entity<Alerta>(entity =>
            {
                entity.ToTable("alerta");
                entity.HasKey(a => a.IdAlerta);

                // Relație N:1 cu Pacient
                entity.HasOne<Pacient>()
                      .WithMany(p => p.Alerte)
                      .HasForeignKey(a => a.IdPacient);

                entity.HasOne<Medic>()
                      .WithMany()
                      .HasForeignKey(a => a.IdMedic);

                // Index compus cerut în proiectare [2]
                entity.HasIndex(a => new { a.IdPacient, a.DataOra });
            });
            
            // --- TABELUL RECOMANDARE ---
       /*     modelBuilder.Entity<Recomandare>(entity =>
            {
                entity.ToTable("Recomandare");
                entity.HasKey(r => r.IdRecomandare);
                entity.HasOne<Pacient>().WithMany().HasForeignKey(r => r.IdPacient);
                entity.HasOne<Medic>().WithMany().HasForeignKey(r => r.IdMedic);
            });

            // --- TABELUL DISPOZITIV ASOCIAT ---
            modelBuilder.Entity<DispozitivAsociat>(entity =>
            {
                entity.ToTable("DispozitivAsociat");
                entity.HasKey(d => d.IdDispozitiv);
                entity.HasOne<Pacient>().WithMany().HasForeignKey(d => d.IdPacient);
            });

            // --- TABELUL SESIUNE AUTENTIFICARE ---
            modelBuilder.Entity<SesiuneAutentificare>(entity =>
            {
                entity.ToTable("SesiuneAutentificare");
                entity.HasKey(s => s.IdSesiune);
                entity.HasOne<Utilizator>().WithMany().HasForeignKey(s => s.IdUtilizator);
            });
            */
        }
    }
}