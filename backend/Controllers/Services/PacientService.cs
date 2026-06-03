using MetaHuman.Backend.DTOs;
using MetaHuman.Backend.Exceptions;
using MetaHuman.Backend.Helpers;
using MetaHuman.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace MetaHuman.Backend.Services;

public class PacientService
{
    private readonly MetaHumanContext _context;
    private readonly IUtilizatorCurentAccessor _utilizatorCurent;
    private readonly IdentitateClinicalaResolver _identitateClinicala;

    public PacientService(
        MetaHumanContext context,
        IUtilizatorCurentAccessor utilizatorCurent,
        IdentitateClinicalaResolver identitateClinicala)
    {
        _context = context;
        _utilizatorCurent = utilizatorCurent;
        _identitateClinicala = identitateClinicala;
    }

    public async Task<IReadOnlyList<RaspunsPacientDTO>> ObtineListaAsync(
        CancellationToken cancellationToken = default)
    {
        var query = _context.Pacienti.AsQueryable();

        if (_utilizatorCurent.EsteMedic)
        {
            var idMedic = await _identitateClinicala.ObtineIdMedicCurentAsync(cancellationToken);
            if (!idMedic.HasValue)
                return Array.Empty<RaspunsPacientDTO>();

            query = query.Where(p => p.IdMedic == idMedic.Value);
        }

        return await query
            .OrderBy(p => p.Nume)
            .Select(p => new RaspunsPacientDTO
            {
                IdPacient = p.IdPacient,
                IdMedic = p.IdMedic,
                Nume = p.Nume,
                Prenume = p.Prenume,
                Varsta = p.Varsta,
                Cnp = p.Cnp,
                Telefon = p.Telefon,
                Email = p.Email,
                Activ = p.Activ
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<RaspunsPacientDetaliuDTO> ObtineDetaliuAsync(
        int idPacient,
        CancellationToken cancellationToken = default)
    {
        var pacient = await ObtinePacientCuVerificareAccesAsync(idPacient, cancellationToken);
        return MapLaDetaliu(pacient);
    }

    public async Task<RaspunsPacientDTO> CreeazaAsync(
        CererePacientDTO cerere,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(cerere.Parola) || cerere.Parola.Length < 6)
            throw new InvalidOperationException("Parola trebuie să aibă minim 6 caractere.");

        var email = cerere.Email.Trim();
        if (await _context.Utilizatori.AnyAsync(u => u.Email == email, cancellationToken))
            throw new InvalidOperationException("Există deja un utilizator cu acest email.");

        var idMedic = await RezolvaIdMedicLaCreareAsync(cerere, cancellationToken);

        await using var tranzactie = await _context.Database.BeginTransactionAsync(cancellationToken);

        var utilizator = new Utilizator
        {
            Email = email,
            HashParola = BCrypt.Net.BCrypt.HashPassword(cerere.Parola),
            Rol = RolUtilizator.Pacient.ToDbValue(),
            Activ = true,
            DataCreare = DateTime.UtcNow
        };

        _context.Utilizatori.Add(utilizator);
        await _context.SaveChangesAsync(cancellationToken);

        var pacient = new Pacient
        {
            IdUtilizator = utilizator.IdUtilizator,
            IdMedic = idMedic,
            Nume = cerere.Nume.Trim(),
            Prenume = cerere.Prenume.Trim(),
            Varsta = cerere.Varsta,
            Cnp = cerere.Cnp?.Trim(),
            Adresa = cerere.Adresa?.Trim(),
            Telefon = cerere.Telefon?.Trim(),
            Email = email,
            Profesie = cerere.Profesie?.Trim(),
            LocMunca = cerere.LocMunca?.Trim(),
            Activ = true
        };

        _context.Pacienti.Add(pacient);
        await _context.SaveChangesAsync(cancellationToken);
        await tranzactie.CommitAsync(cancellationToken);

        return MapLaLista(pacient);
    }

    public async Task<RaspunsPacientDTO> ActualizeazaAsync(
        int idPacient,
        CererePacientDTO cerere,
        CancellationToken cancellationToken = default)
    {
        var pacient = await ObtinePacientCuVerificareAccesAsync(idPacient, cancellationToken);

        if (_utilizatorCurent.EsteAdmin && cerere.IdMedic.HasValue)
        {
            if (!await _context.Medici.AnyAsync(
                    m => m.IdMedic == cerere.IdMedic.Value, cancellationToken))
                throw new InvalidOperationException("Medicul specificat nu există.");

            pacient.IdMedic = cerere.IdMedic.Value;
        }

        pacient.Nume = cerere.Nume.Trim();
        pacient.Prenume = cerere.Prenume.Trim();
        pacient.Varsta = cerere.Varsta;
        pacient.Cnp = cerere.Cnp?.Trim();
        pacient.Adresa = cerere.Adresa?.Trim();
        pacient.Telefon = cerere.Telefon?.Trim();
        pacient.Email = cerere.Email.Trim();
        pacient.Profesie = cerere.Profesie?.Trim();
        pacient.LocMunca = cerere.LocMunca?.Trim();

        if (pacient.IdUtilizator.HasValue)
        {
            var utilizator = await _context.Utilizatori
                .FirstOrDefaultAsync(u => u.IdUtilizator == pacient.IdUtilizator.Value, cancellationToken);

            if (utilizator != null && utilizator.Email != cerere.Email.Trim())
            {
                if (await _context.Utilizatori.AnyAsync(
                        u => u.Email == cerere.Email.Trim() && u.IdUtilizator != utilizator.IdUtilizator,
                        cancellationToken))
                    throw new InvalidOperationException("Există deja un utilizator cu acest email.");

                utilizator.Email = cerere.Email.Trim();
            }
        }

        await _context.SaveChangesAsync(cancellationToken);
        return MapLaLista(pacient);
    }

    public async Task DezactiveazaAsync(
        int idPacient,
        CancellationToken cancellationToken = default)
    {
        var pacient = await ObtinePacientCuVerificareAccesAsync(idPacient, cancellationToken);
        pacient.Activ = false;

        if (pacient.IdUtilizator.HasValue)
        {
            var utilizator = await _context.Utilizatori
                .FirstOrDefaultAsync(u => u.IdUtilizator == pacient.IdUtilizator.Value, cancellationToken);

            if (utilizator != null)
                utilizator.Activ = false;
        }

        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task StergeDefinitivAsync(
        int idPacient,
        CancellationToken cancellationToken = default)
    {
        if (!_utilizatorCurent.EsteAdmin)
            throw new AccesInterzisException("Doar administratorul poate șterge definitiv pacienți.");

        var pacient = await _context.Pacienti
            .FirstOrDefaultAsync(p => p.IdPacient == idPacient, cancellationToken);

        if (pacient == null)
            throw new ResursaNegasitaException("Pacientul nu a fost găsit.");

        var idUtilizator = pacient.IdUtilizator;

        await using var tranzactie = await _context.Database.BeginTransactionAsync(cancellationToken);

        await _context.DispozitiveAsociate
            .Where(d => d.IdPacient == idPacient)
            .ExecuteDeleteAsync(cancellationToken);

        await _context.PraguriAlerta
            .Where(p => p.IdPacient == idPacient)
            .ExecuteDeleteAsync(cancellationToken);

        await _context.Masuratori
            .Where(m => m.IdPacient == idPacient)
            .ExecuteDeleteAsync(cancellationToken);

        await _context.InregistrariECG
            .Where(e => e.IdPacient == idPacient)
            .ExecuteDeleteAsync(cancellationToken);

        await _context.Recomandari
            .Where(r => r.IdPacient == idPacient)
            .ExecuteDeleteAsync(cancellationToken);

        await _context.Alerte
            .Where(a => a.IdPacient == idPacient)
            .ExecuteDeleteAsync(cancellationToken);

        _context.Pacienti.Remove(pacient);
        await _context.SaveChangesAsync(cancellationToken);

        if (idUtilizator.HasValue)
        {
            await _context.SesiuniAutentificare
                .Where(s => s.IdUtilizator == idUtilizator.Value)
                .ExecuteDeleteAsync(cancellationToken);

            var utilizator = await _context.Utilizatori
                .FirstOrDefaultAsync(u => u.IdUtilizator == idUtilizator.Value, cancellationToken);

            if (utilizator != null)
                _context.Utilizatori.Remove(utilizator);
        }

        await _context.SaveChangesAsync(cancellationToken);
        await tranzactie.CommitAsync(cancellationToken);
    }

    public async Task VerificaAccesMedicLaPacientAsync(
        int idPacient,
        CancellationToken cancellationToken = default)
    {
        await ObtinePacientCuVerificareAccesAsync(idPacient, cancellationToken);
    }

    private async Task<int> RezolvaIdMedicLaCreareAsync(
        CererePacientDTO cerere,
        CancellationToken cancellationToken)
    {
        if (_utilizatorCurent.EsteAdmin)
        {
            if (!cerere.IdMedic.HasValue)
                throw new InvalidOperationException("Admin trebuie să specifice IdMedic.");

            if (!await _context.Medici.AnyAsync(
                    m => m.IdMedic == cerere.IdMedic.Value, cancellationToken))
                throw new InvalidOperationException("Medicul specificat nu există.");

            return cerere.IdMedic.Value;
        }

        if (_utilizatorCurent.EsteMedic)
        {
            if (cerere.IdMedic.HasValue)
                throw new InvalidOperationException("Medicul nu poate seta IdMedic manual.");

            var idMedic = await _identitateClinicala.ObtineIdMedicCurentAsync(cancellationToken);
            if (!idMedic.HasValue)
                throw new InvalidOperationException("Profilul de medic nu a fost găsit.");

            return idMedic.Value;
        }

        throw new AccesInterzisException("Nu aveți permisiunea de a crea pacienți.");
    }

    private async Task<Pacient> ObtinePacientCuVerificareAccesAsync(
        int idPacient,
        CancellationToken cancellationToken)
    {
        var pacient = await _context.Pacienti
            .FirstOrDefaultAsync(p => p.IdPacient == idPacient, cancellationToken);

        if (pacient == null)
            throw new ResursaNegasitaException("Pacientul nu a fost găsit.");

        if (_utilizatorCurent.EsteAdmin)
            return pacient;

        if (_utilizatorCurent.EsteMedic)
        {
            var idMedic = await _identitateClinicala.ObtineIdMedicCurentAsync(cancellationToken);
            if (idMedic.HasValue && pacient.IdMedic == idMedic.Value)
                return pacient;
        }

        throw new AccesInterzisException("Nu aveți acces la acest pacient.");
    }

    private static RaspunsPacientDTO MapLaLista(Pacient p) => new()
    {
        IdPacient = p.IdPacient,
        IdMedic = p.IdMedic,
        Nume = p.Nume,
        Prenume = p.Prenume,
        Varsta = p.Varsta,
        Cnp = p.Cnp,
        Telefon = p.Telefon,
        Email = p.Email,
        Activ = p.Activ
    };

    private static RaspunsPacientDetaliuDTO MapLaDetaliu(Pacient p) => new()
    {
        IdPacient = p.IdPacient,
        IdMedic = p.IdMedic,
        Nume = p.Nume,
        Prenume = p.Prenume,
        Varsta = p.Varsta,
        Cnp = p.Cnp,
        Adresa = p.Adresa,
        Telefon = p.Telefon,
        Email = p.Email,
        Profesie = p.Profesie,
        LocMunca = p.LocMunca,
        IstoricMedical = p.IstoricMedical,
        Alergii = p.Alergii,
        ConsultatiiCardiologice = p.ConsultatiiCardiologice,
        Activ = p.Activ
    };
}
