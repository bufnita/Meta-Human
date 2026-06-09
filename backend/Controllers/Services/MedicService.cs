using MetaHuman.Backend.DTOs;
using MetaHuman.Backend.Exceptions;
using MetaHuman.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace MetaHuman.Backend.Services;

public class MedicService
{
    private readonly MetaHumanContext _context;

    public MedicService(MetaHumanContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<RaspunsMedicDTO>> ObtineTotiAsync(
        CancellationToken cancellationToken = default)
    {
        var medici = await _context.Medici
            .Include(m => m.Utilizator)
            .OrderByDescending(m => m.Utilizator.Activ)
            .ThenBy(m => m.Nume)
            .ToListAsync(cancellationToken);

        return medici.Select(MapLaRaspuns).ToList();
    }

    public async Task<RaspunsMedicDTO> ObtineDupaIdAsync(
        int idMedic,
        CancellationToken cancellationToken = default)
    {
        var medic = await _context.Medici
            .Include(m => m.Utilizator)
            .FirstOrDefaultAsync(m => m.IdMedic == idMedic, cancellationToken);

        if (medic == null)
            throw new ResursaNegasitaException("Medicul nu a fost găsit.");

        return MapLaRaspuns(medic);
    }

    public async Task<RaspunsMedicDTO> CreeazaAsync(
        CerereMedicDTO cerere,
        CancellationToken cancellationToken = default)
    {
        if (await _context.Utilizatori.AnyAsync(
                u => u.Email == cerere.Email.Trim(), cancellationToken))
            throw new InvalidOperationException("Există deja un utilizator cu acest email.");

        await using var tranzactie = await _context.Database.BeginTransactionAsync(cancellationToken);

        var utilizator = new Utilizator
        {
            Email = cerere.Email.Trim(),
            HashParola = BCrypt.Net.BCrypt.HashPassword(cerere.Parola),
            Rol = RolUtilizator.Medic.ToDbValue(),
            Activ = true,
            DataCreare = DateTime.UtcNow
        };

        _context.Utilizatori.Add(utilizator);
        await _context.SaveChangesAsync(cancellationToken);

        var medic = new Medic
        {
            IdUtilizator = utilizator.IdUtilizator,
            Nume = cerere.Nume.Trim(),
            Prenume = cerere.Prenume.Trim(),
            Specializare = cerere.Specializare?.Trim(),
            Telefon = cerere.Telefon?.Trim()
        };

        _context.Medici.Add(medic);
        await _context.SaveChangesAsync(cancellationToken);
        await tranzactie.CommitAsync(cancellationToken);

        medic.Utilizator = utilizator;
        return MapLaRaspuns(medic);
    }

    public async Task<RaspunsMedicDTO> ActualizeazaAsync(
        int idMedic,
        CerereActualizareMedicDTO cerere,
        CancellationToken cancellationToken = default)
    {
        var medic = await _context.Medici
            .Include(m => m.Utilizator)
            .FirstOrDefaultAsync(m => m.IdMedic == idMedic, cancellationToken);

        if (medic == null)
            throw new ResursaNegasitaException("Medicul nu a fost găsit.");

        medic.Nume = cerere.Nume.Trim();
        medic.Prenume = cerere.Prenume.Trim();
        medic.Specializare = cerere.Specializare?.Trim();
        medic.Telefon = cerere.Telefon?.Trim();

        await _context.SaveChangesAsync(cancellationToken);
        return MapLaRaspuns(medic);
    }

    public async Task DezactiveazaAsync(
        int idMedic,
        CancellationToken cancellationToken = default)
    {
        var medic = await _context.Medici
            .Include(m => m.Utilizator)
            .FirstOrDefaultAsync(m => m.IdMedic == idMedic, cancellationToken);

        if (medic == null)
            throw new ResursaNegasitaException("Medicul nu a fost găsit.");

        if (!medic.Utilizator.Activ)
            throw new InvalidOperationException("Medicul este deja inactiv.");

        medic.Utilizator.Activ = false;
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task ActiveazaAsync(
        int idMedic,
        CancellationToken cancellationToken = default)
    {
        var medic = await _context.Medici
            .Include(m => m.Utilizator)
            .FirstOrDefaultAsync(m => m.IdMedic == idMedic, cancellationToken);

        if (medic == null)
            throw new ResursaNegasitaException("Medicul nu a fost găsit.");

        if (medic.Utilizator.Activ)
            throw new InvalidOperationException("Medicul este deja activ.");

        medic.Utilizator.Activ = true;
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task StergeDefinitivAsync(
        int idMedic,
        CancellationToken cancellationToken = default)
    {
        if (await _context.Pacienti.AnyAsync(p => p.IdMedic == idMedic, cancellationToken))
            throw new InvalidOperationException(
                "Medicul are pacienți asociați. Reatribuiți pacienții (PUT) sau ștergeți-i definitiv înainte de ștergerea medicului.");

        var medic = await _context.Medici
            .Include(m => m.Utilizator)
            .FirstOrDefaultAsync(m => m.IdMedic == idMedic, cancellationToken);

        if (medic == null)
            throw new ResursaNegasitaException("Medicul nu a fost găsit.");

        var utilizator = medic.Utilizator;
        var idUtilizator = medic.IdUtilizator;

        await using var tranzactie = await _context.Database.BeginTransactionAsync(cancellationToken);

        await _context.Alerte
            .Where(a => a.IdMedic == idMedic)
            .ExecuteDeleteAsync(cancellationToken);

        await _context.Recomandari
            .Where(r => r.IdMedic == idMedic)
            .ExecuteDeleteAsync(cancellationToken);

        await _context.PraguriAlerta
            .Where(p => p.IdMedic == idMedic)
            .ExecuteDeleteAsync(cancellationToken);

        _context.Medici.Remove(medic);
        await _context.SaveChangesAsync(cancellationToken);

        await _context.SesiuniAutentificare
            .Where(s => s.IdUtilizator == idUtilizator)
            .ExecuteDeleteAsync(cancellationToken);

        _context.Utilizatori.Remove(utilizator);
        await _context.SaveChangesAsync(cancellationToken);
        await tranzactie.CommitAsync(cancellationToken);
    }

    public async Task<bool> ExistaAsync(int idMedic, CancellationToken cancellationToken = default) =>
        await _context.Medici.AnyAsync(m => m.IdMedic == idMedic, cancellationToken);

    private static RaspunsMedicDTO MapLaRaspuns(Medic medic) => new()
    {
        IdMedic = medic.IdMedic,
        Nume = medic.Nume,
        Prenume = medic.Prenume,
        Email = medic.Utilizator.Email,
        Specializare = medic.Specializare,
        Telefon = medic.Telefon,
        Activ = medic.Utilizator.Activ
    };
}
