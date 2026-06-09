using MetaHuman.Backend.DTOs;
using MetaHuman.Backend.Exceptions;
using MetaHuman.Backend.Helpers;
using MetaHuman.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace MetaHuman.Backend.Services;

public class AlertService
{
    private const string StareActiva = "Activă";
    private const string StareRezolvata = "Rezolvată";
    private const string StareIgnorata = "Ignorată";

    private readonly MetaHumanContext _context;
    private readonly IdentitateClinicalaResolver _identitateClinicala;

    public AlertService(
        MetaHumanContext context,
        IdentitateClinicalaResolver identitateClinicala)
    {
        _context = context;
        _identitateClinicala = identitateClinicala;
    }

    public async Task EvalueazaDupaMasuratoareAsync(
        Masuratoare masuratoare,
        CancellationToken cancellationToken = default)
    {
        var prag = await _context.PraguriAlerta
            .FirstOrDefaultAsync(p =>
                    p.IdPacient == masuratoare.IdPacient
                    && p.TipParametru == masuratoare.TipParametru
                    && p.Activ,
                cancellationToken);

        if (prag == null || !EsteDepasire(masuratoare.Valoare, prag))
            return;

        var deLa = masuratoare.DataOra.AddSeconds(-prag.DurataPersistentaSec);

        var masuratoriRecente = await _context.Masuratori
            .Where(m =>
                m.IdPacient == masuratoare.IdPacient
                && m.TipParametru == masuratoare.TipParametru
                && m.DataOra >= deLa
                && m.DataOra <= masuratoare.DataOra)
            .OrderBy(m => m.DataOra)
            .ToListAsync(cancellationToken);

        if (masuratoriRecente.Count == 0
            || masuratoriRecente.Any(m => !EsteDepasire(m.Valoare, prag)))
            return;

        var existaAlertaActiva = await _context.Alerte.AnyAsync(
            a => a.IdPacient == masuratoare.IdPacient
                 && a.ParametruAsociat == masuratoare.TipParametru
                 && a.Stare == StareActiva,
            cancellationToken);

        if (existaAlertaActiva)
            return;

        var pacient = await _context.Pacienti
            .AsNoTracking()
            .FirstAsync(p => p.IdPacient == masuratoare.IdPacient, cancellationToken);

        var alerta = new Alerta
        {
            IdPacient = masuratoare.IdPacient,
            IdMedic = pacient.IdMedic,
            TipAlerta = "DepasirePrag",
            ParametruAsociat = masuratoare.TipParametru,
            PragMinim = prag.ValoareMinima,
            PragMaxim = prag.ValoareMaxima,
            ValoareConstatata = masuratoare.Valoare,
            DataOra = masuratoare.DataOra,
            DurataPersistentaSec = prag.DurataPersistentaSec,
            Mesaj =
                $"Depășire {masuratoare.TipParametru}: {masuratoare.Valoare} {masuratoare.UnitateMasura}",
            Stare = StareActiva
        };

        _context.Alerte.Add(alerta);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<RaspunsAlertaDTO>> ObtinePentruMedicCurentAsync(
        CancellationToken cancellationToken = default)
    {
        var idMedic = await _identitateClinicala.ObtineIdMedicCurentAsync(cancellationToken);
        if (!idMedic.HasValue)
            return Array.Empty<RaspunsAlertaDTO>();

        var alerte = await QueryAlerte()
            .Where(a => a.IdMedic == idMedic.Value)
            .OrderByDescending(a => a.DataOra)
            .ToListAsync(cancellationToken);

        return alerte.Select(MapLaRaspuns).ToList();
    }

    public async Task<IReadOnlyList<RaspunsAlertaDTO>> ObtineActivePentruMedicCurentAsync(
        CancellationToken cancellationToken = default)
    {
        var idMedic = await _identitateClinicala.ObtineIdMedicCurentAsync(cancellationToken);
        if (!idMedic.HasValue)
            return Array.Empty<RaspunsAlertaDTO>();

        var alerte = await QueryAlerte()
            .Where(a => a.IdMedic == idMedic.Value && a.Stare == StareActiva)
            .OrderByDescending(a => a.DataOra)
            .ToListAsync(cancellationToken);

        return alerte.Select(MapLaRaspuns).ToList();
    }

    public async Task<IReadOnlyList<RaspunsAlertaDTO>> ObtinePentruPacientAsync(
        int idPacient,
        CancellationToken cancellationToken = default)
    {
        var alerte = await QueryAlerte()
            .Where(a => a.IdPacient == idPacient)
            .OrderByDescending(a => a.DataOra)
            .ToListAsync(cancellationToken);

        return alerte.Select(MapLaRaspuns).ToList();
    }

    public async Task<IReadOnlyList<RaspunsAlertaDTO>> ObtinePentruPacientCurentAsync(
        CancellationToken cancellationToken = default)
    {
        var idPacient = await _identitateClinicala.ObtineIdPacientCurentAsync(cancellationToken);
        if (!idPacient.HasValue)
            throw new AccesInterzisException("Profilul de pacient nu a fost gasit.");

        return await ObtinePentruPacientAsync(idPacient.Value, cancellationToken);
    }

    public async Task<RaspunsAlertaDTO> RezolvaAsync(
        int idAlerta,
        CancellationToken cancellationToken = default)
    {
        var alerta = await ObtineAlertaMedicAsync(idAlerta, cancellationToken);
        alerta.Stare = StareRezolvata;
        await _context.SaveChangesAsync(cancellationToken);
        return MapLaRaspuns(alerta);
    }

    public async Task<RaspunsAlertaDTO> IgnoraAsync(
        int idAlerta,
        CancellationToken cancellationToken = default)
    {
        var alerta = await ObtineAlertaMedicAsync(idAlerta, cancellationToken);
        alerta.Stare = StareIgnorata;
        await _context.SaveChangesAsync(cancellationToken);
        return MapLaRaspuns(alerta);
    }

    private async Task<Alerta> ObtineAlertaMedicAsync(
        int idAlerta,
        CancellationToken cancellationToken)
    {
        var idMedic = await _identitateClinicala.ObtineIdMedicCurentAsync(cancellationToken);
        if (!idMedic.HasValue)
            throw new AccesInterzisException("Profilul de medic nu a fost găsit.");

        var alerta = await _context.Alerte
            .Include(a => a.Pacient)
            .FirstOrDefaultAsync(a => a.IdAlerta == idAlerta, cancellationToken);

        if (alerta == null)
            throw new ResursaNegasitaException("Alerta nu a fost găsită.");

        if (alerta.IdMedic != idMedic.Value)
            throw new AccesInterzisException("Nu aveți acces la această alertă.");

        return alerta;
    }

    private IQueryable<Alerta> QueryAlerte() =>
        _context.Alerte.Include(a => a.Pacient);

    private static bool EsteDepasire(decimal valoare, PragAlerta prag)
    {
        if (prag.ValoareMinima.HasValue && valoare < prag.ValoareMinima.Value)
            return true;

        if (prag.ValoareMaxima.HasValue && valoare > prag.ValoareMaxima.Value)
            return true;

        return false;
    }

    private static RaspunsAlertaDTO MapLaRaspuns(Alerta a) => new()
    {
        IdAlerta = a.IdAlerta,
        IdPacient = a.IdPacient,
        PacientNume = a.Pacient.Nume,
        PacientPrenume = a.Pacient.Prenume,
        TipAlerta = a.TipAlerta,
        ParametruAsociat = a.ParametruAsociat,
        PragMinim = a.PragMinim,
        PragMaxim = a.PragMaxim,
        ValoareConstatata = a.ValoareConstatata,
        DataOra = a.DataOra,
        DurataPersistentaSec = a.DurataPersistentaSec,
        Mesaj = a.Mesaj,
        Stare = a.Stare
    };
}
