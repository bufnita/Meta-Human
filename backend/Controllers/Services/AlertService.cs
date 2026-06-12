using MetaHuman.Backend.DTOs;
using MetaHuman.Backend.Exceptions;
using MetaHuman.Backend.Helpers;
using MetaHuman.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace MetaHuman.Backend.Services;

public class AlertService
{
    private const string StareActiva = "Activa";
    private const string StareActivaCuDiacritice = "Activă";
    private const string StareRezolvata = "Rezolvata";
    private const string StareIgnorata = "Ignorata";
    private const string TipAlertaDepasirePrag = "Depasire prag";

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
        var tipParametru = ParametruClinicHelper.NormalizeazaFaraValidare(masuratoare.TipParametru);

        var alerteActive = await _context.Alerte
            .Where(a =>
                a.IdPacient == masuratoare.IdPacient
                && (a.Stare == StareActiva || a.Stare == StareActivaCuDiacritice)
                && a.ParametruAsociat.ToLower() == tipParametru)
            .ToListAsync(cancellationToken);

        var existaModificari = RezolvaAlerteCareAuRevenitInInterval(
            alerteActive,
            masuratoare.Valoare,
            tipParametru);

        var praguri = await _context.PraguriAlerta
            .Where(p =>
                p.IdPacient == masuratoare.IdPacient
                && p.Activ
                && p.TipParametru.ToLower() == tipParametru)
            .ToListAsync(cancellationToken);

        if (praguri.Count == 0)
        {
            if (existaModificari)
            {
                await _context.SaveChangesAsync(cancellationToken);
            }

            return;
        }

        var masuratoriParametru = await _context.Masuratori
            .Where(m =>
                m.IdPacient == masuratoare.IdPacient
                && m.DataOra <= masuratoare.DataOra
                && m.TipParametru.ToLower() == tipParametru)
            .OrderByDescending(m => m.DataOra)
            .ToListAsync(cancellationToken);

        Pacient? pacient = null;

        foreach (var prag in praguri.OrderBy(p => p.DurataPersistentaSec))
        {
            if (!EsteDepasireSemnificativa(masuratoare.Valoare, prag, tipParametru))
            {
                continue;
            }

            if (!DurataPersistentaEsteRespectata(
                    masuratoriParametru,
                    prag,
                    masuratoare.DataOra,
                    tipParametru))
            {
                continue;
            }

            if (ExistaAlertaActivaPentruPrag(alerteActive, prag))
            {
                continue;
            }

            pacient ??= await _context.Pacienti
                .AsNoTracking()
                .FirstAsync(p => p.IdPacient == masuratoare.IdPacient, cancellationToken);

            var alertaNoua = new Alerta
            {
                IdPacient = masuratoare.IdPacient,
                IdMedic = pacient.IdMedic,
                TipAlerta = TipAlertaDepasirePrag,
                ParametruAsociat = tipParametru,
                PragMinim = prag.ValoareMinima,
                PragMaxim = prag.ValoareMaxima,
                ValoareConstatata = masuratoare.Valoare,
                DataOra = masuratoare.DataOra,
                DurataPersistentaSec = prag.DurataPersistentaSec,
                Mesaj = ConstruiesteMesajAlerta(masuratoare, prag),
                Stare = StareActiva
            };

            _context.Alerte.Add(alertaNoua);
            alerteActive.Add(alertaNoua);
            existaModificari = true;
        }

        if (existaModificari)
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task<IReadOnlyList<RaspunsAlertaDTO>> ObtinePentruMedicCurentAsync(
        CancellationToken cancellationToken = default)
    {
        var idMedic = await _identitateClinicala.ObtineIdMedicCurentAsync(cancellationToken);
        if (!idMedic.HasValue)
        {
            return Array.Empty<RaspunsAlertaDTO>();
        }

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
        {
            return Array.Empty<RaspunsAlertaDTO>();
        }

        var alerte = await QueryAlerte()
            .Where(a =>
                a.IdMedic == idMedic.Value
                && (a.Stare == StareActiva || a.Stare == StareActivaCuDiacritice))
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
        {
            throw new AccesInterzisException("Profilul de pacient nu a fost gasit.");
        }

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
        {
            throw new AccesInterzisException("Profilul de medic nu a fost gasit.");
        }

        var alerta = await _context.Alerte
            .Include(a => a.Pacient)
            .FirstOrDefaultAsync(a => a.IdAlerta == idAlerta, cancellationToken);

        if (alerta == null)
        {
            throw new ResursaNegasitaException("Alerta nu a fost gasita.");
        }

        if (alerta.IdMedic != idMedic.Value)
        {
            throw new AccesInterzisException("Nu aveti acces la aceasta alerta.");
        }

        return alerta;
    }

    private IQueryable<Alerta> QueryAlerte() =>
        _context.Alerte.Include(a => a.Pacient);

    private static bool DurataPersistentaEsteRespectata(
        IReadOnlyList<Masuratoare> masuratoriDescrescator,
        PragAlerta prag,
        DateTime momentCurent,
        string tipParametru)
    {
        DateTime? inceputAnormal = null;

        foreach (var masuratoare in masuratoriDescrescator)
        {
            if (!EsteDepasireSemnificativa(
                    masuratoare.Valoare,
                    prag,
                    tipParametru))
            {
                break;
            }

            inceputAnormal = masuratoare.DataOra;
        }

        if (!inceputAnormal.HasValue)
        {
            return false;
        }

        return momentCurent >= inceputAnormal.Value.AddSeconds(prag.DurataPersistentaSec);
    }

    private static bool EsteDepasireSemnificativa(
        decimal valoare,
        PragAlerta prag,
        string tipParametru)
    {
        return EsteDepasireSemnificativa(
            valoare,
            prag.ValoareMinima,
            prag.ValoareMaxima,
            tipParametru);
    }

    private static bool EsteDepasireSemnificativa(
        decimal valoare,
        decimal? pragMinim,
        decimal? pragMaxim,
        string tipParametru)
    {
        var marjaToleranta = ObtineMarjaToleranta(tipParametru);

        if (pragMinim.HasValue
            && valoare <= pragMinim.Value - marjaToleranta)
        {
            return true;
        }

        if (pragMaxim.HasValue
            && valoare >= pragMaxim.Value + marjaToleranta)
        {
            return true;
        }

        return false;
    }

    private static bool RezolvaAlerteCareAuRevenitInInterval(
        IEnumerable<Alerta> alerteActive,
        decimal valoareCurenta,
        string tipParametru)
    {
        var existaModificari = false;

        foreach (var alerta in alerteActive)
        {
            if (!EsteStareActiva(alerta.Stare))
            {
                continue;
            }

            if (EsteDepasireSemnificativa(
                    valoareCurenta,
                    alerta.PragMinim,
                    alerta.PragMaxim,
                    tipParametru))
            {
                continue;
            }

            alerta.Stare = StareRezolvata;
            existaModificari = true;
        }

        return existaModificari;
    }

    private static bool ExistaAlertaActivaPentruPrag(
        IEnumerable<Alerta> alerteActive,
        PragAlerta prag)
    {
        return alerteActive.Any(alerta =>
            EsteStareActiva(alerta.Stare)
            && ParametruClinicHelper.NormalizeazaFaraValidare(alerta.ParametruAsociat)
                == ParametruClinicHelper.NormalizeazaFaraValidare(prag.TipParametru)
            && alerta.PragMinim == prag.ValoareMinima
            && alerta.PragMaxim == prag.ValoareMaxima
            && alerta.DurataPersistentaSec == prag.DurataPersistentaSec);
    }

    private static bool EsteStareActiva(string? stare)
    {
        return string.Equals(stare, StareActiva, StringComparison.Ordinal)
            || string.Equals(stare, StareActivaCuDiacritice, StringComparison.Ordinal);
    }

    private static decimal ObtineMarjaToleranta(string tipParametru)
    {
        return ParametruClinicHelper.NormalizeazaFaraValidare(tipParametru) switch
        {
            ParametruClinicHelper.Temperatura => 0.5m,
            ParametruClinicHelper.Puls => 10m,
            ParametruClinicHelper.Ecg => 50m,
            _ => 0m
        };
    }

    private static string ConstruiesteMesajAlerta(Masuratoare masuratoare, PragAlerta prag)
    {
        var directie = prag.ValoareMaxima.HasValue && masuratoare.Valoare > prag.ValoareMaxima.Value
            ? $"a depasit maximul de {prag.ValoareMaxima.Value}"
            : $"a scazut sub minimul de {prag.ValoareMinima?.ToString() ?? "-"}";

        return $"{masuratoare.TipParametru} {directie} pentru cel putin {prag.DurataPersistentaSec} secunde. Valoare curenta: {masuratoare.Valoare} {masuratoare.UnitateMasura}.";
    }

    private static RaspunsAlertaDTO MapLaRaspuns(Alerta alerta) => new()
    {
        IdAlerta = alerta.IdAlerta,
        IdPacient = alerta.IdPacient,
        PacientNume = alerta.Pacient.Nume,
        PacientPrenume = alerta.Pacient.Prenume,
        TipAlerta = alerta.TipAlerta,
        ParametruAsociat = ParametruClinicHelper.NormalizeazaFaraValidare(alerta.ParametruAsociat),
        PragMinim = alerta.PragMinim,
        PragMaxim = alerta.PragMaxim,
        ValoareConstatata = alerta.ValoareConstatata,
        DataOra = alerta.DataOra,
        DurataPersistentaSec = alerta.DurataPersistentaSec,
        Mesaj = alerta.Mesaj,
        Stare = alerta.Stare
    };
}
