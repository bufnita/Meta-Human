using MetaHuman.Backend.DTOs;
using MetaHuman.Backend.Exceptions;
using MetaHuman.Backend.Helpers;
using MetaHuman.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace MetaHuman.Backend.Services;

public class PragAlertaService
{
    private readonly MetaHumanContext _context;
    private readonly IdentitateClinicalaResolver _identitateClinicala;
    private readonly IUtilizatorCurentAccessor _utilizatorCurent;

    public PragAlertaService(
        MetaHumanContext context,
        IdentitateClinicalaResolver identitateClinicala,
        IUtilizatorCurentAccessor utilizatorCurent)
    {
        _context = context;
        _identitateClinicala = identitateClinicala;
        _utilizatorCurent = utilizatorCurent;
    }

    public async Task<RaspunsPragAlertaDTO> ConfigureazaAsync(
        int idPacient,
        CererePragAlertaDTO cerere,
        CancellationToken cancellationToken = default)
    {
        var pacient = await ObtinePacientCuAccesAsync(idPacient, cancellationToken);
        var idMedic = await RezolvaIdMedicPentruPacientAsync(pacient, cancellationToken);
        ValideazaValoriPrag(cerere);

        var prag = new PragAlerta
        {
            IdPacient = idPacient,
            IdMedic = idMedic,
            TipParametru = cerere.TipParametru.Trim(),
            ValoareMinima = cerere.ValoareMinima,
            ValoareMaxima = cerere.ValoareMaxima,
            DurataPersistentaSec = cerere.DurataPersistentaSec,
            Activ = cerere.Activ
        };

        _context.PraguriAlerta.Add(prag);
        await _context.SaveChangesAsync(cancellationToken);

        return MapLaRaspuns(prag);
    }

    public async Task<IReadOnlyList<RaspunsPragAlertaDTO>> ObtinePentruPacientAsync(
        int idPacient,
        CancellationToken cancellationToken = default)
    {
        await ObtinePacientCuAccesAsync(idPacient, cancellationToken);

        var praguri = await _context.PraguriAlerta
            .Where(p => p.IdPacient == idPacient)
            .OrderBy(p => p.TipParametru)
            .ToListAsync(cancellationToken);

        return praguri.Select(MapLaRaspuns).ToList();
    }

    public async Task<RaspunsPragAlertaDTO> ActualizeazaAsync(
        int idPacient,
        int idPrag,
        CererePragAlertaDTO cerere,
        CancellationToken cancellationToken = default)
    {
        await ObtinePacientCuAccesAsync(idPacient, cancellationToken);
        var prag = await ObtinePragPentruPacientAsync(idPacient, idPrag, cancellationToken);
        ValideazaValoriPrag(cerere);

        prag.TipParametru = cerere.TipParametru.Trim();
        prag.ValoareMinima = cerere.ValoareMinima;
        prag.ValoareMaxima = cerere.ValoareMaxima;
        prag.DurataPersistentaSec = cerere.DurataPersistentaSec;
        prag.Activ = cerere.Activ;

        await _context.SaveChangesAsync(cancellationToken);
        return MapLaRaspuns(prag);
    }

    public async Task StergeAsync(
        int idPacient,
        int idPrag,
        CancellationToken cancellationToken = default)
    {
        await ObtinePacientCuAccesAsync(idPacient, cancellationToken);
        var prag = await ObtinePragPentruPacientAsync(idPacient, idPrag, cancellationToken);

        _context.PraguriAlerta.Remove(prag);
        await _context.SaveChangesAsync(cancellationToken);
    }

    private async Task<Pacient> ObtinePacientCuAccesAsync(
        int idPacient,
        CancellationToken cancellationToken)
    {
        var pacient = await _context.Pacienti
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.IdPacient == idPacient, cancellationToken);

        if (pacient == null)
            throw new ResursaNegasitaException("Pacientul nu a fost găsit.");

        if (_utilizatorCurent.EsteAdmin)
            return pacient;

        var idMedic = await ObtineIdMedicObligatoriuAsync(cancellationToken);
        if (pacient.IdMedic != idMedic)
            throw new AccesInterzisException("Nu aveți acces la acest pacient.");

        return pacient;
    }

    private async Task<int> RezolvaIdMedicPentruPacientAsync(
        Pacient pacient,
        CancellationToken cancellationToken)
    {
        if (_utilizatorCurent.EsteAdmin)
            return pacient.IdMedic;

        var idMedic = await ObtineIdMedicObligatoriuAsync(cancellationToken);
        if (pacient.IdMedic != idMedic)
            throw new AccesInterzisException("Nu aveți acces la acest pacient.");

        return idMedic;
    }

    private async Task<int> ObtineIdMedicObligatoriuAsync(CancellationToken cancellationToken)
    {
        var idMedic = await _identitateClinicala.ObtineIdMedicCurentAsync(cancellationToken);
        if (!idMedic.HasValue)
            throw new AccesInterzisException("Profilul de medic nu a fost găsit.");

        return idMedic.Value;
    }

    private async Task<PragAlerta> ObtinePragPentruPacientAsync(
        int idPacient,
        int idPrag,
        CancellationToken cancellationToken)
    {
        var prag = await _context.PraguriAlerta
            .FirstOrDefaultAsync(
                p => p.IdPrag == idPrag && p.IdPacient == idPacient,
                cancellationToken);

        if (prag == null)
            throw new ResursaNegasitaException("Pragul de alertă nu a fost găsit.");

        return prag;
    }

    private static void ValideazaValoriPrag(CererePragAlertaDTO cerere)
    {
        var interval = cerere.TipParametru.Trim().ToLowerInvariant() switch
        {
            "puls" => (Minim: 1m, Maxim: 300m),
            "temperatura" => (Minim: 20m, Maxim: 45m),
            "ecg" => (Minim: 0m, Maxim: 1023m),
            _ => ((decimal Minim, decimal Maxim)?)null
        };

        if (interval.HasValue
            && (EsteInAfaraIntervalului(cerere.ValoareMinima, interval.Value)
                || EsteInAfaraIntervalului(cerere.ValoareMaxima, interval.Value)))
        {
            throw new InvalidOperationException(
                $"Valorile pragului pentru {cerere.TipParametru.Trim()} trebuie să fie între "
                + $"{interval.Value.Minim} și {interval.Value.Maxim}.");
        }

        if (cerere.ValoareMinima.HasValue
            && cerere.ValoareMaxima.HasValue
            && cerere.ValoareMinima.Value >= cerere.ValoareMaxima.Value)
        {
            throw new InvalidOperationException(
                "Valoarea minimă trebuie să fie mai mică decât valoarea maximă.");
        }
    }

    private static bool EsteInAfaraIntervalului(
        decimal? valoare,
        (decimal Minim, decimal Maxim) interval)
    {
        return valoare.HasValue
            && (valoare.Value < interval.Minim || valoare.Value > interval.Maxim);
    }

    private static RaspunsPragAlertaDTO MapLaRaspuns(PragAlerta p) => new()
    {
        IdPrag = p.IdPrag,
        IdPacient = p.IdPacient,
        TipParametru = p.TipParametru,
        ValoareMinima = p.ValoareMinima,
        ValoareMaxima = p.ValoareMaxima,
        DurataPersistentaSec = p.DurataPersistentaSec,
        Activ = p.Activ
    };
}
